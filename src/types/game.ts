export interface Player {
  id: string;
  name: string;
  balance: number;
  current_bet: number;
  answers: Answer[];
  is_active: boolean;
  has_folded: boolean;
}

export interface Answer {
  question_number: number;
  image_data: string; // Base64 encoded canvas image
  is_correct: boolean | null; // null = nog niet beoordeeld
  timestamp: string;
}

export enum BettingPhase {
  Initial = "Initial",                    // Antwoorden schrijven
  CollectingBets = "CollectingBets",      // Verzamel 3x min inzet
  FirstBetting = "FirstBetting",          // 1e inzetronde
  RevealingAnswers = "RevealingAnswers",  // Antwoorden 1-voor-1
  SecondBetting = "SecondBetting",        // 2e inzetronde
  DetermineWinner = "DetermineWinner",    // Winnaar bepalen
  Completed = "Completed",                // Voltooid
}

export interface Round {
  round_number: number;
  questions_count: number; // Aantal vragen (standaard 4)
  pot: number;
  min_bet: number;
  phase: BettingPhase;
  current_player_index: number;
  dealer_index: number;
  revealed_questions: number[]; // Welke vraagnummers zijn ge-revealed (1-4)
}

export interface RoundResult {
  winner_id: string;
  winner_name: string;
  pot_amount: number;
  correct_answers: number;
  player_scores: [string, number][];
}

export interface GameState {
  game_id: string;
  players: Player[];
  current_round: Round | null;
  round_number: number;
  round_history: RoundResult[];
  created_at: string;
  is_finished: boolean;
  video_mode_active: boolean;
  video_device_id: string | null;
  writing_enabled: boolean;
}
