use axum::{
    extract::State,
    http::{Method, StatusCode},
    response::{Html, IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use chrono;
use serde::Deserialize;
use std::sync::{Arc, Mutex};
use std::path::PathBuf;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;

use crate::game::GameState;

pub type SharedGameState = Arc<Mutex<Option<GameState>>>;

#[derive(Deserialize)]
struct UpdateAnswerRequest {
    player_id: String,
    question_number: i32,
    image_data: String,
}

// SPA fallback handler - serves index.html for all non-API routes
async fn spa_fallback() -> Response {
    let assets_dir = get_assets_dir();
    let index_path = assets_dir.join("index.html");
    
    match tokio::fs::read_to_string(&index_path).await {
        Ok(content) => Html(content).into_response(),
        Err(_) => (StatusCode::NOT_FOUND, "index.html not found").into_response(),
    }
}

pub async fn start_http_server(game_state: SharedGameState) {
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_origin(Any)
        .allow_headers(Any);

    // Determine the assets directory
    let assets_dir = get_assets_dir();
    
    let app = Router::new()
        // API routes
        .route("/api/gamestate", get(get_game_state))
        .route("/api/update_answer", post(update_answer))
        .with_state(game_state.clone())
        .layer(cors.clone())
        // Serve static files from dist directory
        .nest_service("/assets", ServeDir::new(assets_dir.join("assets")))
        .nest_service("/graphics_info", ServeDir::new(assets_dir.join("graphics_info")))
        // SPA fallback for all other routes
        .fallback(spa_fallback)
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .expect("Failed to bind HTTP server");
    
    // Get local IP address for network access
    let local_ip = get_local_ip().unwrap_or_else(|| "???".to_string());
    
    println!("🚀 HTTP Server running on port 3001");
    println!("   🖥️  Lokaal: http://localhost:3001");
    println!("   🌐 Netwerk: http://{}:3001", local_ip);
    println!();
    println!("   📺 Graphics:");
    println!("      - http://localhost:3001/fill (of http://{}:3001/fill)", local_ip);
    println!("      - http://localhost:3001/key (of http://{}:3001/key)", local_ip);
    println!("   👥 Player interfaces:");
    println!("      - http://localhost:3001/player1 (of http://{}:3001/player1)", local_ip);
    println!("      - http://localhost:3001/player2 (of http://{}:3001/player2)", local_ip);
    println!("      - http://localhost:3001/player3 (of http://{}:3001/player3)", local_ip);
    println!("   📊 API: http://localhost:3001/api/gamestate");
    
    axum::serve(listener, app)
        .await
        .expect("Failed to start HTTP server");
}

fn get_local_ip() -> Option<String> {
    use std::net::UdpSocket;
    
    // Trick: connect to a remote address to determine local IP
    // We don't actually send data, just use it to get our local interface IP
    let socket = UdpSocket::bind("0.0.0.0:0").ok()?;
    socket.connect("8.8.8.8:80").ok()?;
    socket.local_addr().ok().map(|addr| addr.ip().to_string())
}

fn get_assets_dir() -> PathBuf {
    // In development: use ../dist
    let dev_path = PathBuf::from("../dist");
    
    if dev_path.exists() {
        println!("   📁 Serving assets from: ../dist (development)");
        return dev_path;
    }
    
    // In production: try to find bundled resources
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            // Tauri dev build: check _up_/dist
            let tauri_dev = exe_dir.join("_up_/dist");
            if tauri_dev.exists() {
                println!("   📁 Serving assets from: {:?} (Tauri dev)", tauri_dev);
                return tauri_dev;
            }
            
            // macOS App Bundle: Contents/Resources/dist (Tauri bundles resources here)
            let macos_resources = exe_dir.join("../Resources/dist");
            if macos_resources.exists() {
                let canonical = std::fs::canonicalize(&macos_resources).unwrap_or(macos_resources.clone());
                println!("   📁 Serving assets from: {:?} (macOS bundle)", canonical);
                return canonical;
            }
            
            // If dist subfolder doesn't exist, check if files are directly in Resources
            let macos_resources_root = exe_dir.join("../Resources");
            if macos_resources_root.join("index.html").exists() {
                let canonical = std::fs::canonicalize(&macos_resources_root).unwrap_or(macos_resources_root.clone());
                println!("   📁 Serving assets from: {:?} (macOS Resources)", canonical);
                return canonical;
            }
            
            // Windows/Linux: try relative to exe
            let local_dist = exe_dir.join("dist");
            if local_dist.exists() {
                println!("   📁 Serving assets from: {:?} (local)", local_dist);
                return local_dist;
            }
            
            // Final debug output
            println!("   ⚠️  Assets not found!");
            println!("   🔍 Executable: {:?}", exe_path);
            println!("   🔍 Checked: {:?}", macos_resources);
            println!("   🔍 Checked: {:?}", macos_resources_root);
            
            // List what's actually in Resources
            if let Ok(entries) = std::fs::read_dir(exe_dir.join("../Resources")) {
                println!("   📂 Contents of Resources:");
                for entry in entries.flatten() {
                    println!("      - {:?}", entry.file_name());
                }
            }
        }
    }
    
    println!("   ⚠️  Using fallback: ../dist");
    dev_path
}

async fn get_game_state(
    State(game_state): State<SharedGameState>,
) -> Json<Option<GameState>> {
    let state = game_state.lock().unwrap();
    Json(state.clone())
}

async fn update_answer(
    State(game_state): State<SharedGameState>,
    Json(payload): Json<UpdateAnswerRequest>,
) -> Json<bool> {
    println!("[HTTP update_answer] Received: player_id={}, question_number={}, image_data_length={}", 
        payload.player_id, payload.question_number, payload.image_data.len());
    
    let mut state_guard = game_state.lock().unwrap();
    
    if let Some(state) = state_guard.as_mut() {
        if let Some(player) = state.players.iter_mut().find(|p| p.id == payload.player_id) {
            println!("[HTTP update_answer] Found player: {} ({})", player.name, player.id);
            
            // Remove old answer if exists
            player.answers.retain(|a| a.question_number != payload.question_number);
            
            // Add new answer
            let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
            player.answers.push(crate::game::Answer {
                question_number: payload.question_number,
                image_data: payload.image_data,
                is_correct: None,
                timestamp,
            });
            
            println!("[HTTP update_answer] Answer updated. Player now has {} answers", player.answers.len());
            return Json(true);
        } else {
            println!("[HTTP update_answer] Player not found: {}", payload.player_id);
        }
    } else {
        println!("[HTTP update_answer] No game state available");
    }
    
    Json(false)
}

