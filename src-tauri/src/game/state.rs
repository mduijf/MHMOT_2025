use serde::{Deserialize, Serialize};
use super::{Player, Round, RoundResult};
use chrono::Utc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameState {
    pub game_id: String,
    pub players: Vec<Player>,
    pub current_round: Option<Round>,
    pub round_number: i32,
    pub round_history: Vec<RoundResult>,
    pub created_at: String,
    pub is_finished: bool,
    pub video_mode_active: bool, // Toggle voor externe video weergave
    pub video_device_id: Option<String>, // Optioneel: specifiek video device
    pub writing_enabled: bool, // Toggle om schrijven toe te staan
}

impl GameState {
    pub fn new(player_names: Vec<String>) -> Self {
        let game_id = format!("game_{}", Utc::now().timestamp());
        let players: Vec<Player> = player_names
            .into_iter()
            .enumerate()
            .map(|(idx, name)| Player::new(format!("player_{}", idx), name))
            .collect();

        Self {
            game_id,
            players,
            current_round: None,
            round_number: 0,
            round_history: Vec::new(),
            created_at: Utc::now().to_rfc3339(),
            is_finished: false,
            video_mode_active: false,
            video_device_id: None,
            writing_enabled: true, // Standaard aan
        }
    }

    pub fn start_new_round(&mut self, round: Round) {
        self.round_number += 1;
        
        for player in &mut self.players {
            // Markeer spelers met balance <= 0 als inactief
            if player.balance <= 0 {
                player.is_active = false;
            }
            player.reset_for_round();
        }
        
        self.current_round = Some(round);
    }

    pub fn complete_round(&mut self, result: RoundResult) {
        println!("[complete_round] Winner ID: {}, Pot: €{}", result.winner_id, result.pot_amount);
        
        if let Some(winner) = self.players.iter_mut().find(|p| p.id == result.winner_id) {
            println!("[complete_round] Found winner: {}", winner.name);
            winner.win_pot(result.pot_amount);
        } else {
            println!("[complete_round] ERROR: Winner not found!");
        }

        self.round_history.push(result);
        self.current_round = None;

        // Update is_active voor spelers met balance <= 0
        for player in &mut self.players {
            if player.balance <= 0 && player.is_active {
                println!("[complete_round] Eliminating player: {} (balance: €{})", player.name, player.balance);
                player.is_active = false;
            }
        }

        // Na ronde 4: elimineer de speler met het minste geld
        if self.round_number == 4 {
            let active_players: Vec<_> = self.players.iter_mut()
                .filter(|p| p.is_active && p.balance > 0)
                .collect();
            
            if active_players.len() > 2 {
                // Vind de speler met de laagste balance
                let min_balance = active_players.iter().map(|p| p.balance).min().unwrap_or(0);
                let loser = self.players.iter_mut()
                    .find(|p| p.is_active && p.balance == min_balance);
                
                if let Some(player) = loser {
                    println!("[complete_round] 🔴 Na ronde 4: Eliminating player with lowest balance: {} (€{})", player.name, player.balance);
                    player.is_active = false;
                }
            }
        }

        let active_players = self.players.iter().filter(|p| !p.is_eliminated()).count();
        if self.round_number >= 7 || active_players <= 1 {
            self.is_finished = true;
        }
        
        println!("[complete_round] Round completed. All balances:");
        for player in &self.players {
            println!("  - {}: €{} (active: {})", player.name, player.balance, player.is_active);
        }
    }

    pub fn get_leaderboard(&self) -> Vec<(&Player, i32)> {
        let mut leaderboard: Vec<(&Player, i32)> = self.players
            .iter()
            .map(|p| (p, p.balance))
            .collect();
        
        leaderboard.sort_by(|a, b| b.1.cmp(&a.1));
        leaderboard
    }
}
