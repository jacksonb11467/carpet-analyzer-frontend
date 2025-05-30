import React from 'react';

const LoadingAnimation = ({ progress }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8fafc',
    }}>
      <img 
        src="/Main.png" 
        alt="Quotif Logo" 
        style={{
          width: '80px',
          height: '80px',
          marginBottom: '16px',
          animation: 'pulse 2s infinite',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
        }}
      />
      <div style={{
        width: '300px',
        height: '24px',
        marginBottom: '24px',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#e2e8f0',
        position: 'relative'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#e2e8f0',
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            transition: 'width 0.3s ease-in-out'
          }} />
        </div>
      </div>
      <div style={{ fontSize: '18px', fontWeight: '600', color: '#334155', marginTop: '12px' }}>
        Analyzing floor plan... {progress}%
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;