import { useEffect, useRef, useState } from 'react';
import './VideoDisplay.css';

interface VideoDisplayProps {
  deviceId?: string; // Optioneel: specifiek video device ID
}

export function VideoDisplay({ deviceId: initialDeviceId }: VideoDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(initialDeviceId);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Haal beschikbare video devices op
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Vraag eerst toestemming
        await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        
        // Als er geen device geselecteerd is, gebruik de eerste
        if (!selectedDeviceId && videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error enumerating video devices:', err);
      }
    };

    getDevices();
  }, [selectedDeviceId]);

  // Start video stream met geselecteerd device
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startVideo = async () => {
      try {
        // Stop oude stream als die er is
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        // Vraag toegang tot video input (SDI-USB capture device)
        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId 
            ? { deviceId: { exact: selectedDeviceId } }
            : { 
                // Vraag de hoogste kwaliteit
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 60 }
              },
          audio: false
        };

        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(currentStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error('Error accessing video device:', err);
      }
    };

    if (selectedDeviceId) {
      startVideo();
    }

    // Cleanup: stop de video stream bij unmount of device change
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId, stream]);

  return (
    <div className="video-display-container">
      <video 
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="video-display"
      />
      <div className="video-overlay">
        <div className="video-label">📹 EXTERNE VIDEO</div>
      </div>
    </div>
  );
}

