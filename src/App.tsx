import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { GameSetup } from './components/GameSetup';
import { ViewSelector } from './components/ViewSelector';
import { UpdateNotification } from './components/UpdateNotification';
import { useGame } from './hooks/useGame';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const {
    gameState,
    loading,
    error,
    startNewGame,
    updateAnswer,
    clearPlayerAnswers,
    approveAnswer,
    collectInitialBets,
    addBetsToPot,
    placeBet,
    playerFold,
    advancePhase,
    completeRound,
    startNextRound,
    resetGame,
    togglePlayerActive,
    revealQuestion,
    toggleVideoMode,
  } = useGame();

  // Auto-start game met default namen bij eerste load
  useEffect(() => {
    const autoStartGame = async () => {
      if (!gameState && !loading && !error) {
        const defaultNames = ['Kandidaat 1', 'Kandidaat 2', 'Kandidaat 3'];
        await startNewGame(defaultNames);
        setGameStarted(true);
      }
    };
    autoStartGame();
  }, [gameState, loading, error, startNewGame]);

  // Auto-update displays wanneer game state verandert
  useEffect(() => {
    if (gameState) {
      // Silent update - geen error handling om spel niet te verstoren
      invoke('update_display_values').catch(() => {
        // Display is waarschijnlijk niet geconfigureerd, negeer
      });
    }
  }, [gameState]);

  const handleStartGame = async (playerNames: string[]) => {
    try {
      await startNewGame(playerNames);
      setGameStarted(true);
    } catch (err) {
      console.error('Fout bij starten spel:', err);
      alert('Er is een fout opgetreden bij het starten van het spel');
    }
  };

  const handleUpdateAnswer = async (playerId: string, questionNumber: number, imageData: string) => {
    try {
      await updateAnswer(playerId, questionNumber, imageData);
    } catch (err) {
      console.error('Fout bij updaten antwoord:', err);
    }
  };

  const handleApproveAnswer = async (playerId: string, questionNumber: number, isCorrect: boolean) => {
    try {
      await approveAnswer(playerId, questionNumber, isCorrect);
    } catch (err) {
      console.error('Fout bij goedkeuren antwoord:', err);
      alert('Er is een fout opgetreden bij het goedkeuren van het antwoord');
    }
  };

  const handlePlaceBet = async (playerId: string, amount: number) => {
    try {
      await placeBet(playerId, amount);
    } catch (err) {
      console.error('Fout bij plaatsen inzet:', err);
      alert('Er is een fout opgetreden bij het plaatsen van de inzet');
    }
  };

  const handleFold = async (playerId: string) => {
    try {
      await playerFold(playerId);
    } catch (err) {
      console.error('Fout bij passen:', err);
      alert('Er is een fout opgetreden bij het passen');
    }
  };

  const handleAdvancePhase = async () => {
    try {
      await advancePhase();
    } catch (err) {
      console.error('Fout bij doorgaan naar volgende fase:', err);
      alert('Er is een fout opgetreden bij het doorgaan naar de volgende fase');
    }
  };

  const handleCompleteRound = async (winnerId?: string) => {
    try {
      await completeRound(winnerId);
    } catch (err) {
      console.error('Fout bij afronden ronde:', err);
      alert('Er is een fout opgetreden bij het afronden van de ronde');
    }
  };

  const handleStartNextRound = async () => {
    try {
      // Clear all player answers before starting next round
      if (gameState) {
        for (const player of gameState.players) {
          await clearPlayerAnswers(player.id);
        }
      }
      await startNextRound();
    } catch (err) {
      console.error('Fout bij starten nieuwe ronde:', err);
      alert('Er is een fout opgetreden bij het starten van een nieuwe ronde');
    }
  };

  if (loading && !gameState) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Laden...</p>
      </div>
    );
  }

  if (error && !gameState) {
    return (
      <div className="error-screen">
        <h2>Er is een fout opgetreden</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!gameStarted || !gameState) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  const handleCollectBets = async () => {
    try {
      await collectInitialBets();
    } catch (err) {
      console.error('Fout bij verzamelen inzetten:', err);
      alert('Er is een fout opgetreden bij het verzamelen van inzetten');
    }
  };

  const handleAddToPot = async () => {
    try {
      await addBetsToPot();
    } catch (err) {
      console.error('Fout bij toevoegen aan pot:', err);
      alert('Er is een fout opgetreden bij het toevoegen aan de pot');
    }
  };

  const handleResetGame = async () => {
    try {
      console.log('[App] Resetting game...');
      const result = await resetGame();
      console.log('[App] Game reset successful:', result);
      // Herlaad de hele app om terug te gaan naar setup
      console.log('[App] Reloading window...');
      window.location.reload();
    } catch (err) {
      console.error('Fout bij resetten spel:', err);
      alert('Er is een fout opgetreden bij het resetten van het spel');
    }
  };

  const handleTogglePlayerActive = async (playerId: string, isActive: boolean) => {
    try {
      await togglePlayerActive(playerId, isActive);
    } catch (err) {
      console.error('Fout bij wijzigen speler status:', err);
      alert('Er is een fout opgetreden bij het wijzigen van de speler status');
    }
  };

  return (
    <>
      <UpdateNotification />
      <ViewSelector
        gameState={gameState}
        onUpdateAnswer={handleUpdateAnswer}
        onApproveAnswer={handleApproveAnswer}
        onCollectBets={handleCollectBets}
        onAddToPot={handleAddToPot}
        onPlaceBet={handlePlaceBet}
        onFold={handleFold}
        onAdvancePhase={handleAdvancePhase}
        onCompleteRound={handleCompleteRound}
        onStartNextRound={handleStartNextRound}
        onResetGame={handleResetGame}
        onTogglePlayerActive={handleTogglePlayerActive}
        onRevealQuestion={revealQuestion}
        onToggleVideoMode={toggleVideoMode}
      />
    </>
  );
}

export default App;
