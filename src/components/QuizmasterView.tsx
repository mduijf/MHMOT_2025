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
  onAdvancePhase: () => void;
  onCompleteRound: (winnerId?: string) => void;
  onStartNextRound: () => void;
  onResetGame: () => void;
  onTogglePlayerActive: (playerId: string, isActive: boolean) => void;
  onRevealQuestion: (questionNumber: number) => void;
  onToggleVideoMode: () => void;
}

export function QuizmasterView({
  gameState,
  onApproveAnswer,
  onCollectBets,
  onAddToPot,
  onPlaceBet,
  onPlayerFold,
  onAdvancePhase,
  onCompleteRound,
  onStartNextRound,
  onResetGame,
  onTogglePlayerActive,
  onRevealQuestion,
  onToggleVideoMode,
}: QuizmasterViewProps) {
  const { players, current_round, round_number, is_finished, writing_enabled, video_mode_active } = gameState;

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
                <h4>#{index + 1} {player.name}</h4>
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
      {/* Top Control Bar */}
      <div className="top-control-bar">
        <div className="control-group">
          <label>Ronde</label>
          <div className="round-display">{round_number} / 7</div>
        </div>

        <div className="control-group">
          <label>Pot</label>
          <div className="pot-display">€{current_round.pot}</div>
        </div>

        <div className="control-group">
          <label>Min. Inzet</label>
          <div className="min-bet-display">€{current_round.min_bet}</div>
        </div>

        <button 
          className="control-btn primary"
          onClick={onCollectBets}
          title="Verzamel 3x minimale inzet"
        >
          💰 Verzamel Inzetten (3×€{current_round.min_bet})
        </button>

        <button 
          className="control-btn success"
          onClick={onAddToPot}
          title="Voeg inzetten toe aan pot"
        >
          📥 Bij Pot
        </button>

        <button 
          className="control-btn secondary"
          onClick={onStartNextRound}
          title="Wis alle schermen en start nieuwe ronde"
        >
          🗑️ Scherm Schoon
        </button>

        <button 
          className={`control-btn ${gameState.video_mode_active ? 'warning' : 'info'}`}
          onClick={onToggleVideoMode}
          title="Schakel externe video weergave op kandidaat displays"
        >
          {gameState.video_mode_active ? '📹 Video AAN' : '📹 Video'}
        </button>

        <div className="control-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={writing_enabled}
              onChange={async (e) => {
                try {
                  await invoke('toggle_writing', { enabled: e.target.checked });
                } catch (err) {
                  console.error('Error toggling writing:', err);
                  alert(err);
                }
              }}
              disabled={video_mode_active}
            />
            ✍️ Schrijven Mag {video_mode_active && '(geblokkeerd tijdens video)'}
          </label>
        </div>

        <button 
          className="control-btn danger"
          onClick={() => {
            console.log('[QuizmasterView] Reset button clicked');
            console.log('[QuizmasterView] Calling onResetGame...');
            onResetGame();
          }}
          title="Reset naar Ronde 1"
        >
          🔄 Reset naar Ronde 1
        </button>

        <div className="phase-indicator">
          {getPhaseText(phase)}
        </div>
      </div>

      {/* Reveal Knoppen - Compact boven de spelers (Toggle: klik nogmaals om te verbergen) */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        justifyContent: 'center', 
        padding: '10px 0',
        borderBottom: '1px solid #333',
        marginBottom: '15px'
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
                padding: '6px 12px',
                fontSize: '13px',
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
              <h2>{player.name}</h2>
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
                
                {/* Afvaller Checkbox */}
                <label className="afvaller-checkbox" title="Markeer als afvaller (verschijnt niet meer in graphics)">
                  <input
                    type="checkbox"
                    checked={!player.is_active}
                    onChange={(e) => onTogglePlayerActive(player.id, !e.target.checked)}
                  />
                  <span>Afvaller</span>
                </label>
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

      {/* Bottom Control Panel */}
      <div className="bottom-control-panel">
        <div className="phase-controls">
          <div className="phase-description">
            {getPhaseDescription(phase)}
          </div>
          
          <div className="phase-actions">
            {phase === BettingPhase.Initial && (
              <button className="action-btn primary" onClick={onAdvancePhase}>
                ▶️ Start Verzamelen Inzetten
              </button>
            )}
            
            {phase === BettingPhase.CollectingBets && (
              <button className="action-btn primary" onClick={onAdvancePhase}>
                🎰 Start Eerste Inzetronde
              </button>
            )}
            
            {phase === BettingPhase.FirstBetting && (
              <button className="action-btn primary" onClick={onAdvancePhase}>
                👁️ Start Reveal Fase
              </button>
            )}
            
            {phase === BettingPhase.RevealingAnswers && (
              <button className="action-btn primary" onClick={onAdvancePhase}>
                💰 Start Tweede Inzetronde
              </button>
            )}
            
            {phase === BettingPhase.SecondBetting && (
              <button className="action-btn primary" onClick={onAdvancePhase}>
                🎯 Winnaar Bepalen
              </button>
            )}
            
            {phase === BettingPhase.DetermineWinner && (
              <div className="winner-instruction">
                <p>👆 Klik op de <strong>WIN</strong> knop bij de winnende speler</p>
              </div>
            )}
            
            {phase === BettingPhase.Completed && round_number < 7 && (
              <button className="action-btn next-round" onClick={onStartNextRound}>
                ▶️ Volgende Ronde
              </button>
            )}
          </div>
        </div>
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

function getPhaseDescription(phase: BettingPhase): string {
  switch (phase) {
    case BettingPhase.Initial: 
      return 'Kandidaten schrijven antwoorden. Beoordeel LIVE met ✓/✗.';
    case BettingPhase.CollectingBets: 
      return 'Klik "Verzamel Inzetten" om 3×min.inzet te verzamelen, dan "Bij Pot".';
    case BettingPhase.FirstBetting: 
      return 'Eerste inzetronde: Dealer begint, anderen volgen.';
    case BettingPhase.RevealingAnswers: 
      return 'Antwoorden 1-voor-1 tonen aan kandidaten met goed/fout status.';
    case BettingPhase.SecondBetting: 
      return 'Tweede inzetronde: Dealer begint opnieuw.';
    case BettingPhase.DetermineWinner: 
      return 'Bepaal winnaar handmatig op basis van goedgekeurde antwoorden.';
    case BettingPhase.Completed: 
      return 'Ronde voltooid. Klik "Volgende Ronde" om door te gaan.';
  }
}
