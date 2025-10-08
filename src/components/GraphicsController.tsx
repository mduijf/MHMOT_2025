import { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import './GraphicsController.css';

interface GraphicsControllerProps {
  gameState: GameState;
}

export function GraphicsController({ gameState }: GraphicsControllerProps) {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [viewMode, setViewMode] = useState<'fill' | 'key' | 'both'>('fill');

  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning) {
      interval = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimer(0);
  };
  const handleSetTime = (seconds: number) => {
    setTimer(seconds);
  };

  const openFillWindow = async () => {
    console.log('Opening fill window...');
    try {
      // Check if we're in Tauri context
      if (typeof window === 'undefined' || !window.__TAURI_INTERNALS__) {
        alert('Dit werkt alleen in de Tauri app, niet in een browser!');
        return;
      }

      const fillWindow = new WebviewWindow('fill-output', {
        url: '/fill',
        title: 'Fill Output',
        width: 1920,
        height: 1080,
        resizable: true,
        fullscreen: false,
      });
      
      fillWindow.once('tauri://created', () => {
        console.log('✅ Fill window created successfully!');
      });
      
      fillWindow.once('tauri://error', (e) => {
        console.error('❌ Error creating fill window:', e);
        alert('Error: ' + JSON.stringify(e));
      });
    } catch (error) {
      console.error('❌ Failed to open fill window:', error);
      alert('Failed to open window: ' + String(error));
    }
  };

  const openKeyWindow = async () => {
    console.log('Opening key window...');
    try {
      // Check if we're in Tauri context
      if (typeof window === 'undefined' || !window.__TAURI_INTERNALS__) {
        alert('Dit werkt alleen in de Tauri app, niet in een browser!');
        return;
      }

      const keyWindow = new WebviewWindow('key-output', {
        url: '/key',
        title: 'Key Output',
        width: 1920,
        height: 1080,
        resizable: true,
        fullscreen: false,
      });
      
      keyWindow.once('tauri://created', () => {
        console.log('✅ Key window created successfully!');
      });
      
      keyWindow.once('tauri://error', (e) => {
        console.error('❌ Error creating key window:', e);
        alert('Error: ' + JSON.stringify(e));
      });
    } catch (error) {
      console.error('❌ Failed to open key window:', error);
      alert('Failed to open window: ' + String(error));
    }
  };

  return (
    <div className="graphics-controller">
      <div className="controller-panel">
        <h2>📺 Graphics Output Controller</h2>
        
        {/* Window Controls */}
        <div className="window-controls">
          <h3>🪟 Output Windows</h3>
          <div className="button-group">
            <button onClick={openFillWindow} className="open-window-btn">
              🖼️ Open Fill Window
            </button>
            <button onClick={openKeyWindow} className="open-window-btn">
              🔑 Open Key Window
            </button>
          </div>
          <p className="hint">Open deze windows fullscreen in OBS voor live graphics!</p>
        </div>
        
        <div className="timer-controls">
          <h3>⏱️ Timer</h3>
          <div className="timer-display-large">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </div>
          <div className="button-group">
            <button onClick={handleStart} disabled={isRunning}>
              ▶️ Start
            </button>
            <button onClick={handlePause} disabled={!isRunning}>
              ⏸️ Pauze
            </button>
            <button onClick={handleReset}>
              🔄 Reset
            </button>
          </div>
          <div className="quick-times">
            <button onClick={() => handleSetTime(30)}>30s</button>
            <button onClick={() => handleSetTime(60)}>1min</button>
            <button onClick={() => handleSetTime(90)}>1:30</button>
            <button onClick={() => handleSetTime(120)}>2min</button>
          </div>
        </div>

        <div className="view-mode-selector">
          <h3>👁️ Weergave</h3>
          <div className="mode-buttons">
            <button 
              className={viewMode === 'fill' ? 'active' : ''}
              onClick={() => setViewMode('fill')}
            >
              🎨 Fill Only
            </button>
            <button 
              className={viewMode === 'key' ? 'active' : ''}
              onClick={() => setViewMode('key')}
            >
              🔲 Key Only
            </button>
            <button 
              className={viewMode === 'both' ? 'active' : ''}
              onClick={() => setViewMode('both')}
            >
              🖼️ Fill + Key
            </button>
          </div>
        </div>

        <div className="info-box">
          <h4>ℹ️ Blackmagic Output Info:</h4>
          <p>• <strong>Fill Output:</strong> SDI 1 (Full color graphics)</p>
          <p>• <strong>Key Output:</strong> SDI 2 (Alpha mask)</p>
          <p>• <strong>Resolutie:</strong> 1920x1080 (Full HD)</p>
          <p>• <strong>Framerate:</strong> 25 fps / 50i</p>
          <p className="tip">
            💡 <strong>Tip:</strong> Open deze views in separate browser vensters op fullscreen
            en gebruik de Blackmagic UltraStudio HD Mini om ze uit te sturen via SDI.
          </p>
        </div>

        <div className="url-box">
          <h4>🔗 Direct Links voor Fullscreen Output:</h4>
          <div className="url-links">
            <div>
              <strong>Fill:</strong> 
              <a href="http://localhost:1420/fill" target="_blank" rel="noopener noreferrer">
                <code>http://localhost:1420/fill</code>
              </a>
            </div>
            <div>
              <strong>Key:</strong> 
              <a href="http://localhost:1420/key" target="_blank" rel="noopener noreferrer">
                <code>http://localhost:1420/key</code>
              </a>
            </div>
            <p style={{marginTop: '15px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>
              💡 <strong>Klik op de links</strong> → Open in nieuw tabblad → Druk F11 voor fullscreen
              <br/>
              Gebruik deze fullscreen vensters als input voor je Blackmagic UltraStudio HD Mini
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="preview-container">
        {viewMode === 'fill' && (
          <div className="preview-box">
            <h3>Fill Preview</h3>
            <div className="scaled-preview">
              <iframe 
                src="/fill" 
                style={{
                  width: '1920px',
                  height: '1080px',
                  border: 'none',
                  transform: 'scale(0.8)',
                  transformOrigin: 'top left'
                }}
                title="Fill Output Preview"
              />
            </div>
          </div>
        )}
        
        {viewMode === 'key' && (
          <div className="preview-box">
            <h3>Key Preview</h3>
            <div className="scaled-preview">
              <iframe 
                src="/key" 
                style={{
                  width: '1920px',
                  height: '1080px',
                  border: 'none',
                  transform: 'scale(0.8)',
                  transformOrigin: 'top left'
                }}
                title="Key Output Preview"
              />
            </div>
          </div>
        )}
        
        {viewMode === 'both' && (
          <>
            <div className="preview-box half">
              <h3>Fill</h3>
              <div className="scaled-preview">
                <iframe 
                  src="/fill" 
                  style={{
                    width: '1920px',
                    height: '1080px',
                    border: 'none',
                    transform: 'scale(0.5)',
                    transformOrigin: 'top left'
                  }}
                  title="Fill Output Preview"
                />
              </div>
            </div>
            <div className="preview-box half">
              <h3>Key</h3>
              <div className="scaled-preview">
                <iframe 
                  src="/key" 
                  style={{
                    width: '1920px',
                    height: '1080px',
                    border: 'none',
                    transform: 'scale(0.5)',
                    transformOrigin: 'top left'
                  }}
                  title="Key Output Preview"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

