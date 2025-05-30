import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';

const ManualRoomInput = ({ onSaveRooms, onCancel }) => {
  const [rooms, setRooms] = useState([]);
  const [canvasActive, setCanvasActive] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [points, setPoints] = useState([]);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  
  // Room categories and their carpetable status
  const roomTypes = [
    { name: 'Bedroom', category: 'bedroom', carpetable: true },
    { name: 'Living Room', category: 'living', carpetable: true },
    { name: 'Dining Room', category: 'dining', carpetable: true },
    { name: 'Kitchen', category: 'kitchen', carpetable: false },
    { name: 'Bathroom', category: 'bathroom', carpetable: false },
    { name: 'Hallway', category: 'hallway', carpetable: true },
    { name: 'Study', category: 'study', carpetable: true },
    { name: 'Laundry', category: 'laundry', carpetable: false },
    { name: 'Garage', category: 'garage', carpetable: false },
    { name: 'Other', category: 'other', carpetable: true }
  ];

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2563eb';
      ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';
      ctxRef.current = ctx;
      
      drawCanvas();
    }
  }, [rooms, points, canvasActive]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const prevWidth = canvas.width;
        const prevHeight = canvas.height;
        
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        // Scale existing rooms based on canvas size change
        const scaleX = canvas.width / prevWidth;
        const scaleY = canvas.height / prevHeight;
        
        setRooms(prevRooms => prevRooms.map(room => ({
          ...room,
          points: room.points.map(pt => ({
            x: pt.x * scaleX,
            y: pt.y * scaleY
          }))
        })));
        
        drawCanvas();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw all rooms and current drawing on canvas
  const drawCanvas = () => {
    if (!ctxRef.current) return;
    
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw existing rooms
    rooms.forEach((room, index) => {
      drawRoom(ctx, room, index);
    });
    
    // Draw current points being created
    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      points.forEach((point, i) => {
        if (i > 0) {
          ctx.lineTo(point.x, point.y);
        }
      });
      
      if (points.length > 2) {
        ctx.lineTo(points[0].x, points[0].y);
      }
      
      ctx.stroke();
    }
  };

  // Draw a single room
  const drawRoom = (ctx, room, index) => {
    const { points } = room;
    
    if (!points || points.length < 3) return;
    
    // Select color based on room type
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
      '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
    ];
    const color = colors[index % colors.length];
    
    ctx.fillStyle = `${color}20`;
    ctx.strokeStyle = color;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    points.forEach((point, i) => {
      if (i > 0) {
        ctx.lineTo(point.x, point.y);
      }
    });
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Add room name in the center
    if (room.name) {
      const center = calculateCentroid(points);
      ctx.fillStyle = '#1E293B';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(room.name, center.x, center.y);
    }
  };

  // Calculate center point of a room for text placement
  const calculateCentroid = (points) => {
    let sumX = 0;
    let sumY = 0;
    
    points.forEach(point => {
      sumX += point.x;
      sumY += point.y;
    });
    
    return {
      x: sumX / points.length,
      y: sumY / points.length
    };
  };

  // Handle canvas click to add points when drawing
  const handleCanvasClick = (e) => {
    if (!canvasActive) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPoints(prev => [...prev, { x, y }]);
  };

  // Start creating a new room
  const startNewRoom = () => {
    setCanvasActive(true);
    setPoints([]);
    setCurrentRoom({
      name: '',
      category: 'bedroom',
      carpetable: true,
      dimensions: { length: 0, width: 0 },
      area: 0,
      points: []
    });
  };

  // Cancel current room creation
  const cancelCurrentRoom = () => {
    setCanvasActive(false);
    setPoints([]);
    setCurrentRoom(null);
  };

  // Finish and save the current room
  const finishRoom = () => {
    if (points.length < 3) {
      alert('Please create a room with at least 3 points');
      return;
    }
    
    // Calculate dimensions and area
    const dimensions = calculateRoomDimensions(points);
    const area = calculateRoomArea(points);
    
    // Generate unique ID
    const roomId = Date.now();
    
    const newRoom = {
      ...currentRoom,
      id: roomId,
      points: [...points],
      dimensions: dimensions,
      area: area,
      carpetableArea: currentRoom.carpetable ? area : 0,
      confidence: 1, // Manual rooms are 100% confidence
      identificationMethod: 'manual'
    };
    
    setRooms(prev => [...prev, newRoom]);
    setCanvasActive(false);
    setPoints([]);
    setCurrentRoom(null);
  };

  // Calculate approximate room dimensions from points
  const calculateRoomDimensions = (points) => {
    if (points.length < 2) return { length: 0, width: 0 };
    
    // Find bounding box
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;
    
    points.forEach(point => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    
    // Convert to meters - assuming 100 pixels = 1 meter for simplicity
    // This should be adjusted based on your scale
    const pixelsToMeters = 0.01;
    const length = (maxY - minY) * pixelsToMeters;
    const width = (maxX - minX) * pixelsToMeters;
    
    return { length, width };
  };

  // Calculate room area using Shoelace formula
  const calculateRoomArea = (points) => {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    
    area = Math.abs(area) / 2;
    
    // Convert to square meters - assuming 10000 square pixels = 1 square meter
    const pixelsToSquareMeters = 0.0001;
    return area * pixelsToSquareMeters;
  };

  // Remove a room
  const deleteRoom = (roomId) => {
    setRooms(prev => prev.filter(room => room.id !== roomId));
  };

  // Handle room property change
  const handleRoomChange = (roomId, field, value) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const updatedRoom = { ...room, [field]: value };
        
        // Update carpetable status if category changes
        if (field === 'category') {
          const roomType = roomTypes.find(type => type.category === value);
          updatedRoom.carpetable = roomType?.carpetable || false;
          updatedRoom.carpetableArea = roomType?.carpetable ? room.area : 0;
        }
        
        return updatedRoom;
      }
      return room;
    }));
  };

  // Save all rooms and exit
  const saveAllRooms = () => {
    // Format rooms to match the API output format
    const formattedRooms = rooms.map((room, index) => ({
      id: index + 1,
      name: room.name || `Room ${index + 1}`,
      category: room.category,
      dimensions: room.dimensions,
      area: room.area,
      carpetableArea: room.carpetable ? room.area : 0,
      originalArea: room.area,
      carpetable: room.carpetable,
      obstacles: [],
      obstacleReduction: 0,
      confidence: 1,
      identificationMethod: 'manual',
      aiReasoning: 'Manually defined by user',
      notes: `${room.name || `Room ${index + 1}`} - ${room.carpetable ? 'Full' : 'Not'} area available for carpet installation`,
      manuallyAdjusted: false,
      roomBoundary: {
        coordinates: room.points.map(p => ({ x: p.x, y: p.y }))
      }
    }));
    
    onSaveRooms(formattedRooms);
  };

  // Convert room data to a format for the quoting system
  const generateResults = () => {
    return {
      success: true,
      rooms: rooms.map((room, index) => ({
        id: index + 1,
        name: room.name || `Room ${index + 1}`,
        category: room.category,
        dimensions: room.dimensions,
        area: room.area,
        carpetableArea: room.carpetable ? room.area : 0,
        originalArea: room.area,
        carpetable: room.carpetable,
        obstacles: [],
        obstacleReduction: 0,
        confidence: 1,
        identificationMethod: 'manual',
        aiReasoning: 'Manually defined by user',
        notes: `${room.name || `Room ${index + 1}`} - ${room.carpetable ? 'Full' : 'Not'} area available for carpet installation`,
        manuallyAdjusted: false
      })),
      totalCarpetableArea: rooms.reduce((sum, room) => sum + (room.carpetable ? room.area : 0), 0),
      analysisMethod: 'Manual Input',
      extractionStats: {
        roomsFound: rooms.length,
        carpetableRooms: rooms.filter(r => r.carpetable).length,
        qualityScore: 100,
        processingMethod: 'Manual Room Definition'
      },
      warnings: [],
      boundaryData: 'User-defined boundaries'
    };
  };

  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      marginBottom: '24px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
        Manual Room Input
      </h3>
      
      <div style={{ display: 'flex', gap: '24px', height: '600px' }}>
        {/* Canvas for drawing rooms */}
        <div style={{ flex: '1', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: canvasActive ? 'crosshair' : 'default'
            }}
          />
          
          {/* Canvas controls */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            display: 'flex',
            gap: '8px'
          }}>
            {!canvasActive ? (
              <button
                onClick={startNewRoom}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Plus size={16} />
                Add Room
              </button>
            ) : (
              <>
                <button
                  onClick={finishRoom}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <Save size={16} />
                  Save Room
                </button>
                <button
                  onClick={cancelCurrentRoom}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#f43f5e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <X size={16} />
                  Cancel
                </button>
              </>
            )}
          </div>
          
          {/* Canvas instructions */}
          {canvasActive && (
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1e293b',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <p>Click to add points. Create at least 3 points to form a room.</p>
              <p>Click "Save Room" when finished or "Cancel" to discard.</p>
              <p>Points: {points.length}</p>
            </div>
          )}
        </div>
        
        {/* Room properties panel */}
        <div style={{ width: '300px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              Room List
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              {rooms.length} rooms defined. {rooms.filter(r => r.carpetable).length} carpetable.
            </p>
          </div>
          
          {/* Room list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rooms.map((room, index) => (
              <div 
                key={room.id}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder={`Room ${index + 1}`}
                    value={room.name}
                    onChange={(e) => handleRoomChange(room.id, 'name', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={() => deleteRoom(room.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '30px',
                      height: '30px',
                      backgroundColor: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '4px',
                      marginLeft: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>
                    Room Type
                  </label>
                  <select
                    value={room.category}
                    onChange={(e) => handleRoomChange(room.id, 'category', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    {roomTypes.map(type => (
                      <option key={type.category} value={type.category}>
                        {type.name} ({type.carpetable ? 'Carpetable' : 'Non-Carpetable'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  <div>Dimensions: {room.dimensions.length.toFixed(2)}m × {room.dimensions.width.toFixed(2)}m</div>
                  <div>Area: {room.area.toFixed(2)}m²</div>
                  <div>
                    Status: <span style={{ 
                      color: room.carpetable ? '#10b981' : '#ef4444',
                      fontWeight: '500'
                    }}>
                      {room.carpetable ? 'Carpetable' : 'Non-Carpetable'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {rooms.length === 0 && !canvasActive && (
              <div style={{ 
                textAlign: 'center',
                padding: '32px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1',
                color: '#64748b'
              }}>
                <p>No rooms defined yet.</p>
                <p>Click "Add Room" to start creating rooms.</p>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={saveAllRooms}
              disabled={rooms.length === 0}
              style={{
                padding: '12px 20px',
                backgroundColor: rooms.length === 0 ? '#cbd5e1' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: rooms.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Save All Rooms & Continue
            </button>
            <button
              onClick={onCancel}
              style={{
                padding: '12px 20px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Cancel & Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualRoomInput;