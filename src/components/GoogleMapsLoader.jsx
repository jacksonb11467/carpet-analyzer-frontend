import React, { useEffect } from 'react';

const GoogleMapsLoader = ({ onLoad, onError }) => {
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      if (onLoad) onLoad();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Handle success
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
      if (onLoad) onLoad();
    };
    
    // Handle failure
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      if (onError) onError();
    };
    
    // Add script to document
    document.head.appendChild(script);
    
    // Clean up
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onLoad, onError]);
  
  return null; // This component doesn't render anything
};

export default GoogleMapsLoader;