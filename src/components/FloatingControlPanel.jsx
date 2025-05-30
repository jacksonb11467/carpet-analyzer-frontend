import React from 'react';
import { Undo } from 'lucide-react';

const FloatingControlPanel = ({ undoStack, onUndo }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      right: '20px',
      transform: 'translateY(-50%)',
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e2e8f0',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      minWidth: '160px'
    }}>
      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>
        Controls
      </h4>
      
      <button
        onClick={onUndo}
        disabled={undoStack.length === 0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 12px',
          backgroundColor: undoStack.length === 0 ? '#f1f5f9' : '#3b82f6',
          color: undoStack.length === 0 ? '#94a3b8' : 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          fontWeight: '500',
          transition: 'all 0.2s'
        }}
      >
        <Undo size={16} />
        Undo ({undoStack.length})
      </button>
    </div>
  );
};

export default FloatingControlPanel;