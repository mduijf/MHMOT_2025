import { useEffect, useRef, useState } from 'react';
import './DrawingCanvas.css';

interface DrawingCanvasProps {
  questionNumber: number;
  playerId: string;
  onSave: (questionNumber: number, imageData: string) => void;
  initialImage?: string;
  autoSync?: boolean; // Auto-sync na elke stroke
  isRevealed?: boolean;
  isCorrect?: boolean | null;
  disabled?: boolean; // Blokkeer schrijven en wissen
}

export function DrawingCanvas({ 
  questionNumber, 
  playerId, 
  onSave, 
  initialImage,
  autoSync = true,
  isRevealed = false,
  isCorrect = null,
  disabled = false
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const syncTimeoutRef = useRef<number>();
  const rafRef = useRef<number>();
  const needsSyncRef = useRef(false);
  const lastPosRef = useRef<{x: number, y: number} | null>(null);
  const loadedImageRef = useRef<string>(''); // Track welke image we hebben geladen
  const hasDrawnRef = useRef(false); // Track of de user daadwerkelijk heeft getekend
  const currentPathRef = useRef<Path2D | null>(null); // Track het huidige pad

  // Setup canvas - alleen 1x bij mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 150;

    // Drawing settings
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []); // Geen dependencies - alleen bij mount

  // Load initial image - maar niet tijdens tekenen EN alleen als de image echt is veranderd
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Alleen laden als we niet aan het tekenen zijn EN de image is anders dan de laatst geladen
    if (!isDrawing && initialImage && initialImage.length > 0 && initialImage !== loadedImageRef.current) {
      console.log(`[DrawingCanvas] Loading initial image for question ${questionNumber}, length=${initialImage.length}`);
      hasDrawnRef.current = false; // Reset DIRECT - user heeft niet getekend
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        loadedImageRef.current = initialImage; // Markeer deze image als geladen
      };
      img.src = initialImage;
    }
  }, [initialImage, isDrawing, questionNumber]);

  // Animation loop voor snelle sync
  useEffect(() => {
    const syncLoop = () => {
      // Only sync if user has drawn AND needs sync
      if (needsSyncRef.current && autoSync && hasDrawnRef.current) {
        saveCanvas();
        needsSyncRef.current = false;
      }
      rafRef.current = requestAnimationFrame(syncLoop);
    };
    
    rafRef.current = requestAnimationFrame(syncLoop);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [autoSync]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return; // Blokkeer schrijven als disabled
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      
      // Log touchType voor debugging
      const touchType = (touch as any).touchType;
      if (touchType) {
        console.log('[DrawingCanvas] Touch type:', touchType);
      }
      
      // Check touchType: "stylus" voor Apple Pencil, "direct" voor vinger
      // Als touchType undefined is (oudere browsers), accepteer alle touches
      if (touchType === 'direct') {
        console.log('[DrawingCanvas] Ignoring finger touch');
        return; // Negeer alleen expliciete vinger touches
      }
      
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      // Mouse event (voor development op desktop)
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setIsDrawing(true);
    hasDrawnRef.current = true; // Mark that user has actively drawn

    // Schaal naar canvas resolutie
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    // Maak een nieuw Path2D object voor dit stroke
    const path = new Path2D();
    path.moveTo(x, y);
    path.lineTo(x + 0.5, y + 0.5); // Minimale lijn voor zichtbaarheid
    
    // Teken het path
    ctx.stroke(path);
    
    // Sla het path op voor verdere gebruik
    currentPathRef.current = path;
    lastPosRef.current = { x, y };
    
    // Markeer voor sync
    needsSyncRef.current = true;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const path = currentPathRef.current;
    
    if (!path) return; // Geen actief path

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      
      // Check touchType: "stylus" voor Apple Pencil, "direct" voor vinger
      const touchType = (touch as any).touchType;
      if (touchType === 'direct') {
        return; // Negeer alleen expliciete vinger touches
      }
      
      e.preventDefault(); // Prevent scrolling while drawing
      
      // Gebruik coalesced events voor betere precisie bij snelle bewegingen
      // @ts-ignore - getCoalescedEvents is niet in alle type definitions
      const events = e.nativeEvent.getCoalescedEvents ? e.nativeEvent.getCoalescedEvents() : [e.nativeEvent];
      
      // Voeg alle gemiste tussenliggende punten toe aan het path
      for (const event of events) {
        const coalescedTouch = event.touches ? event.touches[0] : event;
        const x = ((coalescedTouch.clientX - rect.left) / rect.width) * canvas.width;
        const y = ((coalescedTouch.clientY - rect.top) / rect.height) * canvas.height;
        
        path.lineTo(x, y);
        lastPosRef.current = { x, y };
      }
      
      // Teken het complete path één keer
      ctx.stroke(path);
    } else {
      // Mouse event (voor development op desktop)
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      
      path.lineTo(x, y);
      ctx.stroke(path);
      
      lastPosRef.current = { x, y };
    }
    
    // Markeer dat we moeten syncen (wordt gedaan in de animatieloop)
    needsSyncRef.current = true;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
    currentPathRef.current = null; // Clear het path
    
    if (autoSync) {
      // Debounced sync: only sync if 500ms passed since last sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      syncTimeoutRef.current = setTimeout(() => {
        saveCanvas();
      }, 500);
    }
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check if canvas is empty (all pixels are transparent)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let isEmpty = true;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) { // Check alpha channel
        isEmpty = false;
        break;
      }
    }

    // Only save if canvas has content AND user has actually drawn
    if (!isEmpty && hasDrawnRef.current) {
      const imageDataUrl = canvas.toDataURL('image/png');
      console.log(`[DrawingCanvas] saveCanvas called: playerId=${playerId}, questionNumber=${questionNumber}, imageData.length=${imageDataUrl.length}`);
      onSave(questionNumber, imageDataUrl);
    } else if (!hasDrawnRef.current) {
      console.log(`[DrawingCanvas] User hasn't drawn yet, not saving: playerId=${playerId}, questionNumber=${questionNumber}`);
    } else {
      console.log(`[DrawingCanvas] Canvas is empty, not saving: playerId=${playerId}, questionNumber=${questionNumber}`);
    }
  };

  const clearCanvas = () => {
    if (disabled) return; // Blokkeer wissen als disabled
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas (transparant)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset loaded image ref so it doesn't reload
    loadedImageRef.current = '';
    hasDrawnRef.current = false; // Reset draw tracker

    // Save the EMPTY canvas to the server so it doesn't reload the old data
    const emptyImageDataUrl = canvas.toDataURL('image/png');
    console.log(`[DrawingCanvas] Canvas cleared and saving empty image for playerId=${playerId}, questionNumber=${questionNumber}`);
    onSave(questionNumber, emptyImageDataUrl);
  };

  return (
    <div className="drawing-canvas-container">
      <div className="canvas-header">
        <span className="canvas-label">Vraag {questionNumber}</span>
        <button 
          type="button"
          className="clear-btn" 
          onClick={clearCanvas}
          title="Wissen"
        >
          ✕ Wissen
        </button>
      </div>
      <div className="canvas-wrapper" style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isRevealed && isCorrect !== null && (
          <div 
            className="answer-feedback"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isCorrect ? 'rgba(200, 200, 200, 0.15)' : 'rgba(100, 100, 100, 0.15)',
              pointerEvents: 'none',
              fontSize: '48px',
              fontWeight: 'bold',
              color: isCorrect ? '#888' : '#555',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
            }}
          >
            {isCorrect ? 'GOED' : 'FOUT'}
          </div>
        )}
      </div>
    </div>
  );
}

