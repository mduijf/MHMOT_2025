use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Answer {
    pub question_number: i32,
    pub image_data: String, // Base64 encoded canvas image
    pub is_correct: Option<bool>, // None = nog niet beoordeeld
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub id: String,
    pub name: String,
    pub balance: i32,
    pub current_bet: i32,
    pub answers: Vec<Answer>,
    pub is_active: bool,
    pub has_folded: bool,
}

impl Player {
    pub fn new(id: String, name: String) -> Self {
        Self {
            id,
            name,
            balance: 750,
            current_bet: 0,
            answers: Vec::new(),
            is_active: true,
            has_folded: false,
        }
    }

    pub fn place_bet(&mut self, amount: i32) -> Result<(), String> {
        if amount > self.balance {
            return Err("Onvoldoende saldo".to_string());
        }
        
        self.balance -= amount;
        self.current_bet += amount;
        Ok(())
    }

    pub fn fold(&mut self) {
        self.has_folded = true;
        self.is_active = false;
    }

    pub fn win_pot(&mut self, pot_amount: i32) {
        println!("[win_pot] Player {} - Balance voor: €{}, Pot: €{}", self.name, self.balance, pot_amount);
        self.balance += pot_amount;
        println!("[win_pot] Player {} - Balance na: €{}", self.name, self.balance);
    }

    pub fn add_answer(&mut self, question_number: i32, image_data: String) {
        let timestamp = chrono::Utc::now().to_rfc3339();
        
        // Update bestaand antwoord of voeg nieuw toe
        if let Some(existing) = self.answers.iter_mut().find(|a| a.question_number == question_number) {
            existing.image_data = image_data;
            existing.timestamp = timestamp;
        } else {
            let answer = Answer {
                question_number,
                image_data,
                is_correct: None,
                timestamp,
            };
            self.answers.push(answer);
        }
    }

    pub fn clear_answers(&mut self) {
        self.answers.clear();
    }

    pub fn approve_answer(&mut self, question_number: i32, is_correct: bool) {
        if let Some(answer) = self.answers.iter_mut().find(|a| a.question_number == question_number) {
            answer.is_correct = Some(is_correct);
        }
    }

    pub fn count_correct_answers(&self) -> i32 {
        self.answers.iter().filter(|a| a.is_correct == Some(true)).count() as i32
    }

    pub fn reset_for_round(&mut self) {
        self.current_bet = 0;
        self.answers.clear();
        self.has_folded = false;
        // NIET is_active resetten - die blijft behouden tussen rondes!
        // is_active wordt alleen false bij handmatige eliminatie of na ronde 4
    }

    pub fn is_eliminated(&self) -> bool {
        self.balance <= 0
    }
}
