import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { GameState } from '../types/game';

export function useGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startNewGame = async (playerNames: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const game = await invoke<GameState>('start_new_game', { playerNames });
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshGameState = async () => {
    try {
      const game = await invoke<GameState>('get_game_state');
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    }
  };

  const updateAnswer = async (playerId: string, questionNumber: number, imageData: string) => {
    try {
      const game = await invoke<GameState>('update_answer', { 
        playerId, 
        questionNumber, 
        imageData 
      });
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    }
  };

  const clearPlayerAnswers = async (playerId: string) => {
    try {
      const game = await invoke<GameState>('clear_player_answers', { playerId });
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    }
  };

  const approveAnswer = async (playerId: string, questionNumber: number, isCorrect: boolean) => {
    try {
      const game = await invoke<GameState>('approve_answer', { 
        playerId, 
        questionNumber, 
        isCorrect 
      });
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    }
  };

  const placeBet = async (playerId: string, amount: number) => {
    try {
      setLoading(true);
      setError(null);
      const game = await invoke<GameState>('place_bet', { playerId, amount });
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const playerFold = async (playerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const game = await invoke<GameState>('player_fold', { playerId });
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeRound = async (winnerId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const game = await invoke<GameState>('complete_round', { winnerId: winnerId || null });
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startNextRound = async () => {
    try {
      setLoading(true);
      setError(null);
      const game = await invoke<GameState>('start_next_round');
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const collectInitialBets = async () => {
    try {
      const game = await invoke<GameState>('collect_initial_bets');
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    }
  };

  const addBetsToPot = async () => {
    try {
      const game = await invoke<GameState>('add_bets_to_pot');
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    }
  };

  const resetGame = async () => {
    try {
      setLoading(true);
      setError(null);
      const game = await invoke<GameState>('reset_game');
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh voor live updates
  useEffect(() => {
    if (gameState && !gameState.is_finished) {
      const interval = setInterval(() => {
        refreshGameState().catch(console.error);
      }, 2000); // Elke 2 seconden refreshen

      return () => clearInterval(interval);
    }
  }, [gameState?.is_finished]);

  const togglePlayerActive = async (playerId: string, isActive: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const game = await invoke<GameState>('toggle_player_active', { playerId, isActive });
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const revealQuestion = async (questionNumber: number) => {
    try {
      setLoading(true);
      setError(null);
      const game = await invoke<GameState>('reveal_question', { questionNumber });
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleVideoMode = async () => {
    try {
      setLoading(true);
      setError(null);
      const game = await invoke<GameState>('toggle_video_mode');
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setRoundNumber = async (roundNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const game = await invoke<GameState>('set_round_number', { roundNum });
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerName = async (playerId: string, newName: string) => {
    try {
      setLoading(true);
      setError(null);
      const game = await invoke<GameState>('update_player_name', { playerId, newName });
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const undoLastAction = async () => {
    try {
      setLoading(true);
      setError(null);
      const game = await invoke<GameState>('undo_last_action');
      
      // Debug: log hoeveel antwoorden we terugkrijgen
      console.log('[UNDO Frontend] Received game state:');
      game.players.forEach(player => {
        console.log(`[UNDO Frontend]   ${player.name}: ${player.answers.length} answers`);
        player.answers.forEach(answer => {
          console.log(`[UNDO Frontend]     Q${answer.question_number}: ${answer.image_data?.length || 0} chars`);
        });
      });
      
      setGameState(game);
      return game;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    gameState,
    loading,
    error,
    startNewGame,
    refreshGameState,
    updateAnswer,
    clearPlayerAnswers,
    approveAnswer,
    collectInitialBets,
    addBetsToPot,
    placeBet,
    playerFold,
    completeRound,
    startNextRound,
    resetGame,
    togglePlayerActive,
    revealQuestion,
    toggleVideoMode,
    setRoundNumber,
    updatePlayerName,
    undoLastAction,
  };
}
