import { GameState } from '../types/game';
import { DrawingCanvas } from './DrawingCanvas';
import './AnswerInput.css';

interface AnswerInputProps {
  gameState: GameState;
  playerId: string;
  onUpdateAnswer: (playerId: string, questionNumber: number, imageData: string) => void;
}

export function AnswerInput({ gameState, playerId, onUpdateAnswer }: AnswerInputProps) {
  const player = gameState.players.find(p => p.id === playerId);
  const questionsCount = gameState.current_round?.questions_count || 4;

  console.log(`[AnswerInput] Rendering for playerId=${playerId}`);
  console.log(`[AnswerInput] Found player:`, player ? `${player.name} (${player.id}), answers: ${player.answers.length}` : 'NOT FOUND');
  if (player && player.answers.length > 0) {
    console.log(`[AnswerInput] Player ${player.name} answers:`, player.answers.map(a => `Q${a.question_number}`).join(', '));
  }

  if (!player) {
    return <div className="answer-input-error">Speler niet gevonden</div>;
  }

  const handleSave = (questionNumber: number, imageData: string) => {
    console.log(`[AnswerInput] handleSave called: playerId=${playerId}, questionNumber=${questionNumber}, imageData.length=${imageData.length}`);
    onUpdateAnswer(playerId, questionNumber, imageData);
  };

  // Get existing answer image data
  const getAnswerImage = (questionNumber: number): string | undefined => {
    const answer = player.answers.find(a => a.question_number === questionNumber);
    if (answer) {
      console.log(`[AnswerInput] getAnswerImage for player ${player.name} (${playerId}), Q${questionNumber}: found answer, length=${answer.image_data.length}`);
    }
    return answer?.image_data;
  };

  return (
    <div className="answer-input-container">
      {/* Linker kolom - Antwoorden */}
      <div className="answers-column">
        <div className="answers-list">
          {Array.from({ length: questionsCount }, (_, index) => {
            const questionNumber = index + 1;
            const answer = player.answers.find(a => a.question_number === questionNumber);
            const isRevealed = gameState.current_round?.revealed_questions.includes(questionNumber) || false;
            
            return (
              <DrawingCanvas
                key={questionNumber}
                questionNumber={questionNumber}
                playerId={playerId}
                onSave={handleSave}
                initialImage={getAnswerImage(questionNumber)}
                autoSync={true}
                isRevealed={isRevealed}
                isCorrect={answer?.is_correct ?? null}
                disabled={!gameState.writing_enabled}
              />
            );
          })}
        </div>
      </div>

      {/* Rechter kolom - Info */}
      <div className="info-column">
        {/* Ronde info */}
        <div className="round-info">
          <p className="round-number">Ronde</p>
          <p className="round-value">{gameState.round_number}/7</p>
        </div>

        {/* Balances */}
        <div className="balances-section">
          <h3>Standen</h3>
          {gameState.players.map(p => (
            <div 
              key={p.id} 
              className={`balance-item ${p.id === playerId ? 'current-player' : ''}`}
            >
              <span className="player-name">{p.name}</span>
              <span className="balance-amount">€{p.balance}</span>
            </div>
          ))}
          
          <div className="pot-item">
            <p className="pot-label">Pot</p>
            <p className="pot-amount">€{gameState.current_round?.pot || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
