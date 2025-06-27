import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Location.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom map component to handle map updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

// Mini-map for ride cards
function RideCardMap({ coordinates, label }) {
  if (!coordinates || coordinates.length !== 2 || isNaN(coordinates[0]) || isNaN(coordinates[1])) return null;
  return (
    <div style={{ height: 120, width: '100%', margin: '0.5rem 0', borderRadius: 8, overflow: 'hidden', border: '1px solid #a78bfa' }}>
      <MapContainer
        center={coordinates}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={coordinates}>
          <Popup>{label}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

const Location = ({ currentUser, onLogout }) => {
  const [rides, setRides] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRide, setSelectedRide] = useState(null);
  const [showCommunication, setShowCommunication] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapView, setMapView] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to India center
  const [mapZoom, setMapZoom] = useState(5);
  const mapRef = useRef(null);
  
  const [formData, setFormData] = useState({
    currentLocation: { coordinates: [], address: '' },
    destination: { coordinates: [], address: '' },
    departureTime: '',
    notice: '',
    maxPassengers: 3
  });
  const [destinationLoading, setDestinationLoading] = useState(false);

  useEffect(() => {
    fetchRides();
    getCurrentLocation();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/location', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRides(response.data.locations || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
      setError('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setUserLocation(newLocation);
          setMapCenter([latitude, longitude]);
          setMapZoom(12);
          
          // Reverse geocoding to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
              const address = data.display_name || `${latitude}, ${longitude}`;
              setFormData(prev => ({
                ...prev,
                currentLocation: {
                  coordinates: [latitude, longitude],
                  address: address
                }
              }));
            })
            .catch(() => {
              setFormData(prev => ({
                ...prev,
                currentLocation: {
                  coordinates: [latitude, longitude],
                  address: `${latitude}, ${longitude}`
                }
              }));
            });
        },
        (error) => {
          setError('Unable to get current location. Please enter manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationChange = (type, field, value) => {
    setFormData({
      ...formData,
      [type]: {
        ...formData[type],
        [field]: value
      }
    });
  };

  const handleCreateRide = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.currentLocation.coordinates.length || !formData.destination.coordinates.length) {
      setError('Please enter both your current location and destination.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/location', {
        currentLocation: formData.currentLocation,
        destination: formData.destination,
        departureTime: formData.departureTime,
        notice: formData.notice,
        maxPassengers: formData.maxPassengers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRides(prevRides => [response.data.location, ...prevRides]);
      setShowCreateForm(false);
      setFormData({
        currentLocation: { coordinates: [], address: '' },
        destination: { coordinates: [], address: '' },
        departureTime: '',
        notice: '',
        maxPassengers: 3
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async (rideId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/location/${rideId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRides();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel ride');
    }
  };

  const handleJoinRide = async (rideId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/location/${rideId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRides();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to join ride');
    }
  };

  const handleLeaveRide = async (rideId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/location/${rideId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRides();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to leave ride');
    }
  };

  const handleCommunication = (ride) => {
    setSelectedRide(ride);
    setShowCommunication(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const initiateCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_blank');
  };

  const initiateVideoCall = (userId) => {
    alert(`Initiating video call with user ${userId}`);
  };

  const sendMessage = (userId) => {
    alert(`Opening chat with user ${userId}`);
  };

  const shareLocation = (ride) => {
    // Only copy to clipboard, do not use navigator.share
    navigator.clipboard.writeText(`${ride.currentLocation.address} to ${ride.destination.address}`);
    alert('Location copied to clipboard!');
  };

  // Geocode destination address to coordinates
  const geocodeDestination = async (address) => {
    setDestinationLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setFormData((prev) => ({
          ...prev,
          destination: {
            address: display_name || address,
            coordinates: [parseFloat(lat), parseFloat(lon)]
          }
        }));
        setError('');
      } else {
        setFormData((prev) => ({
          ...prev,
          destination: {
            ...prev.destination,
            coordinates: []
          }
        }));
        setError('Could not find destination coordinates.');
      }
    } catch (err) {
      setError('Error finding destination coordinates.');
    } finally {
      setDestinationLoading(false);
    }
  };

  // Handle destination address change
  const handleDestinationChange = (e) => {
    const address = e.target.value;
    setFormData((prev) => ({
      ...prev,
      destination: {
        ...prev.destination,
        address,
        coordinates: [] // reset coordinates until found
      }
    }));
    setError('');
  };

  // Handle Find button click for destination
  const handleFindDestination = (e) => {
    e.preventDefault();
    if (formData.destination.address.length > 3) {
      geocodeDestination(formData.destination.address);
    } else {
      setError('Please enter a more specific destination address.');
    }
  };

  // Helper to open Google Maps directions
  const openGoogleMapsRoute = (ride) => {
    const origin = ride.currentLocation?.coordinates;
    const destination = ride.destination?.coordinates;
    if (
      Array.isArray(origin) && origin.length === 2 &&
      Array.isArray(destination) && destination.length === 2
    ) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}`;
      window.open(url, '_blank');
    }
  };

  const renderRideCards = () => {
    return rides.map((ride) => (
      <div
        key={ride._id}
        className="doubt-card ride-card-carousel location-ride-card"
        style={{ marginBottom: '2rem' }}
      >
        <div className="ride-header">
          <div className="user-info">
            <img src={ride.user.profilePhoto || '/peerpath.png'} alt={ride.user.username} />
            <h3>{ride.user.username}</h3>
          </div>
          <div className="ride-status">
            <span className={`status ${ride.isActive ? 'active' : 'inactive'}`}>{ride.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        <div className="ride-details">
          <div className="location-info">
            <p><strong>From:</strong> {ride.currentLocation.address}</p>
            <RideCardMap coordinates={ride.currentLocation.coordinates} label="Start Location" />
            <p><strong>To:</strong> {ride.destination.address}</p>
            <RideCardMap coordinates={ride.destination.coordinates} label="Destination" />
          </div>
          <div className="time-info">
            <p><strong>Departure:</strong> {formatDate(ride.departureTime)}</p>
          </div>
          <div className="passenger-info">
            <p><strong>Passengers:</strong> {ride.currentPassengers}/{ride.maxPassengers}</p>
            {ride.passengers && ride.passengers.length > 0 && (
              <div className="passenger-list">
                {ride.passengers.map((p) => (
                  <div className="passenger-list-item" key={p.user._id}>
                    <img src={p.user.profilePhoto || '/peerpath.png'} alt={p.user.username} />
                    <span>{p.user.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {ride.notice && (
            <div className="notice">
              <p><strong>Notice:</strong> {ride.notice}</p>
            </div>
          )}
        </div>
        <div className="ride-actions">
          <button className="route-btn" onClick={() => openGoogleMapsRoute(ride)}>
            View Route
          </button>
          {ride.user._id === currentUser._id ? (
            <button className="cancel-btn" onClick={() => handleCancelRide(ride._id)}>Cancel Ride</button>
          ) : (
            <>
              {ride.passengers.some(p => p.user._id === currentUser._id) ? (
                <button className="leave-btn" onClick={() => handleLeaveRide(ride._id)}>Leave Ride</button>
              ) : (
                <button className="join-btn" onClick={() => handleJoinRide(ride._id)} disabled={ride.currentPassengers >= ride.maxPassengers}>Join Ride</button>
              )}
              <button className="contact-btn" onClick={() => handleCommunication(ride)}>Contact</button>
            </>
          )}
          <button className="share-btn" onClick={() => { handleJoinRide(ride._id); shareLocation(ride); }}>Share</button>
        </div>
      </div>
    ));
  };

  const renderMapView = () => {
    // Only show rides with valid coordinates
    const ridesWithCoords = rides.filter(
      ride => Array.isArray(ride.currentLocation.coordinates) && ride.currentLocation.coordinates.length === 2 &&
        typeof ride.currentLocation.coordinates[0] === 'number' && typeof ride.currentLocation.coordinates[1] === 'number'
    );
    console.log('ridesWithCoords:', ridesWithCoords);
    try {
      return (
        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '500px', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapUpdater center={mapCenter} zoom={mapZoom} />
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <div>
                    <h4>Your Location</h4>
                    <p>You are here</p>
                  </div>
                </Popup>
              </Marker>
            )}
            {ridesWithCoords.length === 0 && (
              <Popup position={mapCenter}>
                <div>No rides with valid coordinates to display on the map.<br/>Try creating a new ride with a full address.<br/>Check browser console for map errors if this persists.</div>
              </Popup>
            )}
            {ridesWithCoords.map((ride) => (
              <Marker
                key={ride._id}
                position={[ride.currentLocation.coordinates[0], ride.currentLocation.coordinates[1]]}
              >
                <Popup>
                  <div className="ride-popup">
                    <h4>{ride.user.username}'s Ride</h4>
                    <p><strong>From:</strong> {ride.currentLocation.address}</p>
                    <p><strong>To:</strong> {ride.destination.address}</p>
                    <p><strong>Departure:</strong> {formatDate(ride.departureTime)}</p>
                    <p><strong>Passengers:</strong> {ride.currentPassengers}/{ride.maxPassengers}</p>
                    <button className="popup-contact-btn" onClick={() => handleCommunication(ride)}>Contact</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      );
    } catch (err) {
      console.error('Map rendering error:', err);
      return <div className="error-message">Map failed to load. Check the browser console for details.</div>;
    }
  };

  return (
    <div className="location-page-container">
      <nav className="collaboration-nav">
        <div className="nav-logo">
          <img src="/peerpath.png" alt="PeerPath" />
          <h1>PeerPath</h1>
        </div>
        <div className="nav-links">
          <Link to="/doubts">Doubts</Link>
          <Link to="/collaboration">Collaboration</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/chat">Chat</Link>
          <Link to="/location" className="active">Campus Connect</Link>
          <Link to="/profile">Profile</Link>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="location-main-content">
        <div className="location-header">
          <h1>🚗 Ride Sharing</h1>
          <p>Find travel partners or offer rides to your destination</p>
          <div className="location-actions">
            <button 
              className="create-ride-btn"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create New Ride'}
            </button>
            <button 
              className="map-toggle-btn"
              onClick={() => setMapView(!mapView)}
            >
              {mapView ? 'List View' : 'Map View'}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Create Ride Form */}
        {showCreateForm && (
          <div className="create-ride-form">
            <h2>Create New Ride</h2>
            <form onSubmit={handleCreateRide}>
              <div className="form-row">
                <div className="form-group">
                  <label>Current Location</label>
                  <div className="location-input-group">
                    <input
                      type="text"
                      placeholder="Enter your current location"
                      value={formData.currentLocation.address}
                      onChange={(e) => handleLocationChange('currentLocation', 'address', e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="location-btn"
                      onClick={getCurrentLocation}
                      title="Get current location"
                    >
                      📍
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Destination</label>
                  <div className="location-input-group">
                    <input
                      type="text"
                      placeholder="Enter your destination (full address works best)"
                      value={formData.destination.address}
                      onChange={handleDestinationChange}
                      required
                    />
                    <button
                      type="button"
                      className="location-btn"
                      onClick={handleFindDestination}
                      title="Find destination coordinates"
                    >
                      🔍
                    </button>
                  </div>
                  {destinationLoading && <span className="destination-loading">Finding location...</span>}
                  {error && error.includes('destination') && (
                    <span className="destination-error">{error} (Try a full address)</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Departure Time</label>
                  <input
                    type="datetime-local"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Max Passengers</label>
                  <select
                    name="maxPassengers"
                    value={formData.maxPassengers}
                    onChange={handleInputChange}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notice / Details</label>
                <textarea
                  name="notice"
                  placeholder="Any specific details for the ride?"
                  value={formData.notice}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating...' : 'Confirm & Create Ride'}
              </button>
            </form>
          </div>
        )}

        {/* Map View */}
        {mapView && renderMapView()}

        {/* Rides Section */}
        {!mapView && (
          <div className="rides-grid">
            {renderRideCards()}
          </div>
        )}
      </div>

      {/* Communication Modal */}
      {showCommunication && selectedRide && (
        <div className="communication-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Contact {selectedRide.user.username}</h3>
              <button className="close-btn" onClick={() => setShowCommunication(false)}>&times;</button>
            </div>
            <div className="communication-options">
              <button className="comm-btn call-btn" onClick={() => initiateCall(selectedRide.user.phoneNumber)}>
                📞 Call
              </button>
              <button className="comm-btn video-btn" onClick={() => initiateVideoCall(selectedRide.user._id)}>
                📹 Video Call
              </button>
              <button className="comm-btn message-btn" onClick={() => sendMessage(selectedRide.user._id)}>
                Message
              </button>
              <button className="comm-btn location-btn" onClick={() => shareLocation(selectedRide)}>
                📍 Share Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Location; 