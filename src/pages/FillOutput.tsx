import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { GameState } from '../types/game';
import { getServerUrl } from '../components/ServerConfig';
import '../styles/fill-output.css';

// ============================================================
// POSITIES AANPASSEN - Verander deze getallen om de posities te finetunen
// Graphics overlay is 410px hoog en staat onderaan (bottom: 0)
// Y-posities zijn vanaf de BOVENKANT van de 1080px canvas
// ============================================================

// 3-SPELER MODUS (breed)
const PLAYER_1_X = 250;
const PLAYER_2_X = 800;
const PLAYER_3_X = 1340;
const ANSWER_BAR_LEFT_1 = 170;    // X-positie linker kolom (speler 1)
const ANSWER_BAR_LEFT_2 = 710;   // X-positie midden kolom (speler 2)
const ANSWER_BAR_LEFT_3 = 1254;  // X-positie rechter kolom (speler 3)

// 2-SPELER MODUS (smaller, gecentreerd) - alleen posities 2 & 3
const PLAYER_2_X_2P = 575;   // Midden positie in 2-speler modus
const PLAYER_3_X_2P = 1115;  // Rechts positie in 2-speler modus
const ANSWER_BAR_LEFT_2_2P = 585;   // X-positie midden kolom in 2-speler
const ANSWER_BAR_LEFT_3_2P = 1159;  // X-positie rechter kolom in 2-speler
const POT_X_2P = 1400;       // POT positie in 2-speler modus (meer naar links)

// Gedeelde posities
const PLAYER_Y = 668;  // Was 295, nu onderaan: 1080 - 115
const POT_X = 1660;      // POT positie in 3-speler modus
const POT_Y = 668;       // Was 295, nu onderaan: 1080 - 115
const FONT_SIZE = 35;
const FONT_FAMILY = 'Arial Black, sans-serif';

// Answer bars positie
const ANSWER_BARS_START_Y = 720; // Pas deze waarde aan om de bars te verschuiven
const ANSWER_BAR_HEIGHT = 85;    // Verticale afstand tussen bars
const ANSWER_BAR_WIDTH = 500;    // Breedte van de bars
const ANSWER_BAR_BAR_HEIGHT = 80; // Hoogte van de bars
// ============================================================

export function FillOutput() {
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

    // Poll very frequently for smooth updates (100ms = 10fps)
    fetchState();
    const interval = setInterval(fetchState, 100);

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
  const pot = gameState?.current_round?.pot || 0;
  const questionsCount = gameState?.current_round?.questions_count || 4;

  // Dynamische achtergrond op basis van aantal actieve spelers
  // Een speler is actief als: is_active=true EN balance > 0
  const activePlayers = players.filter(p => p.is_active && p.balance > 0);
  const activeCount = activePlayers.length;
  const roundNumber = gameState?.round_number || 1;
  
  let backgroundImage = '/graphics_info/BACK-03.png'; // Default: 3 spelers
  
  if (activeCount === 2) {
    backgroundImage = '/graphics_info/BACK-02.png'; // 2 spelers
  } else if (activeCount === 3) {
    backgroundImage = '/graphics_info/BACK-03.png'; // 3 spelers
  }
  // Voor toekomstig gebruik: BACK-SELECT.png voor "kijkers thuis" mode
  
  // Map players naar graphics posities
  
  // Functie om originele player index te krijgen
  const getOriginalPlayerIndex = (player: any): number => {
    if (player.id.includes('_')) {
      return parseInt(player.id.split('_')[1]);
    }
    return parseInt(player.id) - 1;
  };
  
  // Check of we in 2-speler modus moeten zijn
  const is2PlayerMode = roundNumber >= 5 && activeCount === 2;
  
  let playerPositions: Array<{player: any, originalIndex: number, isActive: boolean}> = [];
  
  if (is2PlayerMode) {
    // Rondes 5-7 met 2 spelers:
    // Sorteer actieve spelers op hun ORIGINELE positie (0, 1, 2)
    // Dan: eerste actieve → grafische positie 2, tweede actieve → grafische positie 3
    
    const sortedActivePlayers = [...activePlayers].sort((a, b) => 
      getOriginalPlayerIndex(a) - getOriginalPlayerIndex(b)
    );
    
    playerPositions = sortedActivePlayers.map((player, index) => ({
      player,
      originalIndex: index === 0 ? 2 : 3, // Eerste → pos 2, Tweede → pos 3
      isActive: true
    }));
  } else {
    // Rondes 1-4 of 3 spelers: gebruik originele player ID
    playerPositions = activePlayers.map(player => {
      const idNum = getOriginalPlayerIndex(player);
      const graphicsPosition = idNum + 1; // 0->1, 1->2, 2->3
      
      return {
        player,
        originalIndex: graphicsPosition,
        isActive: true
      };
    });
  }
  
  return (
    <div className="graphics-container">
      <div
        className="canvas-1080"
        style={{
          width: '1920px',
          height: '1080px',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          position: 'relative',
          background: '#000000'
        }}
      >
      <img
        src={`${backgroundImage}?v=12`}
        alt="background"
        style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: '50%', 
          transform: 'translateX(-50%)',
          height: '410px',
          width: 'auto',
          pointerEvents: 'none' 
        }}
      />
      {/* Bedragen - alleen actieve spelers op hun oorspronkelijke posities */}
      {playerPositions.map(({ player, originalIndex }) => {
        // Gebruik de juiste X-positie afhankelijk van 2-speler of 3-speler modus
        let x;
        const y = PLAYER_Y;
        
        if (is2PlayerMode) {
          // 2-speler modus: gebruik 2P posities
          if (originalIndex === 2) {
            x = PLAYER_2_X_2P;
          } else if (originalIndex === 3) {
            x = PLAYER_3_X_2P;
          } else {
            x = PLAYER_2_X_2P; // fallback
          }
        } else {
          // 3-speler modus: gebruik normale posities
          if (originalIndex === 1) {
            x = PLAYER_1_X;
          } else if (originalIndex === 2) {
            x = PLAYER_2_X;
          } else {
            x = PLAYER_3_X;
          }
        }
        
        const divStyle = {
          position: 'absolute' as const,
          top: `${y}px`,
          left: `${x}px`,
          transform: 'translateX(-50%)',
          fontSize: `${FONT_SIZE}px`,
          letterSpacing: '1px',
          color: '#FFFFFF',
          fontWeight: 900,
          textShadow: '2px 2px 6px rgba(0,0,0,0.95)',
          fontFamily: FONT_FAMILY
        };
        
        return (
          <div key={`balance-${player.id}`} style={divStyle}>
            {player.balance}
          </div>
        );
      })}
      
      {/* Answer bars - toon tekst, alleen kleuren bij reveal */}
      {playerPositions.map(({ player, originalIndex }) => 
        Array.from({ length: questionsCount }, (_, qIndex) => {
          const answer = player.answers.find((a: any) => a.question_number === qIndex + 1);
          const questionNum = qIndex + 1;
          const isRevealed = gameState?.current_round?.revealed_questions.includes(questionNum) || false;
          let barColor = 'transparent';
          
          // Alleen kleuren tonen als vraag is ge-revealed EN antwoord is beoordeeld
          if (isRevealed && answer && answer.is_correct !== null) {
            if (answer.is_correct === true) {
              barColor = 'rgba(76,175,80,0.85)'; // Groen
            } else if (answer.is_correct === false) {
              barColor = 'rgba(244,67,54,0.85)'; // Rood
            }
          }
          
          // Gebruik de juiste kolom positie afhankelijk van 2-speler of 3-speler modus
          let leftPos;
          if (is2PlayerMode) {
            // 2-speler modus: gebruik 2P posities
            if (originalIndex === 2) {
              leftPos = ANSWER_BAR_LEFT_2_2P; // Midden in 2P
            } else if (originalIndex === 3) {
              leftPos = ANSWER_BAR_LEFT_3_2P; // Rechts in 2P
            } else {
              leftPos = ANSWER_BAR_LEFT_2_2P; // fallback
            }
          } else {
            // 3-speler modus: gebruik normale posities
            if (originalIndex === 1) {
              leftPos = ANSWER_BAR_LEFT_1; // Links
            } else if (originalIndex === 2) {
              leftPos = ANSWER_BAR_LEFT_2; // Midden
            } else {
              leftPos = ANSWER_BAR_LEFT_3; // Rechts
            }
          }
          
          return (
            <div 
              key={`bar-${player.id}-${qIndex}`}
              style={{
                position: 'absolute',
                top: `${ANSWER_BARS_START_Y + (qIndex * ANSWER_BAR_HEIGHT)}px`,
                left: `${leftPos}px`,
                width: `${ANSWER_BAR_WIDTH}px`,
                height: `${ANSWER_BAR_BAR_HEIGHT}px`,
                background: barColor,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {answer?.image_data && (
                <img 
                  src={answer.image_data} 
                  alt={`Answer ${qIndex + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              )}
            </div>
          );
        })
      )}

      {/* Pot rechtsboven - gecentreerd in zwarte badge */}
      <div style={{
        position: 'absolute',
        top: `${POT_Y}px`,
        left: `${is2PlayerMode ? POT_X_2P : POT_X}px`,
        transform: 'translateX(-50%)',
        fontSize: `${FONT_SIZE}px`,
        letterSpacing: '1px',
        color: '#FFFFFF',
        fontWeight: 900,
        textShadow: '2px 2px 6px rgba(0,0,0,0.95)',
        fontFamily: FONT_FAMILY
      }}>
        {pot}
      </div>
      </div>
    </div>
  );
}

