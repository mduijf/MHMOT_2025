mod game;
mod commands;
mod display;
mod http_server;
mod updater;

use std::sync::{Arc, Mutex};
use commands::AppState;
use display::DisplayController;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Shared game state voor zowel Tauri commands als HTTP API
    let game_state = Arc::new(Mutex::new(None));
    let previous_game_state = Arc::new(Mutex::new(None));
    
    // Start HTTP server in background via Tauri setup
    let http_game_state = game_state.clone();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(move |app| {
            // Start HTTP server in Tauri's async context (for external displays only)
            let http_state = http_game_state.clone();
            tauri::async_runtime::spawn(async move {
                http_server::start_http_server(http_state).await;
            });
            
            // Tauri window uses built-in asset handler - no redirect needed!
            
            Ok(())
        })
        .manage(AppState {
            game: game_state,
            previous_game: previous_game_state,
        })
        .manage(DisplayController::new())
        .invoke_handler(tauri::generate_handler![
            commands::start_new_game,
            commands::get_game_state,
            commands::update_answer,
            commands::clear_player_answers,
            commands::approve_answer,
            commands::collect_initial_bets,
            commands::add_bets_to_pot,
            commands::place_bet,
            commands::player_fold,
            commands::advance_phase,
            commands::complete_round,
            commands::start_next_round,
            commands::save_state_for_undo,
            commands::undo_last_action,
            commands::set_round_number,
            commands::reset_game,
            commands::toggle_player_active,
            commands::reveal_question,
            commands::toggle_video_mode,
            commands::toggle_writing,
            commands::list_serial_ports,
            commands::configure_display,
            commands::get_display_config,
            commands::update_display_values,
            commands::test_displays,
            commands::clear_displays,
            commands::check_for_updates,
            commands::update_player_name,
            commands::set_timer,
            commands::start_timer,
            commands::stop_timer,
            commands::reset_timer,
            commands::tick_timer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
