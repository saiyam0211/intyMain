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
  
  // New states for city search
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityResults, setShowCityResults] = useState(false);

  // List of supported cities
  const cities = [
    // Major Metros
    'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 
    'Jaipur', 'Lucknow', 'Indore', 'Nagpur',
    
    // Other Major Cities - North
    'Chandigarh', 'Amritsar', 'Ludhiana', 'Jalandhar', 'Shimla', 'Dehradun', 'Haridwar', 
    'Rishikesh', 'Gurgaon', 'Noida', 'Ghaziabad', 'Faridabad', 'Meerut', 'Agra', 'Varanasi',
    'Patna', 'Ranchi', 'Dhanbad', 'Jammu', 'Srinagar', 'Kanpur', 'Allahabad', 'Gorakhpur',
    
    // Other Major Cities - West
    'Surat', 'Vadodara', 'Rajkot', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur', 'Thane',
    'Navi Mumbai', 'Goa', 'Panaji', 'Udaipur', 'Jodhpur', 'Ajmer', 'Kota', 'Bhilai', 'Raipur',
    
    // Other Major Cities - South
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Warangal', 'Coimbatore', 'Madurai',
    'Trichy', 'Salem', 'Tirunelveli', 'Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur',
    'Mangalore', 'Mysore', 'Hubli-Dharwad', 'Belgaum',
    
    // Other Major Cities - East & North-East
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Guwahati', 'Dibrugarh', 'Silchar', 'Shillong',
    'Imphal', 'Aizawl', 'Agartala', 'Itanagar', 'Kohima', 'Gangtok', 'Siliguri', 'Durgapur',
    'Asansol', 'Jamshedpur', 'Dhanbad', 'Bokaro'
  ];

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8", // Use the API key from .env or fallback
    libraries,
  });

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    
    // Check for Places API errors after map loads
    try {
      if (window.google && (!window.google.maps.places || !window.google.maps.places.Autocomplete)) {
        console.error("Places API not available after map load");
        setPlacesApiError(true);
      }
    } catch (error) {
      console.error("Error checking Places API after map load:", error);
      setPlacesApiError(true);
    }
  }, []);

  const [placesApiError, setPlacesApiError] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState('');

  // Listen for Places API errors in console
  useEffect(() => {
    // Create a custom error handler to catch Places API errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
      // Check if the error message contains Places API error
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('Places API error') || 
           args[0].includes('ApiNotActivatedMapError'))) {
        setPlacesApiError(true);
      }
      originalConsoleError.apply(console, args);
    };

    // Restore original console.error on cleanup
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const onSearchBoxLoad = useCallback((ref) => {
    setSearchBox(ref);
    // Check if the Places API is working
    try {
      // This will throw an error if Places API is not enabled
      if (window.google && (!window.google.maps.places || !window.google.maps.places.Autocomplete)) {
        console.error("Places API not available");
        setPlacesApiError(true);
      }
    } catch (error) {
      console.error("Error checking Places API:", error);
      setPlacesApiError(true);
    }
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

  const handleConstraintChange = (e) => {
    setIsLocationConstraint(e.target.checked);
    if (!e.target.checked) {
      // If location is not a constraint, clear any selected location
      setSelectedLocation('');
      setExactCoordinates(null);
      setSelectedAddress('');
    }
  };

  const handleSubmit = () => {
    if (isLocationConstraint && !selectedLocation && !exactCoordinates) {
      setError('Please select a location or use the map search');
      return;
    }

    if (!isLocationConstraint) {
      // If location is not a constraint, clear location data
      localStorage.removeItem('userLocation');
      localStorage.removeItem('userLiveLocation');
      onLocationSelect('');
      setShowPopup(false);
      return;
    }

    if (selectedLocation) {
      // Store location in localStorage
      localStorage.setItem('userLocation', selectedLocation);
      
      // If we have exact coordinates from city search, store them too
      if (exactCoordinates && selectedAddress) {
        const liveLocation = JSON.stringify({ 
          latitude: exactCoordinates.lat, 
          longitude: exactCoordinates.lng,
          address: selectedAddress,
          timestamp: new Date().toISOString() 
        });
        localStorage.setItem('userLiveLocation', liveLocation);
        
        // Call the parent callback with selected location and coordinates
        onLocationSelect(selectedLocation, exactCoordinates, selectedAddress);
      } else {
        // Clear any existing live location data when manually selecting a city without coordinates
        localStorage.removeItem('userLiveLocation');
        
        // Call the parent callback with selected location
        onLocationSelect(selectedLocation);
      }
    } else if (exactCoordinates && selectedAddress) {
      // Store live location in localStorage with exact coordinates
      const liveLocation = JSON.stringify({ 
        latitude: exactCoordinates.lat, 
        longitude: exactCoordinates.lng,
        address: selectedAddress,
        timestamp: new Date().toISOString() 
      });
      localStorage.setItem('userLiveLocation', liveLocation);
      
      // Find the nearest city for display purposes
      const nearestCity = findNearestCity(exactCoordinates.lat, exactCoordinates.lng);
      
      localStorage.setItem('userLocation', nearestCity);
      
      // Call the parent callback with the nearest city and pass coordinates
      onLocationSelect(nearestCity, exactCoordinates, selectedAddress);
    }
    
    // Close popup
    setShowPopup(false);
  };

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Save exact coordinates
        const liveLocationData = {
          latitude,
          longitude,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('userLiveLocation', JSON.stringify(liveLocationData));
        
        // Try to reverse geocode to get the city name
        reverseGeocode(latitude, longitude);
        
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access was denied. Please enable location services.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('The request to get your location timed out.');
            break;
          default:
            setError('An unknown error occurred while getting your location.');
            break;
        }
      }
    );
  };
  
  // Reverse geocode coordinates to get address
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
  // In a real app, you might want to use a more sophisticated approach
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

  // New function to handle city search using Nominatim API
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

      if (response.data && response.data.length > 0) {
        // Filter results to include only cities, towns, or villages
        const filteredResults = response.data.filter(result => 
          result.type === 'city' || 
          result.type === 'town' || 
          result.type === 'village' ||
          result.type === 'administrative' ||
          (result.class === 'place' && 
            (result.type === 'city' || 
            result.type === 'town' || 
            result.type === 'village'))
        );
        
        setCitySearchResults(filteredResults);
        setShowCityResults(true);
      } else {
        setCitySearchResults([]);
        setShowCityResults(true); // Show empty state
      }
    } catch (error) {
      console.error('Error searching for cities:', error);
      setCitySearchResults([]);
      setShowCityResults(true); // Show empty state
    } finally {
      setIsSearchingCity(false);
    }
  };

  // Handle city search input change
  const handleCitySearchChange = (e) => {
    setCitySearchQuery(e.target.value);
    if (e.target.value.trim() === '') {
      setCitySearchResults([]);
      setShowCityResults(false);
    }
  };

  // Handle city selection from search results
  const handleCitySelect = (city, result = null) => {
    // Extract clean city name if full result is provided
    const cityName = result ? result.name || city.split(',')[0].trim() : city;
    
    // Save the selected city
    localStorage.setItem('userLocation', cityName);
    
    // If we have coordinates and location matters, save them
    if (result && result.lat && result.lon && isLocationConstraint) {
      const liveLocationData = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('userLiveLocation', JSON.stringify(liveLocationData));
    } else if (!isLocationConstraint) {
      // If location doesn't matter, clear coordinates
      localStorage.removeItem('userLiveLocation');
    }
    
    // Call the onLocationSelect prop with the selected city
    if (onLocationSelect) {
      onLocationSelect(cityName);
    }
    
    // Close the popup
    setShowPopup(false);
    
    // If location doesn't matter, redirect to homepage
    if (!isLocationConstraint) {
      window.location.href = '/';
    }
  };

  // Handle Enter key press in city search
  const handleCitySearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCitySearch();
    }
  };

  // Handle checkbox change for location preference
  const handleLocationPreferenceChange = (e) => {
    const locationMatters = e.target.checked;
    setIsLocationConstraint(locationMatters);
    
    // Store the preference in localStorage
    if (!locationMatters) {
      localStorage.setItem('locationPreference', 'cityOnly');
    } else {
      localStorage.removeItem('locationPreference');
    }
  };

  // If popup shouldn't be shown, return null
  if (!showPopup) {
    return null;
  }

  // Render loading state while Google Maps is loading
  if (!isLoaded) {
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
  if (loadError) {
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
              onClick={() => setShowPopup(false)}
              className="w-1/2 bg-gray-500 hover:bg-gray-600 text-white py-3"
            >
              Cancel
            </Button>
            <Button
              onClick={selectedLocation ? handleSubmit : handleManualLocationSubmit}
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
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Does the location of our service provider matter to you?
          </h2>
          
          <div className="flex justify-center items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="locationPreference"
              checked={isLocationConstraint}
              onChange={handleLocationPreferenceChange}
              className="w-5 h-5 accent-[#006452]"
            />
            <label htmlFor="locationPreference" className="text-lg font-medium cursor-pointer">
              Yes, location matters to me
            </label>
          </div>
          
          {/* Show current location option if location matters */}
          {isLocationConstraint && (
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-4">
                <p className="text-center font-medium text-gray-800">
                  Use your current location to find service providers nearby
                </p>
                
                <button
                  onClick={handleGetLiveLocation}
                  className="w-full p-3 bg-[#006452] text-white rounded-lg flex items-center justify-center"
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
                </button>
              </div>
            </div>
          )}

          {/* Show locality search options and submit button if location doesn't matter */}
          {!isLocationConstraint && (
            <>
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-4">
                  <p className="text-center font-medium text-gray-800">
                    Search for your locality
                  </p>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type your city name"
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
                  
                  {/* City search results */}
                  {showCityResults && citySearchResults.length > 0 && (
                    <div className="mt-2 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                      {citySearchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => handleCitySelect(result.display_name.split(',')[0], result)}
                          className="w-full p-2 text-left hover:bg-gray-100 border-b border-gray-200"
                        >
                          {result.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* No results message */}
                  {showCityResults && citySearchResults.length === 0 && !isSearchingCity && (
                    <p className="text-center text-gray-500 mt-2">
                      No cities found. Try a different search term.
                    </p>
                  )}
                  
                  {/* Popular cities suggestions */}
                  <div className="mt-4">
                    <p className="text-center text-sm text-gray-500 mb-2">Popular cities:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {cities.slice(0, 6).map((city) => (
                        <button
                          key={city}
                          onClick={() => handleCitySelect(city)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit button only shown when location doesn't matter */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    localStorage.setItem('locationPreference', 'cityOnly');
                    setShowPopup(false);
                    if (onLocationSelect) {
                      onLocationSelect('');
                    }
                  }}
                  className="w-full p-3 bg-[#006452] text-white rounded-lg"
                >
                  Submit
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