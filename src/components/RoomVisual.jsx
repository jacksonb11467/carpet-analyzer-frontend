import React from 'react';

const RoomVisual = ({ room, color }) => {
  const safeLength = room.dimensions?.length || 1;
  const safeWidth = room.dimensions?.width || 1;
  const safeArea = room.area || 1;
  
  const maxDim = Math.max(safeLength, safeWidth);
  const scale = 100 / maxDim;
  
  const visualWidth = Math.max(20, safeWidth * scale);
  const visualHeight = Math.max(20, safeLength * scale);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div 
        style={{
          width: `${visualWidth}px`,
          height: `${visualHeight}px`,
          border: `3px solid ${color}`,
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          position: 'relative'
        }}
      >
        <div style={{ 
          fontSize: '11px', 
          fontWeight: '600', 
          color: '#1e293b',
          textAlign: 'center',
          lineHeight: '1.2'
        }}>
          {safeLength.toFixed(1)}×{safeWidth.toFixed(1)}
        </div>
      </div>
      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
        {safeArea.toFixed(1)}m²
      </div>
    </div>
  );
};

export default RoomVisual;