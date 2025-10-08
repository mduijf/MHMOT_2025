import { useEffect, useState } from 'react';
import { GameState } from '../types/game';
import './GraphicsOutput.css';

interface GraphicsOutputProps {
  gameState: GameState;
  mode: 'fill' | 'key';
  timer?: number; // seconds
}

export function GraphicsOutput({ gameState, mode, timer = 0 }: GraphicsOutputProps) {
  const { players, current_round } = gameState;
  const [time, setTime] = useState(timer);

  useEffect(() => {
    setTime(timer);
  }, [timer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const pot = current_round?.pot || 0;
  const questionsCount = current_round?.questions_count || 4;

  // Voor KEY mode: zwart-wit alpha mask
  const isKeyMode = mode === 'key';

  return (
    <div className={`graphics-output ${isKeyMode ? 'key-mode' : 'fill-mode'}`}>
      {/* Timer rechtsboven */}
      <div className="timer-display">
        {formatTime(time)}
      </div>

      {/* Speler kaarten onderaan */}
      <div className="player-cards-container">
        {players.slice(0, 3).map((player, index) => {
          const correctAnswers = player.answers.filter(a => a.is_correct === true).length;
          
          return (
            <div key={player.id} className={`player-card card-${index + 1}`}>
              {/* Saldo bovenaan */}
              <div className="card-balance">
                €{player.balance}
              </div>

              {/* 4 antwoord balken */}
              <div className="answer-bars">
                {Array.from({ length: questionsCount }, (_, qIndex) => {
                  const answer = player.answers.find(a => a.question_number === qIndex + 1);
                  let barClass = 'empty';
                  
                  if (answer) {
                    if (answer.is_correct === true) {
                      barClass = 'correct';
                    } else if (answer.is_correct === false) {
                      barClass = 'incorrect';
                    } else {
                      barClass = 'pending';
                    }
                  }
                  
                  return (
                    <div key={qIndex} className={`answer-bar ${barClass}`} />
                  );
                })}
              </div>

              {/* Pot display bij laatste kaart */}
              {index === 2 && (
                <div className="pot-badge">
                  {pot}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Debug info (alleen in fill mode) */}
      {!isKeyMode && (
        <div className="debug-info">
          <small>Ronde: {gameState.round_number}/7 | Mode: {mode.toUpperCase()}</small>
        </div>
      )}
    </div>
  );
}

