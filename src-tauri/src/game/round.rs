use serde::{Deserialize, Serialize};
use super::Player;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum BettingPhase {
    Initial,              // Antwoorden schrijven
    CollectingBets,       // Verzamel 3x min inzet
    FirstBetting,         // 1e inzetronde (dealer eerst)
    RevealingAnswers,     // Antwoorden 1-voor-1 tonen
    SecondBetting,        // 2e inzetronde (dealer eerst)
    DetermineWinner,      // Winnaar bepalen (handmatig)
    Completed,            // Ronde voltooid
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Round {
    pub round_number: i32,
    pub questions_count: i32, // Aantal vragen per ronde
    pub pot: i32,
    pub min_bet: i32,
    pub phase: BettingPhase,
    pub current_player_index: usize,
    pub dealer_index: usize,
    pub revealed_questions: Vec<i32>, // Welke vraagnummers zijn ge-revealed (1-4)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoundResult {
    pub winner_id: String,
    pub winner_name: String,
    pub pot_amount: i32,
    pub correct_answers: i32,
    pub player_scores: Vec<(String, i32)>,
}

impl Round {
    pub fn new(round_number: i32) -> Self {
        let min_bet = match round_number {
            1 => 10,
            2 => 20,
            3 => 40,
            _ => 80,
        };

        Self {
            round_number,
            questions_count: 4, // Standaard 4 vragen per ronde
            pot: 0,
            min_bet,
            phase: BettingPhase::Initial,
            current_player_index: 0,
            dealer_index: 0,
            revealed_questions: Vec::new(), // Start met geen revealed questions
        }
    }

    pub fn collect_initial_bets(&mut self, players: &mut [Player]) -> Result<(), String> {
        for player in players.iter_mut() {
            if player.is_active && !player.is_eliminated() {
                player.place_bet(self.min_bet)?;
                // Pot wordt NIET verhoogd hier - dat gebeurt pas bij "Bij Pot"
            }
        }
        self.phase = BettingPhase::CollectingBets;
        Ok(())
    }

    pub fn advance_phase(&mut self) {
        self.phase = match self.phase {
            BettingPhase::Initial => BettingPhase::CollectingBets,
            BettingPhase::CollectingBets => BettingPhase::FirstBetting,
            BettingPhase::FirstBetting => BettingPhase::RevealingAnswers,
            BettingPhase::RevealingAnswers => BettingPhase::SecondBetting,
            BettingPhase::SecondBetting => BettingPhase::DetermineWinner,
            BettingPhase::DetermineWinner => BettingPhase::Completed,
            BettingPhase::Completed => BettingPhase::Completed,
        };
    }
    
    pub fn add_to_pot(&mut self, amount: i32) {
        self.pot += amount;
    }

    pub fn process_bet(&mut self, player: &mut Player, amount: i32) -> Result<(), String> {
        if amount < 10 || amount > 50 {
            return Err("Inzet moet tussen €10 en €50 zijn".to_string());
        }

        player.place_bet(amount)?;
        self.pot += amount;
        Ok(())
    }

    pub fn determine_winner(&self, players: &[Player]) -> Option<RoundResult> {
        let mut player_scores: Vec<(String, String, i32)> = Vec::new();

        for player in players.iter() {
            if player.is_active && !player.has_folded {
                let correct_count = player.count_correct_answers();
                player_scores.push((player.id.clone(), player.name.clone(), correct_count));
            }
        }

        if player_scores.is_empty() {
            return None;
        }

        player_scores.sort_by(|a, b| b.2.cmp(&a.2));
        let winner = &player_scores[0];

        Some(RoundResult {
            winner_id: winner.0.clone(),
            winner_name: winner.1.clone(),
            pot_amount: self.pot,
            correct_answers: winner.2,
            player_scores: player_scores.iter().map(|p| (p.0.clone(), p.2)).collect(),
        })
    }
}
