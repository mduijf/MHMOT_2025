import { useState } from 'react';
import './BettingControls.css';

interface BettingControlsProps {
  playerId: string;
  playerBalance: number;
  minBet: number;
  onBet: (amount: number) => void;
  onFold: () => void;
  disabled?: boolean;
}

export function BettingControls({ 
  playerBalance, 
  minBet,
  onBet, 
  onFold,
  disabled = false 
}: BettingControlsProps) {
  const [betAmount, setBetAmount] = useState(minBet);

  const handleBet = () => {
    if (betAmount >= 10 && betAmount <= 50 && betAmount <= playerBalance) {
      onBet(betAmount);
    } else {
      alert('Inzet moet tussen €10 en €50 zijn en mag niet hoger zijn dan uw saldo');
    }
  };

  const quickBets = [10, 20, 30, 40, 50];

  return (
    <div className="betting-controls">
      <h3>Inzetopties</h3>
      
      <div className="quick-bets">
        {quickBets.map(amount => (
          <button
            key={amount}
            className={`quick-bet-btn ${amount > playerBalance ? 'disabled' : ''}`}
            onClick={() => setBetAmount(amount)}
            disabled={disabled || amount > playerBalance}
          >
            €{amount}
          </button>
        ))}
      </div>

      <div className="custom-bet">
        <label htmlFor="bet-amount">Aangepast bedrag:</label>
        <input
          id="bet-amount"
          type="number"
          min="10"
          max="50"
          step="10"
          value={betAmount}
          onChange={(e) => setBetAmount(parseInt(e.target.value) || 10)}
          disabled={disabled}
        />
      </div>

      <div className="action-buttons">
        <button 
          className="bet-button"
          onClick={handleBet}
          disabled={disabled}
        >
          Inzetten (€{betAmount})
        </button>
        <button 
          className="fold-button"
          onClick={onFold}
          disabled={disabled}
        >
          Passen
        </button>
      </div>

      <div className="player-info">
        <p>Beschikbaar saldo: €{playerBalance}</p>
      </div>
    </div>
  );
}

