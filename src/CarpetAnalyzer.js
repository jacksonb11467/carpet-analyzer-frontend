import React, { useState, useRef, useEffect } from 'react';
import { Upload, Calculator, Settings, Edit3, User, Phone, MapPin, Calendar, Pencil } from 'lucide-react';

// Import extracted components
import CustomerForm from './components/CustomerForm';
import FloorPlanViewer from './components/FloorPlanViewer';
import LoadingAnimation from './components/LoadingAnimation';
import RoomCard from './components/RoomCard';
import GoogleMapsLoader from './components/GoogleMapsLoader';
import FloatingControlPanel from './components/FloatingControlPanel';
import ManualRoomInput from './components/ManualRoomInput';

const CarpetAnalyzer = () => {
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    installDate: '',
    notes: ''
  });
  const [showCustomerEdit, setShowCustomerEdit] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [streamingOutput, setStreamingOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandedRooms, setExpandedRooms] = useState({});
  const [uploadedImage, setUploadedImage] = useState(null);
  const [highlightedRoom, setHighlightedRoom] = useState(null);
  const [manualRooms, setManualRooms] = useState([]);
  const [showInitialForm, setShowInitialForm] = useState(true);
  
  // New state for the input mode
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'manual'
  const [undoStack, setUndoStack] = useState([]);
  
  const fileInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [googleMapsError, setGoogleMapsError] = useState(false);

  // Add this useEffect hook to initialize Google Maps
useEffect(() => {
  // This will check if Google Maps is loaded and initialize it
  const checkGoogleMapsAndInit = () => {
    if (window.google && window.google.maps) {
      initGoogleMaps();
    } else {
      // If not loaded yet, check again in 100ms
      setTimeout(checkGoogleMapsAndInit, 100);
    }
  };
  
  checkGoogleMapsAndInit();
}, []);  // Empty dependency array means this runs once on component mount

  // Callback for CustomerForm component
  const handleCustomerSubmit = (details) => {
    setCustomerDetails(details);
    setShowInitialForm(false);
    setShowCustomerEdit(false);
  };
  // Add this function inside your CarpetAnalyzer component
const initGoogleMaps = () => {
  if (!window.google || !mapRef.current) return;
  
  // Initialize the map
  const mapOptions = {
    center: { lat: -27.4698, lng: 153.0251 }, // Brisbane center
    zoom: 13,
    mapTypeControl: false
  };
  
  const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
  setMap(newMap);
  
  // Initialize autocomplete
  if (autocompleteRef.current) {
    const autocomplete = new window.google.maps.places.Autocomplete(
      autocompleteRef.current,
      { types: ['address'], componentRestrictions: { country: 'au' } }
    );
    
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      
      // Update map
      newMap.setCenter(place.geometry.location);
      newMap.setZoom(17);
      
      // Add marker
      if (marker) marker.setMap(null);
      const newMarker = new window.google.maps.Marker({
        map: newMap,
        position: place.geometry.location
      });
      setMarker(newMarker);
      
      // Update address
      if (place.formatted_address) {
        setCustomerDetails(prev => ({
          ...prev,
          address: place.formatted_address
        }));
      }
    });
  }
};

  // Toggle room expanded state
  const toggleRoomExpanded = (roomId) => {
    setExpandedRooms(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  // Update room dimensions
  const updateRoomDimensions = (roomId, field, value, isManual = false) => {
    if (results) {
      saveToUndoStack(JSON.parse(JSON.stringify(results)));
    }

    const updateFunction = isManual ? setManualRooms : 
      (updater) => setResults(prev => ({ ...prev, rooms: updater(prev.rooms) }));
    
    updateFunction(rooms => rooms.map(room => {
      if (room.id === roomId) {
        const newDimensions = { ...room.dimensions, [field]: parseFloat(value) || 0 };
        const newArea = newDimensions.length * newDimensions.width;
        const newCarpetableArea = room.carpetable ? newArea * (1 - (room.obstacleReduction || 0)) : 0;
        
        return {
          ...room,
          dimensions: newDimensions,
          area: newArea,
          originalArea: newArea,
          carpetableArea: newCarpetableArea
        };
      }
      return room;
    }));
  };

  // Undo functionality
  const saveToUndoStack = (currentState) => {
    setUndoStack(prev => [...prev.slice(-9), currentState]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setResults(previousState);
    setUndoStack(prev => prev.slice(0, -1));
  };

  // Streaming helper for OpenAI response
  // Replace this function in CarpetAnalyzer.jsx
async function streamOpenAIResponse(formData, setStreamingOutput) {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok || !response.body) {
    throw new Error('Streamed response failed');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let done = false;
  let accumulatedText = '';
  let totalChunks = 0;
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    if (value) {
      const chunk = decoder.decode(value);
      accumulatedText += chunk;
      totalChunks++;
      setProgress(Math.min(Math.floor((totalChunks / 80) * 100), 100));
      setStreamingOutput(accumulatedText); // update the UI live
    }
    done = readerDone;
  }
}

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setAnalyzing(true);
    setStreamingOutput('');
    setResults(null);
    setProgress(0);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('floorPlan', file);

      // Use streaming function and parse JSON at the end
      let finalText = '';
      await streamOpenAIResponse(formData, (text) => {
        setStreamingOutput(text);
        finalText = text;
      });
      // Try to parse last full JSON object in the streamed text
      let parsed = null;
      try {
        parsed = JSON.parse(finalText);
      } catch (e) {
        // fallback: try to find last curly-braced JSON object
        const match = finalText.match(/{[\s\S]*}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch (e2) {}
        }
      }
      if (parsed) {
        setResults(parsed);
        setUndoStack([]);
      }
    } catch (error) {
      alert('Analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
      setIsLoading(false);
    }
  };

  // Handle switching to manual input mode
  const handleSwitchToManual = () => {
    setInputMode('manual');
    setResults(null);
    setStreamingOutput('');
  };

  // Handle switching back to upload mode
  const handleSwitchToUpload = () => {
    setInputMode('upload');
    setResults(null);
    setStreamingOutput('');
  };

  // Handle save from manual room input
  const handleSaveManualRooms = (rooms) => {
    // Create a results object in the same format as the API response
    const resultsData = {
      success: true,
      rooms: rooms,
      totalCarpetableArea: rooms.reduce((sum, room) => sum + (room.carpetable ? room.carpetableArea : 0), 0),
      analysisMethod: 'Manual Input',
      extractionStats: {
        roomsFound: rooms.length,
        carpetableRooms: rooms.filter(r => r.carpetable).length,
        qualityScore: 100,
        processingMethod: 'Manual Room Definition'
      },
      warnings: [],
      boundaryData: 'Manual boundaries'
    };
    
    setResults(resultsData);
    setUndoStack([]);
  };

  // Show initial customer form
  if (showInitialForm) {
    return (
      <CustomerForm 
        customerDetails={customerDetails}
        setCustomerDetails={setCustomerDetails}
        onSubmit={handleCustomerSubmit}
        googleMapsError={googleMapsError}
        autocompleteRef={autocompleteRef}
        mapRef={mapRef}
        isInitial={true}
      />
    );
  }

  // Show loading screen while OpenAI request is in progress
  if (isLoading) {
    return <LoadingAnimation progress={progress} />;
  }

  // Main analysis interface
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Add the GoogleMapsLoader component here */}
  <GoogleMapsLoader 
    onLoad={initGoogleMaps}
    onError={() => setGoogleMapsError(true)} 
  />
      {/* Customer edit overlay */}
      {showCustomerEdit && (
        <CustomerForm 
          customerDetails={customerDetails}
          setCustomerDetails={setCustomerDetails}
          onSubmit={handleCustomerSubmit}
          googleMapsError={googleMapsError}
          autocompleteRef={autocompleteRef}
          mapRef={mapRef}
          isInitial={false}
          onCancel={() => setShowCustomerEdit(false)}
        />
      )}

      {/* Floating Mini Logo - Always Visible on Sub Pages */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 50,
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e2e8f0'
      }}>
        <img 
          src="/LittleOne.png" 
          alt="Quotif Logo" 
          style={{ 
            width: '24px', 
            height: '24px'
          }} 
        />
      </div>

      {/* Floating Control Panel */}
      {results && <FloatingControlPanel undoStack={undoStack} onUndo={handleUndo} />}

      {/* Header with Customer Info */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '60px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                Quotif Carpet
              </h1>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {customerDetails.name} • {customerDetails.phone} • {customerDetails.address}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCustomerEdit(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Edit Customer Details
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Upload UI / Manual Input Selector */}
        {!results && (
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            {/* Input Mode Selector */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginBottom: '32px'
            }}>
              <button
                onClick={() => setInputMode('upload')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '24px',
                  backgroundColor: inputMode === 'upload' ? '#eff6ff' : 'white',
                  border: `2px solid ${inputMode === 'upload' ? '#3b82f6' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  width: '200px'
                }}
              >
                <Upload size={32} color={inputMode === 'upload' ? '#3b82f6' : '#64748b'} />
                <div>
                  <div style={{ fontWeight: '600', color: inputMode === 'upload' ? '#3b82f6' : '#1e293b' }}>
                    Upload Floor Plan
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                    Use AI to analyze
                  </div>
                </div>
              </button>

              <button
                onClick={() => setInputMode('manual')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '24px',
                  backgroundColor: inputMode === 'manual' ? '#eff6ff' : 'white',
                  border: `2px solid ${inputMode === 'manual' ? '#3b82f6' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  width: '200px'
                }}
              >
                <Pencil size={32} color={inputMode === 'manual' ? '#3b82f6' : '#64748b'} />
                <div>
                  <div style={{ fontWeight: '600', color: inputMode === 'manual' ? '#3b82f6' : '#1e293b' }}>
                    Manual Input
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                    Draw rooms yourself
                  </div>
                </div>
              </button>
            </div>

            {/* Upload UI */}
            {inputMode === 'upload' && !uploadedImage && (
              <div style={{
                backgroundColor: 'white',
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '48px',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <Upload size={48} style={{ color: '#64748b', marginBottom: '16px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                  Upload Floor Plan
                </h2>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '16px' }}>
                  Upload {customerDetails.name}'s floor plan to begin analysis
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={analyzing}
                  style={{
                    backgroundColor: analyzing ? '#94a3b8' : '#2563eb',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: analyzing ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  {analyzing ? 'Analyzing Floor Plan...' : 'Select Floor Plan'}
                </button>
                
                {/* Streaming output display */}
                {streamingOutput && (
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      marginTop: '24px',
                      background: '#f3f4f6',
                      borderRadius: '8px',
                      padding: '16px',
                      color: '#374151',
                      fontSize: '14px',
                      textAlign: 'left',
                      maxHeight: '240px',
                      overflowY: 'auto'
                    }}
                  >
                    {streamingOutput}
                  </pre>
                )}
              </div>
            )}

            {/* Manual Input UI */}
            {inputMode === 'manual' && (
              <ManualRoomInput 
                onSaveRooms={handleSaveManualRooms} 
                onCancel={handleSwitchToUpload}
              />
            )}
          </div>
        )}

        {results && (
          <div>
            {/* Full Width Floor Plan with Zoom Controls */}
            {uploadedImage && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
                  Floor Plan Analysis
                </h3>
                <FloorPlanViewer uploadedImage={uploadedImage} />
              </div>
            )}

            {/* Condensed Room Details */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                  Room Analysis & Measurements
                </h3>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Method: {results.analysisMethod || 'AI Analysis'} • {results.rooms?.length || 0} rooms detected
                </div>
              </div>
              
              {/* Table Header */}
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e5e7eb',
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 40px', 
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                borderRadius: '8px 8px 0 0'
              }}>
                <div>Room</div>
                <div>Dimensions</div>
                <div>Total Area</div>
                <div>Carpet Area</div>
                <div>Linear Metres</div>
                <div></div>
              </div>
              
              {/* Room Rows */}
              {results.rooms?.map((room, index) => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  index={index} 
                  isExpanded={expandedRooms[room.id]}
                  toggleExpanded={() => toggleRoomExpanded(room.id)}
                  updateDimensions={updateRoomDimensions}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarpetAnalyzer;