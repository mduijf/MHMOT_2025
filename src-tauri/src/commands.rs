use tauri::State;
use std::sync::{Arc, Mutex};
use crate::game::{GameState, Round, RoundResult};
use crate::display::{DisplayController, DisplayConfig};

pub struct AppState {
    pub game: Arc<Mutex<Option<GameState>>>,
}

#[tauri::command]
pub fn start_new_game(player_names: Vec<String>, state: State<AppState>) -> Result<GameState, String> {
    let mut game_state = GameState::new(player_names);
    
    // Start eerste ronde (zonder inzetten verzamelen)
    let round = Round::new(1);
    game_state.start_new_round(round);
    
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    *game_lock = Some(game_state.clone());
    
    Ok(game_state)
}

#[tauri::command]
pub fn collect_initial_bets(state: State<AppState>) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    if let Some(round) = &mut game.current_round {
        round.collect_initial_bets(&mut game.players)
            .map_err(|e| format!("Fout bij verzamelen inzetten: {}", e))?;
    }
    
    Ok(game.clone())
}

#[tauri::command]
pub fn add_bets_to_pot(state: State<AppState>) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    if let Some(round) = &mut game.current_round {
        // Voeg alle current_bets toe aan pot
        let total_bets: i32 = game.players.iter()
            .map(|p| p.current_bet)
            .sum();
        
        round.add_to_pot(total_bets);
        
        // Reset current_bet naar 0 (zijn nu in pot)
        for player in &mut game.players {
            player.current_bet = 0;
        }
    }
    
    Ok(game.clone())
}

#[tauri::command]
pub fn get_game_state(state: State<AppState>) -> Result<GameState, String> {
    let game_lock = state.game.lock().map_err(|e| e.to_string())?;
    game_lock.as_ref()
        .ok_or_else(|| "Geen actief spel".to_string())
        .cloned()
}

#[tauri::command]
pub fn update_answer(
    player_id: String,
    question_number: i32,
    image_data: String,
    state: State<AppState>,
) -> Result<GameState, String> {
    println!("[update_answer] Received: player_id={}, question_number={}, image_data_length={}", 
             player_id, question_number, image_data.len());
    
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    let player = game.players.iter_mut()
        .find(|p| p.id == player_id)
        .ok_or_else(|| format!("Speler niet gevonden: {}", player_id))?;
    
    println!("[update_answer] Found player: {} ({})", player.name, player.id);
    player.add_answer(question_number, image_data);
    println!("[update_answer] Answer added. Player now has {} answers", player.answers.len());
    
    Ok(game.clone())
}

#[tauri::command]
pub fn clear_player_answers(
    player_id: String,
    state: State<AppState>,
) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    let player = game.players.iter_mut()
        .find(|p| p.id == player_id)
        .ok_or_else(|| "Speler niet gevonden".to_string())?;
    
    player.clear_answers();
    
    Ok(game.clone())
}

#[tauri::command]
pub fn approve_answer(
    player_id: String,
    question_number: i32,
    is_correct: bool,
    state: State<AppState>,
) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    let player = game.players.iter_mut()
        .find(|p| p.id == player_id)
        .ok_or_else(|| "Speler niet gevonden".to_string())?;
    
    player.approve_answer(question_number, is_correct);
    
    Ok(game.clone())
}

#[tauri::command]
pub fn place_bet(
    player_id: String,
    amount: i32,
    state: State<AppState>,
) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    let player = game.players.iter_mut()
        .find(|p| p.id == player_id)
        .ok_or_else(|| "Speler niet gevonden".to_string())?;
    
    if let Some(round) = &mut game.current_round {
        round.process_bet(player, amount)?;
    } else {
        return Err("Geen actieve ronde".to_string());
    }
    
    Ok(game.clone())
}

#[tauri::command]
pub fn player_fold(
    player_id: String,
    state: State<AppState>,
) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    let player = game.players.iter_mut()
        .find(|p| p.id == player_id)
        .ok_or_else(|| "Speler niet gevonden".to_string())?;
    
    player.fold();
    
    Ok(game.clone())
}

#[tauri::command]
pub fn advance_phase(state: State<AppState>) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    if let Some(round) = &mut game.current_round {
        round.advance_phase();
    }
    
    Ok(game.clone())
}

#[tauri::command]
pub fn complete_round(state: State<AppState>, winner_id: Option<String>) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    if let Some(round) = &game.current_round {
        let pot_amount = round.pot;
        let winner_id_clone = winner_id.clone();
        
        let result = if let Some(ref id) = winner_id {
            // Handmatig gekozen winnaar
            let winner = game.players.iter()
                .find(|p| p.id == *id)
                .ok_or_else(|| "Winnaar niet gevonden".to_string())?;
            
            println!("Winner: {} (ID: {}), Pot: €{}", winner.name, winner.id, pot_amount);
            println!("Balance voor: €{}", winner.balance);
            
            let correct_count = winner.count_correct_answers();
            let player_scores: Vec<(String, i32)> = game.players.iter()
                .filter(|p| p.is_active && !p.has_folded)
                .map(|p| (p.id.clone(), p.count_correct_answers()))
                .collect();
            
            RoundResult {
                winner_id: winner.id.clone(),
                winner_name: winner.name.clone(),
                pot_amount,
                correct_answers: correct_count,
                player_scores,
            }
        } else {
            // Automatisch winnaar bepalen
            round.determine_winner(&game.players)
                .ok_or_else(|| "Kan winnaar niet bepalen".to_string())?
        };
        
        game.complete_round(result);
        
        // Check balance na
        if let Some(id) = winner_id_clone {
            if let Some(winner) = game.players.iter().find(|p| p.id == id) {
                println!("Balance na: €{}", winner.balance);
            }
        }
    }
    
    Ok(game.clone())
}

#[tauri::command]
pub fn start_next_round(state: State<AppState>) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    if game.is_finished {
        return Err("Spel is afgelopen".to_string());
    }
    
    let next_round_num = game.round_number + 1;
    
    if next_round_num > 7 {
        return Err("Maximum aantal rondes bereikt".to_string());
    }
    
    // Start nieuwe ronde ZONDER inzetten te verzamelen
    // Quizmaster moet handmatig op "Verzamel Inzetten" klikken
    let round = Round::new(next_round_num);
    game.start_new_round(round);
    
    Ok(game.clone())
}

#[tauri::command]
pub fn reset_game(state: State<AppState>) -> Result<GameState, String> {
    println!("[reset_game] Starting game reset...");
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    println!("[reset_game] Resetting {} players...", game.players.len());
    
    // Reset alle spelers naar startgeld en clear data
    for player in &mut game.players {
        player.balance = 750; // Start met €750
        player.current_bet = 0;
        player.has_folded = false;
        player.is_active = true;
        player.clear_answers();
        println!("[reset_game] Reset player: {} ({}), balance: €{}, answers: {}", 
                 player.name, player.id, player.balance, player.answers.len());
    }
    
    // Start nieuwe ronde 1
    game.round_number = 0;
    game.is_finished = false;
    let round = Round::new(1);
    game.start_new_round(round);
    
    println!("[reset_game] Game reset complete. Round: {}", game.round_number);
    
    Ok(game.clone())
}

// ========== DISPLAY COMMANDS ==========

#[tauri::command]
pub fn list_serial_ports() -> Result<Vec<String>, String> {
    DisplayController::list_ports()
}

#[tauri::command]
pub fn configure_display(
    config: DisplayConfig,
    display: State<DisplayController>,
) -> Result<DisplayConfig, String> {
    display.configure(config)?;
    display.get_config()
}

#[tauri::command]
pub fn get_display_config(display: State<DisplayController>) -> Result<DisplayConfig, String> {
    display.get_config()
}

#[tauri::command]
pub fn update_display_values(
    state: State<AppState>,
    display: State<DisplayController>,
) -> Result<(), String> {
    let game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_ref()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    let pot = game.current_round.as_ref().map(|r| r.pot).unwrap_or(0);
    
    // Zorg dat we 3 spelers hebben, vul aan met 0 als nodig
    let p1 = game.players.get(0).map(|p| p.balance).unwrap_or(0);
    let p2 = game.players.get(1).map(|p| p.balance).unwrap_or(0);
    let p3 = game.players.get(2).map(|p| p.balance).unwrap_or(0);
    
    display.update_displays(p1, p2, p3, pot)
}

#[tauri::command]
pub fn test_displays(display: State<DisplayController>) -> Result<(), String> {
    display.test_displays()
}

#[tauri::command]
pub fn clear_displays(display: State<DisplayController>) -> Result<(), String> {
    display.clear_displays()
}

#[tauri::command]
pub fn toggle_player_active(player_id: String, is_active: bool, state: State<AppState>) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    if let Some(player) = game.players.iter_mut().find(|p| p.id == player_id) {
        player.is_active = is_active;
        println!("[toggle_player_active] Player {} is now {}", player.name, if is_active { "ACTIVE" } else { "ELIMINATED" });
    } else {
        return Err("Speler niet gevonden".to_string());
    }
    
    Ok(game.clone())
}

#[tauri::command]
pub fn reveal_question(question_number: i32, state: State<AppState>) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    if let Some(round) = &mut game.current_round {
        // Toggle: als revealed, dan unrevealen, anders revealen
        if let Some(pos) = round.revealed_questions.iter().position(|&q| q == question_number) {
            round.revealed_questions.remove(pos);
            println!("[reveal_question] Vraag {} is nu VERBORGEN (unrevealed)", question_number);
        } else {
            round.revealed_questions.push(question_number);
            println!("[reveal_question] Vraag {} is nu ZICHTBAAR (revealed)", question_number);
        }
    } else {
        return Err("Geen actieve ronde".to_string());
    }
    
    Ok(game.clone())
}

#[tauri::command]
pub fn toggle_video_mode(state: State<AppState>) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    game.video_mode_active = !game.video_mode_active;
    
    // Automatisch schrijven blokkeren tijdens video mode, inschakelen bij uitschakelen video
    if game.video_mode_active {
        game.writing_enabled = false;
        println!("[toggle_video_mode] Video mode ACTIEF - schrijven geblokkeerd");
    } else {
        game.writing_enabled = true;
        println!("[toggle_video_mode] Video mode INACTIEF - schrijven weer toegestaan");
    }
    
    Ok(game.clone())
}

#[tauri::command]
pub fn toggle_writing(enabled: bool, state: State<AppState>) -> Result<GameState, String> {
    let mut game_lock = state.game.lock().map_err(|e| e.to_string())?;
    let game = game_lock.as_mut()
        .ok_or_else(|| "Geen actief spel".to_string())?;
    
    // Schrijven mag niet worden ingeschakeld tijdens video mode
    if enabled && game.video_mode_active {
        return Err("Schrijven kan niet worden ingeschakeld tijdens video mode".to_string());
    }
    
    game.writing_enabled = enabled;
    println!("[toggle_writing] Schrijven is nu {}", if enabled { "TOEGESTAAN" } else { "GEBLOKKEERD" });
    
    Ok(game.clone())
}

#[tauri::command]
pub async fn check_for_updates() -> Result<crate::updater::UpdateInfo, String> {
    crate::updater::check_for_updates().await
}
