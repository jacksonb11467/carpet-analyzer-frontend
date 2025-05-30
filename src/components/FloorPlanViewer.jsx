import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

const FloorPlanViewer = ({ uploadedImage }) => {
  const [isFloorPlanFullscreen, setIsFloorPlanFullscreen] = useState(false);
  const [floorPlanZoom, setFloorPlanZoom] = useState(1);
  const floorPlanRef = useRef(null);

  // Handle ESC key for fullscreen exit
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isFloorPlanFullscreen) {
        setIsFloorPlanFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isFloorPlanFullscreen]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={() => setFloorPlanZoom(prev => Math.min(prev + 0.25, 3))}
          style={{
            padding: '8px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setFloorPlanZoom(prev => Math.max(prev - 0.25, 0.5))}
          style={{
            padding: '8px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => setIsFloorPlanFullscreen(!isFloorPlanFullscreen)}
          style={{
            padding: '8px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          title={isFloorPlanFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFloorPlanFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Floor Plan Container */}
      <div 
        ref={floorPlanRef}
        style={{
          position: isFloorPlanFullscreen ? 'fixed' : 'relative',
          top: isFloorPlanFullscreen ? 0 : 'auto',
          left: isFloorPlanFullscreen ? 0 : 'auto',
          right: isFloorPlanFullscreen ? 0 : 'auto',
          bottom: isFloorPlanFullscreen ? 0 : 'auto',
          zIndex: isFloorPlanFullscreen ? 1000 : 'auto',
          backgroundColor: isFloorPlanFullscreen ? 'rgba(0, 0, 0, 0.9)' : '#f8fafc',
          borderRadius: isFloorPlanFullscreen ? '0' : '8px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'auto'
        }}
      >
        <img 
          src={uploadedImage} 
          alt="Floor Plan" 
          style={{ 
            maxWidth: isFloorPlanFullscreen ? 'none' : '100%',
            maxHeight: isFloorPlanFullscreen ? 'none' : '600px',
            width: isFloorPlanFullscreen ? 'auto' : 'auto',
            height: 'auto',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transform: `scale(${floorPlanZoom})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease'
          }} 
        />
      </div>

      {/* Fullscreen Exit Instructions */}
      {isFloorPlanFullscreen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 1001
        }}>
          Press ESC or click the minimize button to exit fullscreen
        </div>
      )}
    </div>
  );
};

export default FloorPlanViewer;