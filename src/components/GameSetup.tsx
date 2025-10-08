import { useState } from 'react';
import './GameSetup.css';

interface GameSetupProps {
  onStartGame: (playerNames: string[]) => void;
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerNames, setPlayerNames] = useState(['', '', '']);

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validNames = playerNames.filter(name => name.trim() !== '');
    if (validNames.length === 3) {
      onStartGame(validNames);
    } else {
      alert('Vul alsjeblieft 3 spelersnamen in');
    }
  };

  return (
    <div className="game-setup">
      <div className="setup-container">
        <h1 className="game-title">Met het Mes op Tafel</h1>
        <p className="game-subtitle">Nederlandse Kennisquiz met Poker-elementen</p>
        
        <form onSubmit={handleSubmit} className="setup-form">
          <h2>Spelers Invoeren</h2>
          <p className="instruction">Vul de namen in van 3 spelers:</p>
          
          {playerNames.map((name, index) => (
            <div key={index} className="player-input-group">
              <label htmlFor={`player-${index}`}>Speler {index + 1}:</label>
              <input
                id={`player-${index}`}
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`Naam speler ${index + 1}`}
                maxLength={20}
                required
              />
            </div>
          ))}
          
          <button type="submit" className="start-button">
            Start Spel
          </button>
          
          <div className="rules-summary">
            <h3>Spelregels:</h3>
            <ul>
              <li>3 spelers beginnen met €750</li>
              <li>7 rondes met 4 vragen per ronde</li>
              <li>Inzetten tussen €10 en €50</li>
              <li>Winnaar per ronde wint de pot</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}

