import React, { useState, useEffect } from 'react';

const LoadingAnimation = ({ progress }) => {
  const [currentStep, setCurrentStep] = useState('Preparing analysis...');
  
  // Update the current step based on progress
  useEffect(() => {
    if (progress < 20) {
      setCurrentStep('Reading floor plan...');
    } else if (progress < 40) {
      setCurrentStep('Identifying rooms and spaces...');
    } else if (progress < 60) {
      setCurrentStep('Calculating measurements...');
    } else if (progress < 80) {
      setCurrentStep('Determining carpet requirements...');
    } else {
      setCurrentStep('Finalizing results...');
    }
  }, [progress]);

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
        marginBottom: '40px',
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
        }}>
          {/* Inner circle (carpet roll center) */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Logo */}
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
      </div>
      
      {/* Current operation text */}
      <div style={{
        fontSize: '18px',
        fontWeight: '500',
        color: '#1e293b',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        {currentStep}
      </div>
      
      {/* Progress bar container */}
      <div style={{
        width: '300px',
        height: '8px',
        backgroundColor: '#e2e8f0',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        {/* Actual progress bar */}
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#3b82f6',
          borderRadius: '4px',
          transition: 'width 0.5s ease-out'
        }} />
      </div>
      
      {/* Progress percentage */}
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#64748b'
      }}>
        {Math.round(progress)}% Complete
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