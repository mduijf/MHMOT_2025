import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { GameState } from '../types/game';
import { AnswerInput } from '../components/AnswerInput';
import { VideoDisplay } from '../components/VideoDisplay';
import { getServerUrl } from '../components/ServerConfig';

interface PlayerOutputProps {
  playerNumber: 1 | 2 | 3;
}

export function PlayerOutput({ playerNumber }: PlayerOutputProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const fetchState = async () => {
    try {
      // Check if we're in Tauri context
      if (window.__TAURI_INTERNALS__) {
        const state = await invoke<GameState>('get_game_state');
        setGameState(state);
      } else {
        // Gebruik geconfigureerde server URL of fallback
        const serverUrl = getServerUrl();
        const response = await fetch(`${serverUrl}/api/gamestate`);
        const data = await response.json();
        setGameState(data);
      }
    } catch (error) {
      console.error('Failed to fetch game state:', error);
    }
  };

  const handleUpdateAnswer = async (playerId: string, questionNumber: number, imageData: string) => {
    try {
      if (window.__TAURI_INTERNALS__) {
        await invoke('update_answer', { playerId, questionNumber, imageData });
        fetchState();
      } else {
        // Gebruik geconfigureerde server URL
        const serverUrl = getServerUrl();
        const response = await fetch(`${serverUrl}/api/update_answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            player_id: playerId,
            question_number: questionNumber,
            image_data: imageData,
          }),
        });
        
        if (response.ok) {
          console.log('Answer updated via HTTP API');
        } else {
          console.error('Failed to update answer via HTTP API');
        }
      }
    } catch (error) {
      console.error('Failed to update answer:', error);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 100);
    return () => clearInterval(interval);
  }, []);

  if (!gameState) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#f5f5f5',
        color: '#666',
        fontSize: '18px'
      }}>
        Loading game state...
      </div>
    );
  }

  const playerId = `player_${playerNumber - 1}`;
  
  // Als video mode actief is, toon de video display
  if (gameState.video_mode_active) {
    return <VideoDisplay deviceId={gameState.video_device_id || undefined} />;
  }
  
  return (
    <AnswerInput
      gameState={gameState}
      playerId={playerId}
      onUpdateAnswer={handleUpdateAnswer}
    />
  );
}

