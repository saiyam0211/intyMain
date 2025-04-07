import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "../ui/Button";
import { GoogleMap, useLoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import axios from 'axios';

const libraries = ['places'];

const LocationPopup = ({ onLocationSelect }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [error, setError] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [exactCoordinates, setExactCoordinates] = useState(null);
  const [isLocationConstraint, setIsLocationConstraint] = useState(false); // Default to unchecked
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default center of India
  const [searchBox, setSearchBox] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [manualLocationInput, setManualLocationInput] = useState('');
  
  // New states for multi-step flow
  const [currentStep, setCurrentStep] = useState(1); // Step 1: City selection, Step 2: Location constraint, Step 3: Specific options
  
  // New states for city search
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityResults, setShowCityResults] = useState(false);

  // List of supported cities - Tier 1 and Tier 2 cities in India
  const cities = [
    // Tier 1 Cities
    'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 
    
    // Tier 2 Cities
    'Jaipur', 'Lucknow', 'Indore', 'Nagpur', 'Chandigarh', 'Surat', 'Coimbatore', 'Guwahati',
    'Bhubaneswar', 'Visakhapatnam', 'Kochi', 'Vadodara', 'Thiruvananthapuram', 'Goa', 'Bhopal',
    'Mangalore', 'Mysore', 'Nashik', 'Rajkot', 'Patna', 'Ranchi', 'Raipur', 'Varanasi', 'Vijayawada',
    'Dehradun', 'Amritsar', 'Ludhiana', 'Jodhpur', 'Madurai', 'Tiruchirappalli', 'Warangal',
    'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad', 'Agra', 'Kanpur', 'Allahabad', 'Aurangabad',
    'Thane', 'Navi Mumbai', 'Pondicherry', 'Jammu', 'Shimla', 'Jalandhar'
  ];

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8", // Use the API key from .env or fallback
    libraries,
  });

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onSearchBoxLoad = useCallback((ref) => {
    setSearchBox(ref);
  }, []);

  const onPlacesChanged = useCallback(() => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        
        setMapCenter(location);
        setExactCoordinates(location);
        setSelectedAddress(place.formatted_address);
        
        // Store live location in localStorage with exact coordinates
        const liveLocation = JSON.stringify({ 
          latitude: location.lat, 
          longitude: location.lng,
          address: place.formatted_address,
          timestamp: new Date().toISOString() 
        });
        localStorage.setItem('userLiveLocation', liveLocation);
        
        // Find the nearest city for display purposes or use custom location
        const nearestCity = findNearestCity(location.lat, location.lng);
        
        // Store the location information
        localStorage.setItem('userLocation', nearestCity);
        
        // Call the parent callback with the location information
        onLocationSelect(nearestCity, location, place.formatted_address);
      }
    }
  }, [searchBox, onLocationSelect]);

  useEffect(() => {
    // Check if location is already stored in localStorage
    const storedLocation = localStorage.getItem('userLocation');
    
    if (storedLocation) {
      // If location exists, use it but don't show popup
      onLocationSelect(storedLocation);
    } else {
      // Show popup after a short delay to let the page load
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [onLocationSelect]);

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
    setError('');
    
    // Clear city search data when selecting from dropdown
    setCitySearchQuery('');
    setCitySearchResults([]);
    setShowCityResults(false);
    
    // Clear exact coordinates and address if selecting from dropdown
    if (e.target.value) {
      setExactCoordinates(null);
      setSelectedAddress('');
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate city selection before moving to next step
      if (!selectedLocation) {
        setError('Please select a city to continue');
        return;
      }
      setError('');
      setCurrentStep(2);
    }
  };

  const handleLocationConstraintChange = (value) => {
    setIsLocationConstraint(value);
    
    if (!value) {
      // If "No" selected - location is not a constraint
      // Store city but mark it to hide distance in compare page
      localStorage.setItem('hideDistanceInCompare', 'true');
      console.log('Setting hideDistanceInCompare flag to true');
      
      // Dispatch a custom event to notify all components
      window.dispatchEvent(new Event('locationPreferenceChanged'));
      
      // Store the selected city without exact coordinates
      localStorage.setItem('userLocation', selectedLocation);
      
      // Call the parent callback with only the selected city
      onLocationSelect(selectedLocation, null, null);
      
      // Close the popup
      setShowPopup(false);
    } else {
      // If "Yes" selected - move to next step to get specific location
      localStorage.removeItem('hideDistanceInCompare');
      console.log('Removing hideDistanceInCompare flag');
      
      // Dispatch a custom event to notify all components
      window.dispatchEvent(new Event('locationPreferenceChanged'));
      
      setCurrentStep(3);
    }
  };

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Store coordinates
        setExactCoordinates({ lat: latitude, lng: longitude });
        
        // Update map center
        setMapCenter({ lat: latitude, lng: longitude });
        
        // Try to get address from coordinates using reverse geocoding
        reverseGeocode(latitude, longitude);
        
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('Error getting location:', error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Please allow location access to use this feature');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            setError('Request to get location timed out');
            break;
          case error.UNKNOWN_ERROR:
            setError('An unknown error occurred');
            break;
          default:
            setError('Failed to get your location');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"}`
      );

      if (response.data.results.length > 0) {
        // Find city component
        let city = '';
        for (const component of response.data.results[0].address_components) {
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
            city = component.long_name;
            break;
          }
        }

        // If found a city, save it
        if (city) {
          localStorage.setItem('userLocation', city);
          setSelectedLocation(city);
          setSelectedAddress(response.data.results[0].formatted_address);
          
          // Store live location
          const liveLocation = JSON.stringify({ 
            latitude, 
            longitude,
            address: response.data.results[0].formatted_address,
            timestamp: new Date().toISOString() 
          });
          localStorage.setItem('userLiveLocation', liveLocation);
          
          // Call the onLocationSelect prop
          if (onLocationSelect) {
            onLocationSelect(city, { latitude, longitude }, response.data.results[0].formatted_address);
          }
          
          // Close the popup
          setShowPopup(false);
        }
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      setError('Failed to determine your location. Please select a city manually.');
    }
  };

  const handleManualLocationSubmit = () => {
    if (!manualLocationInput.trim()) {
      setError('Please enter a location');
      return;
    }

    setSelectedAddress(manualLocationInput);
    
    // Store the manually entered location
    localStorage.setItem('userLocation', manualLocationInput);
    
    // Call the parent callback with the location
    onLocationSelect(manualLocationInput);
    
    // Close popup
    setShowPopup(false);
  };

  // Simple function to find the nearest city (for demo purposes)
  const findNearestCity = (latitude, longitude) => {
    // Default coordinates for major cities
    const cityCoordinates = {
      'Bengaluru': { lat: 12.9716, lng: 77.5946 },
      'Indore': { lat: 22.7196, lng: 75.8577 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 },
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.6139, lng: 77.2090 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 }
    };
    
    // If we don't have coordinates for other cities, we'll use these major ones
    const citiesToCheck = Object.keys(cityCoordinates);
    
    let nearestCity = citiesToCheck[0];
    let minDistance = calculateDistance(latitude, longitude, 
                                       cityCoordinates[citiesToCheck[0]].lat, 
                                       cityCoordinates[citiesToCheck[0]].lng);
    
    citiesToCheck.forEach(city => {
      const distance = calculateDistance(latitude, longitude, 
                                        cityCoordinates[city].lat, 
                                        cityCoordinates[city].lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    });
    
    return nearestCity;
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const handleCitySearch = async () => {
    if (!citySearchQuery.trim()) {
      setCitySearchResults([]);
      setShowCityResults(false);
      return;
    }

    try {
      setIsSearchingCity(true);
      
      // First check if the query matches any of our predefined cities
      const localMatches = cities.filter(city => 
        city.toLowerCase().includes(citySearchQuery.toLowerCase())
      ).slice(0, 5); // Limit to 5 results
      
      if (localMatches.length > 0) {
        // If we have local matches, use them directly
        const formattedResults = localMatches.map(city => ({
          display_name: city + ", India",
          name: city,
          // Add placeholder coordinates that will be replaced with more accurate ones if needed
          lat: "0",
          lon: "0"
        }));
        
        setCitySearchResults(formattedResults);
        setShowCityResults(true);
        setIsSearchingCity(false);
        return;
      }
      
      // If no local matches, use Nominatim API as fallback
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(citySearchQuery)}${citySearchQuery.toLowerCase().includes('india') ? '' : ', india'}&limit=5&countrycodes=in`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9'
          }
        }
      );

      setCitySearchResults(response.data);
      setShowCityResults(true);
      setIsSearchingCity(false);
    } catch (error) {
      console.error('Error searching city:', error);
      setError('Failed to search for cities. Please try again.');
      setIsSearchingCity(false);
    }
  };

  const handleCitySearchChange = (e) => {
    setCitySearchQuery(e.target.value);
    if (e.target.value === '') {
      setShowCityResults(false);
      setCitySearchResults([]);
    }
  };

  const handleAreaSelect = (city, result = null) => {
    // Extract clean city name if full result is provided
    const cityName = result ? result.name || city.split(',')[0].trim() : city;
    
    // Save the selected city
    localStorage.setItem('userLocation', cityName);
    
    // If we have coordinates, save them
    if (result && result.lat && result.lon) {
      const liveLocationData = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        address: result.display_name || cityName,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('userLiveLocation', JSON.stringify(liveLocationData));
    }
    
    // Call the onLocationSelect prop with the selected city
    if (onLocationSelect) {
      onLocationSelect(cityName, 
        result && result.lat && result.lon ? 
        { latitude: parseFloat(result.lat), longitude: parseFloat(result.lon) } : null, 
        result ? result.display_name : null);
    }
    
    // Close the popup
    setShowPopup(false);
  };

  // Handle Enter key press in city search
  const handleCitySearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCitySearch();
    }
  };

  // If popup shouldn't be shown, return null
  if (!showPopup) {
    return null;
  }

  // Render loading state while Google Maps is loading
  if (currentStep === 3 && !isLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-4">Loading Map...</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state if Google Maps failed to load
  if (currentStep === 3 && loadError) {
    console.error("Error loading Google Maps:", loadError);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-4">Error Loading Map</h2>
          <p className="text-red-500 text-center mb-4">
            There was an error loading the map. Please try again later or use one of the options below.
          </p>
          
          <div className="mb-4">
            <select
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={selectedLocation}
              onChange={handleLocationChange}
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className="text-center my-2">
            <span className="text-gray-500">OR</span>
          </div>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter your location manually"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={manualLocationInput}
              onChange={(e) => setManualLocationInput(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => setCurrentStep(2)}
              className="w-1/2 bg-gray-500 hover:bg-gray-600 text-white py-3"
            >
              Back
            </Button>
            <Button
              onClick={selectedLocation ? handleNextStep : handleManualLocationSubmit}
              className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white py-3"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${!showPopup ? 'hidden' : ''}`}>
      <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowPopup(false)}></div>
      
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-10 relative">
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="space-y-6">
          {currentStep === 1 && (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Select Your City
              </h2>
              
              <div className="mt-4">
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006452]"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={handleNextStep}
                  className="w-full p-3 bg-[#006452] text-white rounded-lg"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Is location a constraint for you?
              </h2>
              
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => handleLocationConstraintChange(true)}
                  className="px-6 py-3 bg-[#006452] text-white rounded-lg hover:bg-[#00503f] transition duration-200"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleLocationConstraintChange(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  No
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-600 text-center">
                <p>Selected city: <span className="font-medium">{selectedLocation}</span></p>
                <p className="mt-2">
                  • If you select "Yes", you'll be able to specify your exact location<br/>
                  • If you select "No", we'll use the city for general search results
                </p>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="w-full p-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  Back
                </button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Specify Your Location
              </h2>
              
              <div className="mt-4 space-y-4">
                <div>
                  <button
                    onClick={handleGetLiveLocation}
                    className="w-full p-3 bg-[#006452] text-white rounded-lg flex items-center justify-center"
                    disabled={isGettingLocation}
                  >
                    {isGettingLocation ? 'Getting Location...' : 'Use My Current Location'}
                  </button>
                </div>
                
                {/* <div className="text-center">
                  <span className="text-gray-500">OR</span>
                </div> */}
                
                {/* <div>
                  <p className="text-center font-medium text-gray-800 mb-2">
                    Search for a specific area
                  </p>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type an area or locality name"
                      value={citySearchQuery}
                      onChange={handleCitySearchChange}
                      onKeyDown={handleCitySearchKeyDown}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006452]"
                    />
                    <button
                      onClick={handleCitySearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#006452] text-white p-2 rounded-lg"
                      disabled={isSearchingCity}
                    >
                      {isSearchingCity ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        "Search"
                      )}
                    </button>
                  </div>
                  
                  {showCityResults && citySearchResults.length > 0 && (
                    <div className="mt-2 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                      {citySearchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => handleAreaSelect(result.display_name.split(',')[0], result)}
                          className="w-full p-2 text-left hover:bg-gray-100 border-b border-gray-200"
                        >
                          {result.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {showCityResults && citySearchResults.length === 0 && !isSearchingCity && (
                    <p className="text-center text-gray-500 mt-2">
                      No places found. Try a different search term.
                    </p>
                  )}
                </div> */}
                
                {/* {isLoaded && (
                  <div className="mt-4">
                    <p className="text-center font-medium text-gray-800 mb-2">
                      Or select on map
                    </p>
                    <div className="h-60 w-full rounded-lg overflow-hidden">
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        zoom={10}
                        center={mapCenter}
                        onLoad={onMapLoad}
                        options={{
                          disableDefaultUI: true,
                          zoomControl: true,
                          fullscreenControl: true,
                        }}
                      >
                        <StandaloneSearchBox
                          onLoad={onSearchBoxLoad}
                          onPlacesChanged={onPlacesChanged}
                        >
                          <input
                            type="text"
                            placeholder="Search for places"
                            className="w-full p-2 border border-gray-300 rounded-lg shadow-md absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-white"
                            style={{ maxWidth: 'calc(100% - 20px)' }}
                          />
                        </StandaloneSearchBox>
                        
                        {exactCoordinates && (
                          <Marker position={exactCoordinates} />
                        )}
                      </GoogleMap>
                    </div>
                  </div>
                )} */}
              </div>
              
              <div className="mt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full p-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  Back
                </button>
              </div>
            </>
          )}
          
          {/* Error message display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPopup;