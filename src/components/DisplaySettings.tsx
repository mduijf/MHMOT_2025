import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { DisplayConfig } from '../types/display';
import './DisplaySettings.css';

export function DisplaySettings() {
  const [config, setConfig] = useState<DisplayConfig>({
    port_name: '',
    baud_rate: 9600,
    enabled: false,
  });
  const [availablePorts, setAvailablePorts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
    loadPorts();
  }, []);

  const loadConfig = async () => {
    try {
      const cfg = await invoke<DisplayConfig>('get_display_config');
      setConfig(cfg);
    } catch (err) {
      console.error('Failed to load display config:', err);
    }
  };

  const loadPorts = async () => {
    try {
      const ports = await invoke<string[]>('list_serial_ports');
      setAvailablePorts(ports);
    } catch (err) {
      console.error('Failed to list serial ports:', err);
      setMessage({ type: 'error', text: 'Kon geen seriële poorten vinden' });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      await invoke<DisplayConfig>('configure_display', { config });
      setMessage({ type: 'success', text: 'Display configuratie opgeslagen!' });
    } catch (err) {
      setMessage({ type: 'error', text: `Fout: ${err}` });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      await invoke('test_displays');
      setMessage({ type: 'success', text: 'Test verzonden! Zie je 8888, 7777, 6666, 5555?' });
    } catch (err) {
      setMessage({ type: 'error', text: `Test mislukt: ${err}` });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      await invoke('clear_displays');
      setMessage({ type: 'success', text: 'Displays gewist!' });
    } catch (err) {
      setMessage({ type: 'error', text: `Wissen mislukt: ${err}` });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      await invoke('update_display_values');
      setMessage({ type: 'success', text: 'Displays bijgewerkt met huidige spelwaarden!' });
    } catch (err) {
      setMessage({ type: 'error', text: `Update mislukt: ${err}` });
    } finally {
      setLoading(false);
    }
  };

  const openPlayerWindow = async (playerNumber: 1 | 2 | 3) => {
    try {
      console.log(`Opening player ${playerNumber} window...`);
      alert(`Opening kandidaat ${playerNumber} window...`);
      
      const webview = new WebviewWindow(`player${playerNumber}`, {
        url: `/player${playerNumber}`,
        title: `Kandidaat ${playerNumber}`,
        width: 1024,
        height: 768,
        resizable: true,
        fullscreen: false,
      });
      
      webview.once('tauri://created', () => {
        console.log('Player window created successfully');
        alert(`Kandidaat ${playerNumber} venster geopend!`);
        setMessage({ type: 'success', text: `Kandidaat ${playerNumber} venster geopend!` });
      });
      
      webview.once('tauri://error', (e) => {
        console.error('Error creating player window:', e);
        alert(`Error: ${JSON.stringify(e)}`);
        setMessage({ type: 'error', text: `Kon kandidaat ${playerNumber} venster niet openen` });
      });
    } catch (err) {
      console.error('Failed to open player window:', err);
      alert(`Failed: ${err}`);
      setMessage({ type: 'error', text: `Fout bij openen kandidaat ${playerNumber} venster: ${err}` });
    }
  };

  return (
    <div className="display-settings">
      <h2>🔢 Display Instellingen</h2>
      
      {/* Kandidaat Windows Sectie */}
      <div className="settings-section">
        <h3>📱 Kandidaat Vensters</h3>
        <p className="section-description">
          Open aparte vensters voor elke kandidaat. Deze kunnen op aparte tablets/displays worden getoond.
        </p>
        <div className="button-group">
          <button 
            className="btn-primary" 
            onClick={() => openPlayerWindow(1)}
          >
            📱 Open Kandidaat 1
          </button>
          <button 
            className="btn-primary" 
            onClick={() => openPlayerWindow(2)}
          >
            📱 Open Kandidaat 2
          </button>
          <button 
            className="btn-primary" 
            onClick={() => openPlayerWindow(3)}
          >
            📱 Open Kandidaat 3
          </button>
        </div>
      </div>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      {/* RS232 Display Sectie */}
      <h3>🔢 RS232 Display Instellingen</h3>
      
      <div className="settings-form">
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            />
            Display actief
          </label>
        </div>

        <div className="form-group">
          <label>Seriële Poort:</label>
          <select
            value={config.port_name}
            onChange={(e) => setConfig({ ...config, port_name: e.target.value })}
            disabled={!config.enabled}
          >
            <option value="">-- Selecteer een poort --</option>
            {availablePorts.map((port) => (
              <option key={port} value={port}>{port}</option>
            ))}
          </select>
          <button className="btn-secondary" onClick={loadPorts} disabled={loading}>
            🔄 Ververs Poorten
          </button>
        </div>

        <div className="form-group">
          <label>Baudrate:</label>
          <select
            value={config.baud_rate}
            onChange={(e) => setConfig({ ...config, baud_rate: parseInt(e.target.value) })}
            disabled={!config.enabled}
          >
            <option value="300">300</option>
            <option value="600">600</option>
            <option value="1200">1200</option>
            <option value="2400">2400</option>
            <option value="4800">4800</option>
            <option value="9600">9600 (aanbevolen)</option>
          </select>
        </div>

        <div className="button-group">
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={loading}
          >
            💾 Opslaan
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleTest} 
            disabled={loading || !config.enabled || !config.port_name}
          >
            🧪 Test (8888-7777-6666-5555)
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleUpdate} 
            disabled={loading || !config.enabled || !config.port_name}
          >
            📊 Update met Huidige Waarden
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleClear} 
            disabled={loading || !config.enabled || !config.port_name}
          >
            🗑️ Wis Displays
          </button>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="info-box">
          <h3>ℹ️ Display Layout:</h3>
          <div className="display-layout">
            <div className="display-item">Kandidaat 1: <span className="chars">4 karakters</span></div>
            <div className="display-item">Kandidaat 2: <span className="chars">4 karakters</span></div>
            <div className="display-item">Kandidaat 3: <span className="chars">4 karakters</span></div>
            <div className="display-item">Pot: <span className="chars">4 karakters</span></div>
          </div>
          <p className="note">
            De displays worden automatisch bijgewerkt wanneer balances of de pot verandert.
          </p>
        </div>
      </div>
    </div>
  );
}

