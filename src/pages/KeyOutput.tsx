import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { GameState } from '../types/game';
import { getServerUrl } from '../components/ServerConfig';
import '../styles/key-output.css';

export function KeyOutput() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fetchState = async () => {
      try {
        // Check if running in Tauri context
        if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
          const state = await invoke<GameState>('get_game_state');
          setGameState(state);
        } else {
          // Gebruik geconfigureerde server URL (voor OBS Browser Source / externe displays)
          const serverUrl = getServerUrl();
          const response = await fetch(`${serverUrl}/api/gamestate`);
          if (response.ok) {
            const state = await response.json();
            setGameState(state);
          }
        }
      } catch (err) {
        console.error('Failed to fetch game state:', err);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1000);

    return () => clearInterval(interval);
  }, []);

  // Bereken schaal voor 1920x1080 canvas
  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      setScale(Math.min(scaleX, scaleY));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Use default values if game not started yet
  const players = gameState?.players || [
    { id: 'player_0', name: 'Kandidaat 1', balance: 750, answers: [], has_folded: false, is_active: true, current_bet: 0 },
    { id: 'player_1', name: 'Kandidaat 2', balance: 750, answers: [], has_folded: false, is_active: true, current_bet: 0 },
    { id: 'player_2', name: 'Kandidaat 3', balance: 750, answers: [], has_folded: false, is_active: true, current_bet: 0 }
  ];

  // Dynamische achtergrond op basis van aantal actieve spelers
  // Een speler is actief als: is_active=true EN balance > 0
  const activePlayers = players.filter(p => p.is_active && p.balance > 0);
  const activeCount = activePlayers.length;
  
  let backgroundImage = '/graphics_info/BACK-03.png'; // Default: 3 spelers
  
  if (activeCount === 2) {
    backgroundImage = '/graphics_info/BACK-02.png'; // 2 spelers
  } else if (activeCount === 3) {
    backgroundImage = '/graphics_info/BACK-03.png'; // 3 spelers
  }
  
  // Map players naar graphics posities (gebruik player ID om positie te bepalen)
  // Momenteel niet gebruikt, maar kan later gebruikt worden voor player-specifieke rendering
  // const playerPositions = players.map((player) => {
  //   let idNum = 0;
  //   if (player.id.includes('_')) {
  //     idNum = parseInt(player.id.split('_')[1]);
  //   } else {
  //     idNum = parseInt(player.id) - 1;
  //   }
  //   return {
  //     player,
  //     originalIndex: idNum + 1,
  //     isActive: player.is_active && player.balance > 0
  //   };
  // }).filter(p => p.isActive);

  return (
    <div className="graphics-container">
      <div
        className="canvas-1080 key-output"
        style={{
          width: '1920px',
          height: '1080px',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          background: '#000000', // ZWART achtergrond
          position: 'relative'
        }}
      >
      {/* Key = alpha mask voor OBS */}
      {/* De TGA graphics in wit op zwart */}
      
      {/* TGA graphics als wit silhouet */}
      <img
        src={`${backgroundImage}?v=12`}
        alt="background key"
        style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: '50%', 
          transform: 'translateX(-50%)',
          height: '410px',
          width: 'auto',
          pointerEvents: 'none',
          filter: 'brightness(0) invert(1)' // Maak alles wit
        }}
      />
      </div>
    </div>
  );
}

