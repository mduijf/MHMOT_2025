import { Player } from '../types/game';
import './PlayerPanel.css';

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer?: boolean;
}

export function PlayerPanel({ player, isCurrentPlayer = false }: PlayerPanelProps) {
  return (
    <div className={`player-panel ${isCurrentPlayer ? 'current-player' : ''} ${player.has_folded ? 'folded' : ''}`}>
      <div className="player-name">{player.name}</div>
      <div className="player-balance">€{player.balance}</div>
      {player.current_bet > 0 && (
        <div className="player-bet">Inzet: €{player.current_bet}</div>
      )}
      {player.has_folded && (
        <div className="player-status">Gepast</div>
      )}
      {player.balance <= 0 && (
        <div className="player-status eliminated">Uitgeschakeld</div>
      )}
    </div>
  );
}

