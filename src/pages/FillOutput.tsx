import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { GameState } from '../types/game';
import '../styles/fill-output.css';

// ============================================================
// POSITIES AANPASSEN - Verander deze getallen om de posities te finetunen
// Graphics overlay is 410px hoog en staat onderaan (bottom: 0)
// Y-posities zijn vanaf de BOVENKANT van de 1080px canvas
// ============================================================
const PLAYER_1_X = 250;
const PLAYER_1_Y = 668;  // Was 295, nu onderaan: 1080 - 115
const PLAYER_2_X = 800;
const PLAYER_2_Y = 668;  // Was 295, nu onderaan: 1080 - 115
const PLAYER_3_X = 1340;
const PLAYER_3_Y = 668;  // Was 295, nu onderaan: 1080 - 115
const POT_X = 1660;
const POT_Y = 668;       // Was 295, nu onderaan: 1080 - 115
const FONT_SIZE = 35;
const FONT_FAMILY = 'Arial Black, sans-serif';

// Answer bars positie
const ANSWER_BARS_START_Y = 720; // Pas deze waarde aan om de bars te verschuiven
const ANSWER_BAR_HEIGHT = 85;    // Verticale afstand tussen bars
const ANSWER_BAR_LEFT_1 = 170;    // X-positie linker kolom (speler 1)
const ANSWER_BAR_LEFT_2 = 710;   // X-positie midden kolom (speler 2)
const ANSWER_BAR_LEFT_3 = 1254;  // X-positie rechter kolom (speler 3)
const ANSWER_BAR_WIDTH = 500;    // Breedte van de bars
const ANSWER_BAR_BAR_HEIGHT = 80; // Hoogte van de bars
// ============================================================

export function FillOutput() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timer, setTimer] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fetchState = async () => {
      try {
        // Check if running in Tauri context
        if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
          const state = await invoke<GameState>('get_game_state');
          setGameState(state);
        } else {
          // Fallback: fetch via HTTP API (voor OBS Browser Source)
          const response = await fetch('http://localhost:3001/api/gamestate');
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Dynamische achtergrond op basis van aantal actieve spelers
  // Een speler is actief als: is_active=true EN balance > 0
  const activePlayers = players.filter(p => p.is_active && p.balance > 0);
  const activeCount = activePlayers.length;
  
  console.log('FillOutput - Active players:', activeCount, activePlayers.map(p => `${p.name} (€${p.balance})`));
  
  let backgroundImage = '/graphics_info/BACK-03.png'; // Default: 3 spelers
  
  if (activeCount === 2) {
    backgroundImage = '/graphics_info/BACK-02.png'; // 2 spelers
  } else if (activeCount === 3) {
    backgroundImage = '/graphics_info/BACK-03.png'; // 3 spelers
  }
  // Voor toekomstig gebruik: BACK-SELECT.png voor "kijkers thuis" mode
  
  // Map players naar graphics posities (gebruik player ID om positie te bepalen)
  const playerPositions = players.map((player) => {
    // Haal het nummer uit het player ID
    // Formaat: "player_0" -> 0, of voor mock data: "1" -> 1
    let idNum = 0;
    if (player.id.includes('_')) {
      idNum = parseInt(player.id.split('_')[1]);
    } else {
      // Mock data gebruikt gewoon "1", "2", "3"
      idNum = parseInt(player.id) - 1; // "1" -> 0, "2" -> 1, "3" -> 2
    }
    return {
      player,
      originalIndex: idNum + 1, // 0->1, 1->2, 2->3
      isActive: player.is_active && player.balance > 0
    };
  }).filter(p => p.isActive);
  
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
        // Gebruik de oorspronkelijke player positie (1, 2, of 3)
        let x, y;
        if (originalIndex === 1) {
          x = PLAYER_1_X;
          y = PLAYER_1_Y;
        } else if (originalIndex === 2) {
          x = PLAYER_2_X;
          y = PLAYER_2_Y;
        } else {
          x = PLAYER_3_X;
          y = PLAYER_3_Y;
        }
        
        return (
          <div key={`balance-${player.id}`} style={{
            position: 'absolute',
            top: `${y}px`,
            left: `${x}px`,
            transform: 'translateX(-50%)',
            fontSize: `${FONT_SIZE}px`,
            letterSpacing: '1px',
            color: '#FFFFFF',
            fontWeight: 900,
            textShadow: '2px 2px 6px rgba(0,0,0,0.95)',
            fontFamily: FONT_FAMILY
          }}>
            {player.balance}
          </div>
        );
      })}
      
      {/* Answer bars - toon tekst, alleen kleuren bij reveal */}
      {playerPositions.map(({ player, originalIndex }) => 
        Array.from({ length: questionsCount }, (_, qIndex) => {
          const answer = player.answers.find(a => a.question_number === qIndex + 1);
          const questionNum = qIndex + 1;
          const isRevealed = gameState?.current_round?.revealed_questions.includes(questionNum) || false;
          let barColor = 'transparent';
          let textColor = '#FFFFFF';
          
          // Alleen kleuren tonen als vraag is ge-revealed EN antwoord is beoordeeld
          if (isRevealed && answer && answer.is_correct !== null) {
            if (answer.is_correct === true) {
              barColor = 'rgba(76,175,80,0.85)'; // Groen
            } else if (answer.is_correct === false) {
              barColor = 'rgba(244,67,54,0.85)'; // Rood
            }
          }
          
          // Gebruik de oorspronkelijke kolom positie
          let leftPos;
          if (originalIndex === 1) {
            leftPos = ANSWER_BAR_LEFT_1; // Links
          } else if (originalIndex === 2) {
            leftPos = ANSWER_BAR_LEFT_2; // Midden
          } else {
            leftPos = ANSWER_BAR_LEFT_3; // Rechts
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
        left: `${POT_X}px`,
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

