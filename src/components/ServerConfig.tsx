import { useState, useEffect } from 'react';
import './ServerConfig.css';

const DEFAULT_SERVER = 'http://localhost:3001';
const STORAGE_KEY = 'mhmot_server_url';

export function ServerConfig() {
  const [serverUrl, setServerUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_SERVER;
  });
  const [inputValue, setInputValue] = useState(serverUrl);
  const [isEditing, setIsEditing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    // Auto-test connection on mount
    testConnection(serverUrl);
  }, []);

  const testConnection = async (url: string) => {
    setConnectionStatus('testing');
    try {
      const response = await fetch(`${url}/api/gamestate`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setConnectionStatus('success');
        return true;
      } else {
        setConnectionStatus('error');
        return false;
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setConnectionStatus('error');
      return false;
    }
  };

  const handleSave = async () => {
    // Validate URL format
    let url = inputValue.trim();
    
    // Add http:// if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }
    
    // Remove trailing slash
    url = url.replace(/\/$/, '');
    
    // Test connection
    const success = await testConnection(url);
    
    if (success) {
      setServerUrl(url);
      localStorage.setItem(STORAGE_KEY, url);
      setInputValue(url);
      setIsEditing(false);
      
      // Reload page to use new server
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      alert('Kan geen verbinding maken met deze server. Controleer het IP-adres en zorg dat de Quizmaster app draait.');
    }
  };

  const handleReset = () => {
    setInputValue(DEFAULT_SERVER);
    setServerUrl(DEFAULT_SERVER);
    localStorage.removeItem(STORAGE_KEY);
    setIsEditing(false);
    window.location.reload();
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⚙️';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing': return 'Verbinding testen...';
      case 'success': return 'Verbonden';
      case 'error': return 'Geen verbinding';
      default: return 'Niet getest';
    }
  };

  return (
    <>
      {/* Floating Settings Button */}
      <button 
        className="server-config-toggle"
        onClick={() => setShowConfig(!showConfig)}
        title="Server Instellingen"
      >
        {getStatusIcon()}
      </button>

      {/* Settings Panel */}
      {showConfig && (
        <div className="server-config-overlay" onClick={() => setShowConfig(false)}>
          <div className="server-config-panel" onClick={(e) => e.stopPropagation()}>
            <h2>🖥️ Server Instellingen</h2>
            
            <div className="server-status">
              <span className="status-indicator" data-status={connectionStatus}>
                {getStatusIcon()} {getStatusText()}
              </span>
            </div>

            {!isEditing ? (
              <div className="server-display">
                <label>Quizmaster Server:</label>
                <div className="server-url">{serverUrl}</div>
                <div className="server-actions">
                  <button onClick={() => setIsEditing(true)} className="btn-edit">
                    ✏️ Wijzigen
                  </button>
                  <button onClick={() => testConnection(serverUrl)} className="btn-test">
                    🔄 Test Verbinding
                  </button>
                </div>
              </div>
            ) : (
              <div className="server-edit">
                <label>Server IP of URL:</label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="bijv. 192.168.1.193:3001"
                  autoFocus
                />
                <div className="edit-help">
                  💡 Voer het IP-adres in van de Mac waarop de Quizmaster draait
                </div>
                <div className="server-actions">
                  <button onClick={handleSave} className="btn-save">
                    💾 Opslaan & Verbinden
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn-cancel">
                    Annuleren
                  </button>
                  <button onClick={handleReset} className="btn-reset">
                    🔄 Reset naar Localhost
                  </button>
                </div>
              </div>
            )}

            <div className="server-info">
              <h3>📋 Instructies:</h3>
              <ol>
                <li>Start de Quizmaster app op de Mac</li>
                <li>Noteer het IP-adres (bijv. 192.168.1.193)</li>
                <li>Voer het IP-adres in: <code>192.168.1.193:3001</code></li>
                <li>Klik op "Opslaan & Verbinden"</li>
                <li>De Surface tablet verbindt nu met de Mac!</li>
              </ol>
              
              <div className="ip-hint">
                <strong>💡 IP-adres vinden op Mac:</strong><br/>
                Systeemvoorkeuren → Netwerk → IP-adres
              </div>
            </div>

            <button onClick={() => setShowConfig(false)} className="btn-close">
              Sluiten
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Export utility function to get current server URL
export function getServerUrl(): string {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_SERVER;
}

