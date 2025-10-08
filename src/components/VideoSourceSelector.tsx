import { useEffect, useState } from 'react';
import './VideoSourceSelector.css';

interface VideoSourceSelectorProps {
  onSelectDevice: (deviceId: string) => void;
  currentDeviceId?: string;
}

export function VideoSourceSelector({ onSelectDevice, currentDeviceId }: VideoSourceSelectorProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Vraag eerst toestemming voor toegang tot media devices
        await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        
        // Haal alle video input devices op
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
      } catch (err) {
        console.error('Error enumerating video devices:', err);
      }
    };

    if (isOpen) {
      getDevices();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button 
        className="video-source-btn"
        onClick={() => setIsOpen(true)}
        title="Selecteer video bron"
      >
        🎥 Video Bron
      </button>
    );
  }

  return (
    <div className="video-source-selector">
      <div className="video-source-header">
        <h3>Selecteer Video Input</h3>
        <button onClick={() => setIsOpen(false)}>✕</button>
      </div>
      
      <div className="video-source-list">
        {devices.length === 0 ? (
          <p className="no-devices">Geen video devices gevonden</p>
        ) : (
          devices.map(device => (
            <button
              key={device.deviceId}
              className={`video-device-item ${currentDeviceId === device.deviceId ? 'active' : ''}`}
              onClick={() => {
                onSelectDevice(device.deviceId);
                setIsOpen(false);
              }}
            >
              <span className="device-icon">📹</span>
              <span className="device-label">{device.label || `Camera ${device.deviceId.slice(0, 8)}`}</span>
              {currentDeviceId === device.deviceId && <span className="active-badge">✓ Actief</span>}
            </button>
          ))
        )}
      </div>
      
      <div className="video-source-footer">
        <p className="info-text">
          💡 Tip: Sluit een SDI-USB capture device aan voor externe video
        </p>
      </div>
    </div>
  );
}

