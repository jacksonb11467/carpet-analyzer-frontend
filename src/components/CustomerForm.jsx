import React, { useState } from 'react';
import { X, User, Phone, MapPin, Calendar } from 'lucide-react';

const CustomerForm = ({ 
  customerDetails, 
  setCustomerDetails, 
  onSubmit, 
  googleMapsError, 
  autocompleteRef, 
  mapRef, 
  isInitial = false,
  isDropdown = false,  // New prop
  onCancel
}) => {
  const [localDetails, setLocalDetails] = useState({...customerDetails});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!localDetails.name || !localDetails.phone || !localDetails.address) {
      alert('Please fill in the required fields: Name, Phone, and Address');
      return;
    }
    setCustomerDetails(localDetails);
    onSubmit(localDetails);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <div style={isDropdown ? {
      // Dropdown mode styling - no background overlay
      padding: '16px'
    } : !isInitial ? {
      // Modal overlay styling
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    } : { 
      // Initial form styling
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={isDropdown ? {
        // Inner container for dropdown mode
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px'
      } : {
        // Inner container for modal/initial
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {!isInitial && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: isDropdown ? '20px' : '24px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              Edit Customer Details
            </h2>
            <button
              onClick={handleCancel}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                borderRadius: '4px'
              }}
            >
              <X size={isDropdown ? 20 : 24} />
            </button>
          </div>
        )}

{isInitial && (
  <div style={{ textAlign: 'center', marginBottom: '40px' }}>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
      <img 
        src="/Main.png" 
        alt="Quotif Logo" 
        style={{ 
          width: '120px', 
          height: '120px'
        }} 
      />
    </div>
    <p style={{ color: '#64748b', fontSize: '18px', margin: 0 }}>
      Specicalist Carpet Tool
    </p>
  </div>
)}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isDropdown ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={localDetails.name}
                onChange={(e) => setLocalDetails(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                placeholder="John Smith"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={localDetails.phone}
                onChange={(e) => setLocalDetails(prev => ({ ...prev, phone: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                placeholder="0412 345 678"
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={localDetails.email}
              onChange={(e) => setLocalDetails(prev => ({ ...prev, email: e.target.value }))}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              placeholder="john@example.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Installation Address *
            </label>
            {!googleMapsError ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  ref={autocompleteRef}
                  type="text"
                  required
                  value={localDetails.address}
                  onChange={(e) => setLocalDetails(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Start typing address or click on map..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                {/* Only show map when NOT in dropdown mode */}
                {!isDropdown && (
                  <div 
                    ref={mapRef}
                    style={{
                      width: '100%',
                      height: '250px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb'
                    }}
                  />
                )}
              </div>
            ) : (
              <textarea
                required
                value={localDetails.address}
                onChange={(e) => setLocalDetails(prev => ({ ...prev, address: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  minHeight: '100px',
                  resize: 'vertical',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                placeholder="123 Example Street, Suburb, State, Postcode"
              />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isDropdown ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Preferred Install Date
              </label>
              <input
                type="date"
                value={localDetails.installDate}
                onChange={(e) => setLocalDetails(prev => ({ ...prev, installDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Notes
              </label>
              <input
                type="text"
                value={localDetails.notes}
                onChange={(e) => setLocalDetails(prev => ({ ...prev, notes: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                placeholder="Special requirements..."
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: isDropdown ? '12px 20px' : '16px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: isDropdown ? '16px' : '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              boxSizing: 'border-box'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            {isInitial ? 'Continue to Floor Plan Analysis' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;