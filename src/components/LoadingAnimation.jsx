import React from 'react';

const LoadingAnimation = ({ progress }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      {/* Carpet roll animation container */}
      <div style={{
        position: 'relative',
        width: '160px',
        height: '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Animated carpet "roll" - outer circle */}
        <div style={{
          position: 'absolute',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #3b82f6 0%, #60a5fa 40%, #93c5fd 60%, transparent 75%, transparent 100%)',
          animation: 'spin 3s linear infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)'
        }} />
        
        {/* Inner circle (carpet roll center) - stationary */}
        <div style={{
          position: 'relative', // Changed to relative to not be affected by parent's animation
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2 // Ensure it's above the spinning background
        }}>
          {/* Logo - stationary */}
          <img 
            src="/Main.png" 
            alt="Quotif Logo" 
            style={{
              width: '80px',
              height: '80px'
            }}
          />
        </div>
      </div>
      
      {/* Animation keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;