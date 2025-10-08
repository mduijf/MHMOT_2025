import { useState } from 'react';
import { GameState } from '../types/game';
import { QuizmasterView } from './QuizmasterView';
import { AnswerInput } from './AnswerInput';
import { DisplaySettings } from './DisplaySettings';
import { GraphicsController } from './GraphicsController';
import './ViewSelector.css';

interface ViewSelectorProps {
  gameState: GameState;
  onUpdateAnswer: (playerId: string, questionNumber: number, imageData: string) => void;
  onApproveAnswer: (playerId: string, questionNumber: number, isCorrect: boolean) => void;
  onCollectBets: () => void;
  onAddToPot: () => void;
  onPlaceBet: (playerId: string, amount: number) => void;
  onFold: (playerId: string) => void;
  onAdvancePhase: () => void;
  onCompleteRound: (winnerId?: string) => void;
  onStartNextRound: () => void;
  onResetGame: () => void;
  onTogglePlayerActive: (playerId: string, isActive: boolean) => void;
  onRevealQuestion: (questionNumber: number) => void;
  onToggleVideoMode: () => void;
}

type ViewType = 'quizmaster' | 'player1' | 'player2' | 'player3' | 'settings' | 'graphics';

export function ViewSelector(props: ViewSelectorProps) {
  const [currentView, setCurrentView] = useState<ViewType>('quizmaster');
  const { gameState } = props;

  const renderView = () => {
    switch (currentView) {
      case 'quizmaster':
        return (
          <QuizmasterView
            gameState={gameState}
            onApproveAnswer={props.onApproveAnswer}
            onCollectBets={props.onCollectBets}
            onAddToPot={props.onAddToPot}
            onPlaceBet={props.onPlaceBet}
            onRevealQuestion={props.onRevealQuestion}
            onPlayerFold={props.onFold}
            onAdvancePhase={props.onAdvancePhase}
            onCompleteRound={props.onCompleteRound}
            onStartNextRound={props.onStartNextRound}
            onResetGame={props.onResetGame}
            onTogglePlayerActive={props.onTogglePlayerActive}
            onToggleVideoMode={props.onToggleVideoMode}
          />
        );
      
      case 'player1':
      case 'player2':
      case 'player3': {
        // Gebruik player ID in plaats van array index!
        // player1 -> player_0, player2 -> player_1, player3 -> player_2
        const playerNumber = parseInt(currentView.replace('player', '')); // 1, 2, 3
        const playerId = `player_${playerNumber - 1}`; // player_0, player_1, player_2
        const player = gameState.players.find(p => p.id === playerId);
        
        console.log(`[ViewSelector] Rendering ${currentView}: playerNumber=${playerNumber}, playerId=${playerId}, found player:`, player?.name);
        
        if (!player || !gameState.current_round) return null;
        
        return (
          <AnswerInput
            key={player.id} // Force remount when switching players!
            gameState={gameState}
            playerId={player.id}
            onUpdateAnswer={props.onUpdateAnswer}
          />
        );
      }

      case 'settings':
        return <DisplaySettings />;
      
      case 'graphics':
        return <GraphicsController gameState={gameState} />;
    }
  };

  const isPlayerView = currentView === 'player1' || currentView === 'player2' || currentView === 'player3';
  
  return (
    <div className={`view-selector-container ${isPlayerView ? 'player-view' : ''}`}>
      <div className="view-tabs">
        <button
          className={`tab ${currentView === 'quizmaster' ? 'active' : ''}`}
          onClick={() => setCurrentView('quizmaster')}
        >
          🎙️ Quizmaster
        </button>
        <button
          className={`tab ${currentView === 'player1' ? 'active' : ''}`}
          onClick={() => setCurrentView('player1')}
        >
          📱 {gameState.players[0]?.name || 'Speler 1'}
        </button>
        <button
          className={`tab ${currentView === 'player2' ? 'active' : ''}`}
          onClick={() => setCurrentView('player2')}
        >
          📱 {gameState.players[1]?.name || 'Speler 2'}
        </button>
        <button
          className={`tab ${currentView === 'player3' ? 'active' : ''}`}
          onClick={() => setCurrentView('player3')}
        >
          📱 {gameState.players[2]?.name || 'Speler 3'}
        </button>
        <button
          className={`tab ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentView('settings')}
        >
          ⚙️ Displays
        </button>
        <button
          className={`tab ${currentView === 'graphics' ? 'active' : ''}`}
          onClick={() => setCurrentView('graphics')}
        >
          📺 Graphics (Fill/Key)
        </button>
      </div>

      <div className="view-content">
        {renderView()}
      </div>
    </div>
  );
}

