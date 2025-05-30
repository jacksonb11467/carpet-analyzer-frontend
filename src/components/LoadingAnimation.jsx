import React, { useEffect, useState } from 'react';

const LoadingAnimation = ({ progress }) => {
  const [analysisStep, setAnalysisStep] = useState('Initializing...');

  // Update the status message based on progress
  useEffect(() => {
    if (progress < 20) {
      setAnalysisStep('Reading floor plan...');
    } else if (progress < 40) {
      setAnalysisStep('Identifying rooms and spaces...');
    } else if (progress < 60) {
      setAnalysisStep('Calculating measurements...');
    } else if (progress < 80) {
      setAnalysisStep('Determining carpet requirements...');
    } else {
      setAnalysisStep('Finalizing quote details...');
    }
  }, [progress]);

  return (
    <div className="loading-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8fafc',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div className="bg-element" style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0) 70%)',
        top: '20%',
        left: '10%',
        animation: 'float 15s infinite ease-in-out'
      }} />
      
      <div className="bg-element" style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, rgba(96,165,250,0) 70%)',
        bottom: '10%',
        right: '5%',
        animation: 'float 10s infinite ease-in-out reverse'
      }} />

      {/* Logo with enhanced animation */}
      <div className="logo-container" style={{
        position: 'relative',
        marginBottom: '40px'
      }}>
        <img 
          src="/Main.png" 
          alt="Quotif Logo" 
          style={{
            width: '100px',
            height: '100px',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
            animation: 'float-logo 3s infinite ease-in-out'
          }}
        />
        {/* Animated circle around logo */}
        <div className="logo-ring" style={{
          position: 'absolute',
          top: '-15px',
          left: '-15px',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          border: '3px solid rgba(59, 130, 246, 0.2)',
          borderTopColor: '#3b82f6',
          animation: 'spin 2s linear infinite'
        }} />
      </div>

      {/* Current analysis step message */}
      <div style={{ 
        fontSize: '16px', 
        color: '#64748b', 
        marginBottom: '20px', 
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        {analysisStep}
      </div>

      {/* Simplified progress bar */}
      <div style={{
        width: '350px',
        height: '10px',
        backgroundColor: '#e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
          borderRadius: '10px',
          transition: 'width 0.4s ease-out'
        }} />
      </div>

      {/* Progress percentage */}
      <div style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        color: '#334155'
      }}>
        {Math.round(progress)}%
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-logo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-15px, 15px); }
          50% { transform: translate(0, 30px); }
          75% { transform: translate(15px, 15px); }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;