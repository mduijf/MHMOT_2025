use axum::{
    extract::State,
    http::Method,
    routing::{get, post},
    Json, Router,
};
use chrono;
use serde::Deserialize;
use std::sync::{Arc, Mutex};
use std::path::PathBuf;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use tower::ServiceBuilder;

use crate::game::GameState;

pub type SharedGameState = Arc<Mutex<Option<GameState>>>;

#[derive(Deserialize)]
struct UpdateAnswerRequest {
    player_id: String,
    question_number: i32,
    image_data: String,
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
        .layer(cors.clone())
        .with_state(game_state.clone())
        // Serve static files from dist directory
        .nest_service("/", 
            ServiceBuilder::new()
                .layer(cors)
                .service(ServeDir::new(&assets_dir).fallback(
                    ServeDir::new(&assets_dir)
                        .append_index_html_on_directories(true)
                ))
        );

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
    // The resources are bundled in the app's resource directory
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            // macOS: Resources are in ../Resources relative to the binary
            let macos_resources = exe_dir.join("../Resources/dist");
            if macos_resources.exists() {
                println!("   📁 Serving assets from: {:?} (macOS bundle)", macos_resources);
                return macos_resources;
            }
            
            // Try relative to exe
            let local_dist = exe_dir.join("dist");
            if local_dist.exists() {
                println!("   📁 Serving assets from: {:?} (local)", local_dist);
                return local_dist;
            }
        }
    }
    
    println!("   ⚠️  Assets directory not found, using fallback: ../dist");
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

