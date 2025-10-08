use axum::{
    extract::State,
    http::Method,
    routing::{get, post},
    Json, Router,
};
use chrono;
use serde::Deserialize;
use std::sync::{Arc, Mutex};
use tower_http::cors::{Any, CorsLayer};

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

    let app = Router::new()
        .route("/api/gamestate", get(get_game_state))
        .route("/api/update_answer", post(update_answer))
        .layer(cors)
        .with_state(game_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .expect("Failed to bind HTTP server");
    
    println!("🚀 HTTP API server running on http://localhost:3001");
    println!("   Graphics accessible at:");
    println!("   - http://localhost:1420/fill (Vite dev server)");
    println!("   - http://localhost:1420/key (Vite dev server)");
    println!("   Player interfaces:");
    println!("   - http://localhost:1420/player1");
    println!("   - http://localhost:1420/player2");
    println!("   - http://localhost:1420/player3");
    
    axum::serve(listener, app)
        .await
        .expect("Failed to start HTTP server");
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

