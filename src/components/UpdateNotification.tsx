import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './UpdateNotification.css';

interface UpdateInfo {
  available: boolean;
  current_version: string;
  latest_version: string;
  download_url: string;
  release_notes: string;
}

export function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const checkForUpdates = async () => {
    setChecking(true);
    setError(null);
    
    try {
      const info = await invoke<UpdateInfo>('check_for_updates');
      setUpdateInfo(info);
      
      if (info.available) {
        console.log('✅ Update beschikbaar:', info.latest_version);
      } else {
        console.log('✅ App is up-to-date');
      }
    } catch (err) {
      console.error('❌ Update check failed:', err);
      setError(String(err));
    } finally {
      setChecking(false);
    }
  };

  // Check bij opstarten
  useEffect(() => {
    checkForUpdates();
    
    // Check elke 6 uur opnieuw
    const interval = setInterval(checkForUpdates, 6 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleDownload = () => {
    if (updateInfo?.download_url) {
      window.open(updateInfo.download_url, '_blank');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Toon niets als update niet beschikbaar, dismissed, of error
  if (!updateInfo?.available || dismissed || error) {
    return null;
  }

  return (
    <div className="update-notification">
      <div className="update-content">
        <div className="update-icon">🎉</div>
        <div className="update-info">
          <h3>Nieuwe versie beschikbaar!</h3>
          <p>
            <strong>v{updateInfo.latest_version}</strong> is nu beschikbaar 
            (je hebt v{updateInfo.current_version})
          </p>
          {updateInfo.release_notes && (
            <details className="release-notes">
              <summary>Release notes</summary>
              <div className="release-notes-content">
                {updateInfo.release_notes}
              </div>
            </details>
          )}
        </div>
        <div className="update-actions">
          <button 
            className="btn-download" 
            onClick={handleDownload}
          >
            📥 Download
          </button>
          <button 
            className="btn-dismiss" 
            onClick={handleDismiss}
          >
            Later
          </button>
        </div>
      </div>
      
      {checking && (
        <div className="update-checking">
          Controleren op updates...
        </div>
      )}
    </div>
  );
}

