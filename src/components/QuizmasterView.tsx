import { useState, useEffect, useRef } from 'react';
import { GameState, BettingPhase } from '../types/game';
import { invoke } from '@tauri-apps/api/core';
import './QuizmasterView.css';

interface QuizmasterViewProps {
  gameState: GameState;
  onApproveAnswer: (playerId: string, questionNumber: number, isCorrect: boolean) => void;
  onCollectBets: () => void;
  onAddToPot: () => void;
  onPlaceBet?: (playerId: string, amount: number) => void;
  onPlayerFold: (playerId: string) => void;
  onCompleteRound: (winnerId?: string) => void;
  onStartNextRound: () => void;
  onResetGame: () => void;
  onTogglePlayerActive: (playerId: string, isActive: boolean) => void;
  onRevealQuestion: (questionNumber: number) => void;
  onToggleVideoMode: () => void;
  onSetRoundNumber: (roundNum: number) => Promise<any>;
  onUpdatePlayerName: (playerId: string, newName: string) => Promise<any>;
}

// Helper: verkrijg kandidaatnummer op basis van player.id
function getPlayerNumber(playerId: string): number {
  // player_0 = Kandidaat 1, player_1 = Kandidaat 2, player_2 = Kandidaat 3
  const match = playerId.match(/player_(\d+)/);
  if (match) {
    return parseInt(match[1]) + 1;
  }
  return 0;
}

// Bepaal wie de eerste hand heeft op basis van rondenummer
function getFirstHandPlayer(roundNumber: number, players: any[]) {
  // Basis patroon: (round - 1) % 3 = player index
  // Ronde 1, 4, 7 -> player_0 (Kandidaat 1)
  // Ronde 2, 5 -> player_1 (Kandidaat 2)
  // Ronde 3, 6 -> player_2 (Kandidaat 3)
  const basePlayerIndex = (roundNumber - 1) % 3;
  
  // Zoek de basis speler
  const basePlayerId = `player_${basePlayerIndex}`;
  const basePlayer = players.find(p => p.id === basePlayerId);
  
  // Als de basis speler actief is, gebruik die
  if (basePlayer && basePlayer.is_active) {
    return basePlayer;
  }
  
  // Anders: zoek de VOLGENDE actieve speler in circulaire rotatie
  // Start vanaf basePlayerIndex en loop door (0, 1, 2, 0, 1, 2, ...)
  for (let i = 1; i <= 3; i++) {
    const nextIndex = (basePlayerIndex + i) % 3;
    const nextPlayerId = `player_${nextIndex}`;
    const nextPlayer = players.find(p => p.id === nextPlayerId);
    
    if (nextPlayer && nextPlayer.is_active) {
      return nextPlayer;
    }
  }
  
  return null; // Geen actieve spelers
}

export function QuizmasterView({
  gameState,
  onApproveAnswer,
  onCollectBets,
  onAddToPot,
  onPlaceBet,
  onPlayerFold,
  onCompleteRound,
  onStartNextRound,
  onResetGame,
  onTogglePlayerActive,
  onRevealQuestion,
  onToggleVideoMode,
  onSetRoundNumber,
  onUpdatePlayerName,
}: QuizmasterViewProps) {
  const { players, current_round, round_number, is_finished, writing_enabled, video_mode_active, timer_seconds, timer_running } = gameState;
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [customTimerInput, setCustomTimerInput] = useState('');
  const [localTimerSeconds, setLocalTimerSeconds] = useState(timer_seconds);
  const timerIntervalRef = useRef<number | null>(null);
  
  // Sync lokale timer met backend state
  useEffect(() => {
    setLocalTimerSeconds(timer_seconds);
  }, [timer_seconds]);
  
  // Bepaal wie de eerste hand heeft
  const firstHandPlayer = getFirstHandPlayer(round_number, players);
  
  // Timer interval effect - lokaal bijhouden voor smooth updates
  useEffect(() => {
    if (timer_running) {
      timerIntervalRef.current = window.setInterval(async () => {
        // Lokaal direct updaten voor smooth weergave
        setLocalTimerSeconds(prev => prev + 1);
        
        // Backend tick voor persistentie
        try {
          await invoke('tick_timer');
        } catch (err) {
          console.error('Timer tick failed:', err);
        }
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timer_running]);
  
  // Timer handlers
  const handleTimerStart = async () => {
    try {
      await invoke('start_timer');
    } catch (err) {
      console.error('Failed to start timer:', err);
    }
  };
  
  const handleTimerStop = async () => {
    try {
      await invoke('stop_timer');
    } catch (err) {
      console.error('Failed to stop timer:', err);
    }
  };
  
  const handleTimerReset = async () => {
    try {
      await invoke('reset_timer');
    } catch (err) {
      console.error('Failed to reset timer:', err);
    }
  };
  
  const handleSetTimer = async (seconds: number) => {
    try {
      await invoke('set_timer', { seconds });
    } catch (err) {
      console.error('Failed to set timer:', err);
    }
  };
  
  const handleCustomTimerSet = async () => {
    const parts = customTimerInput.split(':');
    let totalSeconds = 0;
    
    if (parts.length === 1) {
      // Alleen seconden
      totalSeconds = parseInt(parts[0]) || 0;
    } else if (parts.length === 2) {
      // Minuten:seconden
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      totalSeconds = mins * 60 + secs;
    }
    
    if (totalSeconds > 0) {
      await handleSetTimer(totalSeconds);
      setCustomTimerInput('');
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEditName = (playerId: string, currentName: string) => {
    setEditingPlayerId(playerId);
    setEditedName(currentName);
  };

  const handleSaveName = async (playerId: string) => {
    if (editedName.trim()) {
      try {
        await onUpdatePlayerName(playerId, editedName.trim());
        setEditingPlayerId(null);
        // State wordt automatisch geüpdatet via de hook
      } catch (err) {
        console.error('Failed to update player name:', err);
        alert('Kon naam niet bijwerken');
      }
    }
    setEditingPlayerId(null);
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
    setEditedName('');
  };

  const handleChangeRound = async (newRound: number) => {
    if (newRound < 1 || newRound > 7) return;
    try {
      await onSetRoundNumber(newRound);
      // State wordt automatisch geüpdatet via de hook
    } catch (err) {
      console.error('Failed to change round:', err);
      alert('Kon rondenummer niet wijzigen');
    }
  };

  if (is_finished) {
    const winner = players.reduce((prev, current) => 
      (current.balance > prev.balance) ? current : prev
    );

    return (
      <div className="quizmaster-view">
        <div className="game-finished">
          <h1>🎉 Spel Afgelopen! 🎉</h1>
          <h2>Winnaar: {winner.name}</h2>
          <p className="final-balance">€{winner.balance}</p>
          
          <div className="final-standings">
            <h3>Eindstand:</h3>
            {players
              .sort((a, b) => b.balance - a.balance)
              .map((player, index) => (
                <div key={player.id} className="standing-row">
                  <span className="position">{index + 1}.</span>
                  <span>{player.name}</span>
                  <span className="balance">€{player.balance}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (!current_round) {
    return (
      <div className="quizmaster-view production">
        <div className="control-panel">
          <h2>🎯 Ronde {round_number} Afgerond</h2>
          <p className="info-text">Klik op "Start Nieuwe Ronde" om door te gaan</p>
          
          <button 
            className="control-btn primary"
            onClick={onStartNextRound}
            style={{ fontSize: '1.5rem', padding: '20px 40px', marginTop: '20px' }}
          >
            ▶️ Start Ronde {round_number + 1}
          </button>
          
          <button 
            className="control-btn danger"
            onClick={() => {
              console.log('[QuizmasterView] Reset Spel button clicked');
              onResetGame();
            }}
            style={{ marginTop: '10px' }}
          >
            🔄 Reset Spel
          </button>
        </div>

        <div className="player-grid">
          <h3>Huidige Stand:</h3>
          {players
            .sort((a, b) => b.balance - a.balance)
            .map((player, index) => (
              <div key={player.id} className="player-card" style={{
                background: player.has_folded ? '#2c3e50' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                opacity: player.has_folded ? 0.6 : 1
              }}>
                {editingPlayerId === player.id ? (
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName(player.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                      style={{ flex: 1, padding: '5px', fontSize: '16px' }}
                    />
                    <button onClick={() => handleSaveName(player.id)} style={{ padding: '5px 10px' }}>✓</button>
                    <button onClick={handleCancelEdit} style={{ padding: '5px 10px' }}>✕</button>
                  </div>
                ) : (
                  <h4 
                    onClick={() => handleEditName(player.id, player.name)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    title="Klik om naam te wijzigen"
                  >
                    #{index + 1} {player.name} <span style={{ fontSize: '14px', opacity: 0.7 }}>✏️</span>
                  </h4>
                )}
                <p className="balance">€{player.balance}</p>
                {player.has_folded && <span className="status-badge">Gepast</span>}
              </div>
            ))}
        </div>
      </div>
    );
  }

  const phase = current_round.phase;

  // Bereken hoogste inzet voor "MEE" functionaliteit
  const getHighestBet = () => {
    return Math.max(...players.map(p => p.current_bet), current_round.min_bet);
  };

  const handleCallBet = (playerId: string) => {
    if (!onPlaceBet) return;
    
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    const highestBet = getHighestBet();
    const amountToCall = highestBet - player.current_bet;
    
    if (amountToCall > 0) {
      onPlaceBet(playerId, amountToCall);
    }
  };

  const handleDeclareWinner = async (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    console.log(`Declaring winner: ${player?.name} (ID: ${playerId}), Pot: €${current_round.pot}`);
    
    try {
      await onCompleteRound(playerId);
      console.log('✅ Winner declared successfully! Round completed.');
      
      // Automatisch nieuwe ronde starten
      setTimeout(() => {
        onStartNextRound();
      }, 500); // Korte delay zodat de state update verwerkt wordt
    } catch (err) {
      console.error('❌ Error declaring winner:', err);
    }
  };

  return (
    <div className="quizmaster-view production">
      {/* Top Control Bar - Compact & Clean */}
      <div className="top-control-bar" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'auto auto auto 1fr auto auto auto',
        gap: '15px',
        alignItems: 'start',
        padding: '10px 15px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        marginBottom: '8px'
      }}>
        
        {/* Ronde Info + Navigatie */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#fff', opacity: 0.8, marginBottom: '2px' }}>Ronde</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => handleChangeRound(round_number - 1)}
              disabled={round_number <= 1}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: 'none', 
                color: round_number <= 1 ? '#888' : '#fff', 
                fontSize: '16px', 
                cursor: round_number <= 1 ? 'not-allowed' : 'pointer',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
              title="Vorige ronde"
            >
              ◀
            </button>
            <span style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '50px', textAlign: 'center', color: '#fff' }}>{round_number} / 7</span>
            <button 
              onClick={() => handleChangeRound(round_number + 1)}
              disabled={round_number >= 7}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: 'none', 
                color: round_number >= 7 ? '#888' : '#fff', 
                fontSize: '16px', 
                cursor: round_number >= 7 ? 'not-allowed' : 'pointer',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
              title="Volgende ronde"
            >
              ▶
            </button>
          </div>
          <div style={{ fontSize: '12px', color: '#fff', opacity: 0.9 }}>
            👋 {firstHandPlayer ? `#${getPlayerNumber(firstHandPlayer.id)} ${firstHandPlayer.name}` : '-'}
          </div>
        </div>

        {/* Timer - Compact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#fff', opacity: 0.8, marginBottom: '2px' }}>⏱️ Timer</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              minWidth: '70px',
              textAlign: 'center',
              padding: '4px 8px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              color: '#fff'
            }}>
              {formatTime(localTimerSeconds)}
            </div>
            <button onClick={handleTimerStart} disabled={timer_running} style={{ padding: '4px 10px', fontSize: '14px', background: timer_running ? '#444' : '#4CAF50', border: 'none', borderRadius: '4px', color: 'white', cursor: timer_running ? 'not-allowed' : 'pointer' }}>▶</button>
            <button onClick={handleTimerStop} disabled={!timer_running} style={{ padding: '4px 10px', fontSize: '14px', background: !timer_running ? '#444' : '#ff9800', border: 'none', borderRadius: '4px', color: 'white', cursor: !timer_running ? 'not-allowed' : 'pointer' }}>⏸</button>
            <button onClick={handleTimerReset} style={{ padding: '4px 10px', fontSize: '14px', background: '#f44336', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>🔄</button>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="text"
              value={customTimerInput}
              onChange={(e) => setCustomTimerInput(e.target.value)}
              placeholder="1:30"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCustomTimerSet(); }}
              style={{
                width: '60px',
                padding: '3px 6px',
                fontSize: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '3px',
                color: '#fff'
              }}
            />
            <button onClick={handleCustomTimerSet} style={{ padding: '3px 8px', fontSize: '11px', background: '#2196F3', border: 'none', borderRadius: '3px', color: 'white', cursor: 'pointer' }}>Set</button>
            <button onClick={() => handleSetTimer(60)} style={{ padding: '3px 6px', fontSize: '10px', background: '#555', border: 'none', borderRadius: '3px', color: 'white', cursor: 'pointer' }}>1m</button>
            <button onClick={() => handleSetTimer(90)} style={{ padding: '3px 6px', fontSize: '10px', background: '#555', border: 'none', borderRadius: '3px', color: 'white', cursor: 'pointer' }}>1:30</button>
            <button onClick={() => handleSetTimer(120)} style={{ padding: '3px 6px', fontSize: '10px', background: '#555', border: 'none', borderRadius: '3px', color: 'white', cursor: 'pointer' }}>2m</button>
          </div>
        </div>

        {/* Extra Controls - Compacter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#fff', opacity: 0.8, marginBottom: '2px' }}>Controls</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={onToggleVideoMode} title="Schakel externe video weergave" style={{ padding: '4px 8px', fontSize: '11px', background: gameState.video_mode_active ? '#ff9800' : '#546e7a', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
              {gameState.video_mode_active ? '📹 AAN' : '📹'}
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', cursor: 'pointer', fontSize: '10px', color: '#fff' }}>
              <input type="checkbox" checked={writing_enabled} onChange={async (e) => { try { await invoke('toggle_writing', { enabled: e.target.checked }); } catch (err) { console.error('Error toggling writing:', err); } }} disabled={video_mode_active} style={{ cursor: 'pointer' }} />
              ✍️ {video_mode_active ? '❌' : '✓'}
            </label>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={onStartNextRound} title="Wis alle schermen en start nieuwe ronde" style={{ padding: '4px 8px', fontSize: '11px', background: '#546e7a', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
              🗑️ Schoon
            </button>
            <button onClick={() => { onResetGame(); }} title="Reset naar Ronde 1" style={{ padding: '4px 8px', fontSize: '11px', background: '#d32f2f', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Spacer */}
        <div></div>

        {/* Pot & Inzet Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'right' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#fff', opacity: 0.8, display: 'block' }}>Pot</label>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFD700' }}>€{current_round.pot}</div>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#fff', opacity: 0.8, display: 'block' }}>Min. Inzet</label>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>€{current_round.min_bet}</div>
          </div>
        </div>

        {/* Action Buttons + Phase */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
          <div style={{ 
            padding: '4px 12px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#fff',
            marginBottom: '2px'
          }}>
            {getPhaseText(phase)}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={onCollectBets}
              title="Verzamel 3x minimale inzet"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              💰 Verzamel
            </button>
            <button 
              onClick={onAddToPot}
              title="Voeg inzetten toe aan pot"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              📥 Bij Pot
            </button>
          </div>
        </div>
      </div>

      {/* Reveal Knoppen - Compact boven de spelers (Toggle: klik nogmaals om te verbergen) */}
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        justifyContent: 'center', 
        padding: '6px 0',
        borderBottom: '1px solid #333',
        marginBottom: '8px'
      }}>
        <span style={{ fontSize: '14px', color: '#888', alignSelf: 'center', marginRight: '10px' }}>
          👁️ Reveal:
        </span>
        {Array.from({ length: current_round.questions_count }, (_, i) => {
          const questionNum = i + 1;
          const isRevealed = current_round.revealed_questions.includes(questionNum);
          return (
            <button
              key={questionNum}
              onClick={() => onRevealQuestion(questionNum)}
              title={isRevealed ? 'Klik om te verbergen' : 'Klik om te tonen'}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                background: isRevealed ? '#2d5016' : '#1a1a1a',
                color: isRevealed ? '#4CAF50' : '#888',
                border: `1px solid ${isRevealed ? '#4CAF50' : '#333'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: isRevealed ? 'bold' : 'normal',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = isRevealed ? '#66BB6A' : '#666';
                e.currentTarget.style.color = isRevealed ? '#66BB6A' : '#fff';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isRevealed ? '#4CAF50' : '#333';
                e.currentTarget.style.color = isRevealed ? '#4CAF50' : '#888';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isRevealed ? '✓' : '○'} V{questionNum}
            </button>
          );
        })}
      </div>

      {/* Player Panels */}
      <div className="players-grid">
        {players.map((player) => (
          <div 
            key={player.id} 
            className={`player-panel ${player.has_folded ? 'folded' : ''} ${player.balance <= 0 ? 'eliminated' : ''}`}
          >
            {/* Player Header */}
            <div className="player-header">
              {editingPlayerId === player.id ? (
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flex: 1 }}>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName(player.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autoFocus
                    style={{ 
                      flex: 1, 
                      padding: '4px 8px', 
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      border: '2px solid #3498db',
                      borderRadius: '4px'
                    }}
                  />
                  <button 
                    onClick={() => handleSaveName(player.id)} 
                    style={{ 
                      padding: '4px 10px', 
                      background: '#27ae60', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ✓
                  </button>
                  <button 
                    onClick={handleCancelEdit} 
                    style={{ 
                      padding: '4px 10px', 
                      background: '#e74c3c', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <h2 
                  onClick={() => handleEditName(player.id, player.name)}
                  style={{ cursor: 'pointer', margin: 0 }}
                  title="Klik om naam te wijzigen"
                >
                  #{getPlayerNumber(player.id)} {player.name} ✏️
                </h2>
              )}
              {player.balance <= 0 && (
                <span className="eliminated-badge">❌ Afgevallen</span>
              )}
            </div>

            {/* Score Display */}
            <div className="score-section">
              <label>Score</label>
              <div className="score-value">{player.balance}</div>
            </div>

            {/* Betting Info */}
            <div className="betting-section">
              <div className="bet-calculator">
                <span className="label">Huidige Inzet:</span>
                <div className="calculation">
                  <span className="total">€{player.current_bet}</span>
                </div>
              </div>

              {/* Quick Bet Buttons - Altijd zichtbaar behalve in Initial en Completed fase */}
              {onPlaceBet && phase !== BettingPhase.Initial && phase !== BettingPhase.Completed && (
                <div className="quick-bet-buttons">
                  <button 
                    className="bet-btn"
                    onClick={() => onPlaceBet(player.id, 10)}
                    disabled={player.has_folded || player.balance < 10}
                  >
                    €10
                  </button>
                  <button 
                    className="bet-btn"
                    onClick={() => onPlaceBet(player.id, 20)}
                    disabled={player.has_folded || player.balance < 20}
                  >
                    €20
                  </button>
                  <button 
                    className="bet-btn"
                    onClick={() => onPlaceBet(player.id, 30)}
                    disabled={player.has_folded || player.balance < 30}
                  >
                    €30
                  </button>
                  <button 
                    className="bet-btn"
                    onClick={() => onPlaceBet(player.id, 40)}
                    disabled={player.has_folded || player.balance < 40}
                  >
                    €40
                  </button>
                  <button 
                    className="bet-btn"
                    onClick={() => onPlaceBet(player.id, 50)}
                    disabled={player.has_folded || player.balance < 50}
                  >
                    €50
                  </button>
                </div>
              )}

              {/* Status Buttons */}
              <div className="status-buttons">
                <button 
                  className={`status-btn win ${!player.has_folded ? 'active' : ''}`}
                  title={`Kies als winnaar (krijgt €${current_round.pot})`}
                  onClick={() => handleDeclareWinner(player.id)}
                  disabled={player.has_folded}
                >
                  WIN
                </button>
                <button 
                  className={`status-btn pass ${player.has_folded ? 'active' : ''}`}
                  title="Speler past"
                  onClick={() => onPlayerFold(player.id)}
                  disabled={player.has_folded}
                >
                  PASS
                </button>
                
                {/* Afvaller Checkbox - alleen na ronde 4 */}
                {round_number > 4 && (
                  <label className="afvaller-checkbox" title="Markeer als afvaller (verschijnt niet meer in graphics)">
                    <input
                      type="checkbox"
                      checked={!player.is_active}
                      onChange={(e) => onTogglePlayerActive(player.id, !e.target.checked)}
                    />
                    <span>Afvaller</span>
                  </label>
                )}
                {onPlaceBet && phase !== BettingPhase.Initial && phase !== BettingPhase.Completed ? (
                  <button 
                    className={`status-btn mee ${!player.has_folded && player.current_bet === getHighestBet() ? 'active' : ''}`}
                    title={`Match hoogste inzet (€${getHighestBet() - player.current_bet} toevoegen)`}
                    onClick={() => handleCallBet(player.id)}
                    disabled={player.has_folded || player.current_bet >= getHighestBet()}
                  >
                    MEE
                  </button>
                ) : (
                  <button 
                    className={`status-btn mee ${!player.has_folded && player.current_bet === current_round.min_bet ? 'active' : ''}`}
                    title="Speler doet mee"
                    disabled
                  >
                    MEE
                  </button>
                )}
              </div>
            </div>

            {/* Folded Indicator */}
            {player.has_folded && (
              <div className="folded-overlay">
                <span>GEPAST</span>
              </div>
            )}

            {/* Answers Section - LIVE BEOORDELING */}
            <div className="answers-section">
              {Array.from({ length: current_round.questions_count }, (_, index) => {
                const questionNum = index + 1;
                const answer = player.answers.find(a => a.question_number === questionNum);
                const isCorrect = answer?.is_correct;
                
                // Debug: Log answer data
                if (answer && answer.image_data) {
                  console.log(`[QuizmasterView] Player ${player.name} (${player.id}), Q${questionNum}: has answer, length=${answer.image_data.length}`);
                }
                
                return (
                  <div key={questionNum} className="answer-row-compact">
                    <div className="question-number">V{questionNum}</div>
                    
                    <div className="answer-controls">
                      {/* Answer preview */}
                      <div className="answer-preview">
                        {answer && answer.image_data ? (
                          <img 
                            src={answer.image_data} 
                            alt={`Antwoord ${questionNum}`}
                            className="answer-thumbnail"
                          />
                        ) : (
                          <span className="no-answer">---</span>
                        )}
                      </div>

                      {/* LIVE APPROVAL - Altijd beschikbaar tijdens schrijven */}
                      {answer && answer.image_data && (
                        <div className="approval-controls">
                          <button
                            className={`approve-icon ${isCorrect === true ? 'active' : ''}`}
                            onClick={() => onApproveAnswer(player.id, questionNum, true)}
                            title="Goed"
                          >
                            ✓
                          </button>
                          <button
                            className={`reject-icon ${isCorrect === false ? 'active' : ''}`}
                            onClick={() => onApproveAnswer(player.id, questionNum, false)}
                            title="Fout"
                          >
                            ✗
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Score Summary */}
            <div className="score-summary">
              <span className="correct-count">
                ✓ {player.answers.filter(a => a.is_correct === true).length}
              </span>
              <span className="total-count">
                / {current_round.questions_count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getPhaseText(phase: BettingPhase): string {
  switch (phase) {
    case BettingPhase.Initial: return '✍️ SCHRIJVEN';
    case BettingPhase.CollectingBets: return '💰 VERZAMEL';
    case BettingPhase.FirstBetting: return '🎰 1e INZET';
    case BettingPhase.RevealingAnswers: return '👁️ REVEAL';
    case BettingPhase.SecondBetting: return '💰 2e INZET';
    case BettingPhase.DetermineWinner: return '🏆 WINNAAR';
    case BettingPhase.Completed: return '✅ VOLTOOID';
  }
}
