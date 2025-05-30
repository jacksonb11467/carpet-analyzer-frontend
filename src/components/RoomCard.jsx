import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import RoomVisual from './RoomVisual';

const RoomCard = ({ room, index, isExpanded, toggleExpanded, updateDimensions }) => {
  // Color palette for room identification
  const roomColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];
  
  const color = roomColors[index % roomColors.length];
  const linearMetres = calculateRoomLinearMetres(room);

  const safeDimensions = {
    length: room.dimensions?.length || 0,
    width: room.dimensions?.width || 0
  };
  const safeArea = room.area || 0;
  const safeCarpetableArea = room.carpetableArea || 0;
  const safeConfidence = room.confidence || 0;

  return (
    <div style={{
      backgroundColor: 'white',
      border: `2px solid ${color}20`,
      borderLeft: `4px solid ${color}`,
      borderRadius: '8px',
      marginBottom: '8px'
    }}>
      <div style={{ 
        padding: '12px 16px', 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 40px', // Added column for carpetable
        alignItems: 'center',
        fontSize: '14px',
        borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: color,
            borderRadius: '3px'
          }} />
          <span style={{ fontWeight: '600' }}>{room.name || 'Unknown Room'}</span>
        </div>
        <div>{safeDimensions.length.toFixed(1)}×{safeDimensions.width.toFixed(1)}m</div>
        <div>{safeArea.toFixed(1)}m²</div>
        <div style={{ fontWeight: room.carpetable ? '600' : 'normal', color: room.carpetable ? '#2563eb' : '#6b7280' }}>
          {room.carpetable ? `${safeCarpetableArea.toFixed(1)}m²` : '—'}
        </div>
        <div style={{ fontWeight: room.carpetable ? '600' : 'normal', color: room.carpetable ? '#2563eb' : '#6b7280' }}>
          {room.carpetable ? `${linearMetres.toFixed(1)}m` : '—'}
        </div>
        {/* New Carpetable column */}
        <div style={{ textAlign: 'center' }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: room.carpetable ? '#dcfce7' : '#fee2e2',
            color: room.carpetable ? '#166534' : '#991b1b'
          }}>
            {room.carpetable ? 'Yes' : 'No'}
          </span>
        </div>
        <button 
          onClick={toggleExpanded}
          style={{
            padding: '4px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div style={{ padding: '20px', backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'center' }}>
            {/* Room Visual */}
            <div style={{ textAlign: 'center' }}>
              <RoomVisual room={room} color={color} />
            </div>

            {/* Room Controls */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                Adjust Room Dimensions
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Length (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={safeDimensions.length}
                    onChange={(e) => updateDimensions(room.id, 'length', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Width (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={safeDimensions.width}
                    onChange={(e) => updateDimensions(room.id, 'width', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <div>Area: <strong>{safeArea.toFixed(1)}m²</strong></div>
                {room.carpetable && (
                  <div>Linear Metres: <strong>{linearMetres.toFixed(1)}m</strong></div>
                )}
                <div>Confidence: {Math.round(safeConfidence * 100)}%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate linear metres
const calculateRoomLinearMetres = (room) => {
  if (!room.carpetable || !room.dimensions) return 0;
  
  const rollWidth = 3.66;
  const length = room.dimensions.length || 0;
  const width = room.dimensions.width || 0;
  
  if (length === 0 || width === 0) return 0;
  
  if (width <= rollWidth) {
    return length;
  } else if (length <= rollWidth) {
    return width;
  } else {
    const lengthWise = Math.ceil(width / rollWidth) * length;
    const widthWise = Math.ceil(length / rollWidth) * width;
    return Math.min(lengthWise, widthWise);
  }
};

export default RoomCard;