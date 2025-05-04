import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import ResponsiveAdminContainer from '../../components/Admin/ResponsiveAdminContainer';
import 'leaflet/dist/leaflet.css';

const API_URL = "https://inty-backend.onrender.com/api";

// Search component using Nominatim
function SearchBox({ onPlaceSelected }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Function to handle the search using Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);

      // Regular search using Nominatim
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}${searchQuery.toLowerCase().includes('india') ? '' : ', india'}&limit=5&countrycodes=in`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9'
          }
        }
      );

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        onPlaceSelected({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name
        });
        setSearchQuery(''); // Clear the search input after successful search
      } else {
        alert('Location not found in India. Please try a more specific search term.');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      alert('Error searching for location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div>
      <div className="bg-white p-2 rounded shadow-md">
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a location in India"
            className="p-2 border rounded-l w-full"
            disabled={isSearching}
          />
          <button
            type="button"
            onClick={handleSearch}
            className={`${isSearching ? 'bg-[#006452]/60' : 'bg-[#006452] hover:bg-[#004d3b]'} text-white px-4 py-2 rounded-r flex items-center justify-center min-w-[100px]`}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : 'Search'}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">For better results, include city/state name (e.g., "Koramangala, Bangalore")</p>
    </div>
  );
}

const AdminCraftsmanEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isAddMode = !id;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Map related states
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [searchAddress, setSearchAddress] = useState("");

  // Cities options based on the screenshots
  const citiesOptions = [
    "Agra", "Ahmedabad", "Ajmer", "Akola", "Aligarh", "Allahabad", "Amravati", "Amritsar",
    "Aurangabad", "Bengaluru", "Bareilly", "Belgaum", "Bhavnagar", "Bhilai", "Bhiwandi",
    "Bhopal", "Bhubaneswar", "Bikaner", "Bilaspur", "Bokaro", "Chandigarh", "Chennai",
    "Coimbatore", "Cuttack", "Dehradun", "Delhi", "Dhanbad", "Durgapur", "Faridabad",
    "Firozabad", "Ghaziabad", "Gorakhpur", "Gulbarga", "Guntur", "Gurgaon", "Guwahati",
    "Gwalior", "Hubli", "Hyderabad", "Indore", "Jabalpur", "Jaipur", "Jalandhar", "Jammu",
    "Jamnagar", "Jamshedpur", "Jhansi", "Jodhpur", "Kanpur", "Kochi", "Kolhapur", "Kolkata",
    "Kota", "Kozhikode", "Kurnool", "Lucknow", "Ludhiana", "Madurai", "Mangalore", "Meerut",
    "Mumbai", "Mysore", "Nagpur", "Nashik", "Navi Mumbai", "Noida", "Patna", "Pondicherry",
    "Pune", "Raipur", "Rajkot", "Ranchi", "Rourkela", "Salem", "Sangli", "Siliguri", "Solapur",
    "Srinagar", "Surat", "Thiruvananthapuram", "Thrissur", "Tiruchirappalli", "Tirunelveli",
    "Tiruppur", "Ujjain", "Vadodara", "Varanasi", "Vijayawada", "Visakhapatnam", "Warangal",
    "Agartala", "Aizawl", "Aligarh", "Alwar", "Ambala", "Ambarnath", "Ambikapur", "Anand", "Anantapur"
  ];

  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    location: '', // Keep for backward compatibility
    availableCities: [],
    category: 'Basic',
    experience: '',
    projectsCompleted: '',
    phoneNumber: '',
    email: '',
    portfolio: [],
    googleReviews: '',
    rating: '5', // Default value
    show: true, // Default to listed
    latitude: '', // Keep for backward compatibility
    longitude: '', // Keep for backward compatibility
    website: '',
    address: '',
    googleLocation: '',
    pincode: '',
    type: 'Solo', // Default value
  });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Fetch craftsman data if in edit mode
    if (!isAddMode) {
      fetchCraftsman();
    }
  }, [navigate, isAddMode, id]);

  // Initialize Leaflet map
  useEffect(() => {
    // Skip if no container or if map is already initialized
    if (!mapContainerRef.current || map) return;

    // Import Leaflet dynamically to avoid SSR issues
    import('leaflet').then(L => {
      // Fix for default marker icon
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });

      // Clean up any existing map instance first
      if (map) {
        map.remove();
        setMap(null);
        setMarker(null);
      }

      // Create map centered on India
      const newMap = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);

      // Use CartoDB Voyager tiles for better India coverage
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(newMap);

      // Add scale control for better distance reference
      L.control.scale().addTo(newMap);

      // Add click handler
      newMap.on('click', handleMapClick);

      // Save map reference
      setMap(newMap);
      setMapLoading(false);

      // If we have coordinates already, add a marker
      if (formData.latitude && formData.longitude) {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          const newMarker = L.marker([lat, lng]).addTo(newMap);
          setMarker(newMarker);
          newMap.setView([lat, lng], 13);
          fetchAddressFromCoordinates(lat, lng);
        }
      }
    });

    // Cleanup on unmount
    return () => {
      if (map) {
        map.remove();
        setMap(null);
        setMarker(null);
      }
    };
  }, [mapContainerRef.current, formData.latitude, formData.longitude]);

  const fetchCraftsman = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get(`${API_URL}/craftsmen/${id}`);
      const craftsmanData = response.data;
      
      // Handle existing data and ensure backward compatibility
      const availableCities = craftsmanData.availableCities || [];
      const location = craftsmanData.location || (availableCities.length > 0 ? availableCities[0] : '');
      
      setFormData({
        name: craftsmanData.name || '',
        rate: craftsmanData.rate || '',
        location: location, // Set location field for backward compatibility
        availableCities: availableCities,
        category: craftsmanData.category || 'Basic',
        experience: craftsmanData.experience || '',
        projectsCompleted: craftsmanData.projectsCompleted || '',
        phoneNumber: craftsmanData.phoneNumber || '',
        email: craftsmanData.email || '',
        portfolio: craftsmanData.portfolio || [],
        googleReviews: craftsmanData.googleReviews || '',
        rating: craftsmanData.rating || '5',
        show: craftsmanData.show !== false, // Default to true if not specified
        latitude: craftsmanData.latitude || '',
        longitude: craftsmanData.longitude || '',
      });
    } catch (err) {
      console.error('Error fetching craftsman:', err);
      setError('Failed to load craftsman data. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle map click
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;

    // Update form data
    setFormData({
      ...formData,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    });

    // Update marker
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else if (map) {
      const newMarker = L.marker([lat, lng]).addTo(map);
      setMarker(newMarker);
    }

    // Get address from coordinates using Nominatim
    fetchAddressFromCoordinates(lat, lng);
  };

  // Fetch address from coordinates
  const fetchAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&countrycodes=in`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9'
          }
        }
      );

      if (response.data && response.data.display_name) {
        setSearchAddress(response.data.display_name);
        // Extract the city or neighborhood from the address
        const address = response.data;
        let locationName = address.address?.city || 
                          address.address?.town || 
                          address.address?.village || 
                          address.address?.suburb ||
                          address.address?.neighbourhood ||
                          address.address?.county;
        
        if (locationName) {
          setFormData(prev => ({
            ...prev,
            location: locationName
          }));
        } else {
          // If we can't extract a specific part, use the first part of the display name
          const shortLocation = address.display_name.split(',')[0];
          if (shortLocation) {
            setFormData(prev => ({
              ...prev,
              location: shortLocation
            }));
          }
        }
      } else {
        setSearchAddress("");
      }
    } catch (error) {
      console.error("Error getting address from coordinates:", error);
      setSearchAddress("");
    }
  };

  // Handle place selection from search
  const handlePlaceSelected = (place) => {
    if (!place) return;

    const { lat, lng, address } = place;

    setSearchAddress(address);

    // Update form data with coordinates
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));

    // Try to extract city or neighborhood
    const addressParts = address.split(', ');
    if (addressParts.length > 0) {
      // Use the first part as the location name
      setFormData(prev => ({
        ...prev,
        location: addressParts[0]
      }));
    }

    // Update map and marker
    if (map) {
      map.setView([lat, lng], 13);

      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        const newMarker = L.marker([lat, lng]).addTo(map);
        setMarker(newMarker);
      }
    }
  };

  // Function to clear location selection
  const clearLocationSelection = () => {
    setSearchAddress("");

    // Remove marker
    if (marker && map) {
      map.removeLayer(marker);
      setMarker(null);
    }

    // Reset map view
    if (map) {
      map.setView([20.5937, 78.9629], 5);
    }

    setFormData(prev => ({
      ...prev,
      latitude: "",
      longitude: "",
      location: ""
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Function to add a city to availableCities and update location
  const handleAddCity = (city) => {
    if (!formData.availableCities.includes(city)) {
      const newAvailableCities = [...formData.availableCities, city];
      setFormData(prev => ({
        ...prev,
        availableCities: newAvailableCities,
        // Only set location if it's not already set
        location: prev.location || city,
      }));
    }
  };

  // Function to remove a city from availableCities and update location
  const handleRemoveCity = (indexToRemove) => {
    const newAvailableCities = formData.availableCities.filter((_, i) => i !== indexToRemove);
    setFormData(prev => ({
      ...prev,
      availableCities: newAvailableCities,
      // Update location field if the removed city was the primary location
      location: prev.location === prev.availableCities[indexToRemove] 
        ? (newAvailableCities.length > 0 ? newAvailableCities[0] : '') 
        : prev.location,
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    try {
      setUploadingImages(true);
      
      // Check filesize restrictions
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setError("One or more files exceed the 10MB limit. Please compress your images.");
          setUploadingImages(false);
          return;
        }
      }
      
      const uploadPromises = files.map(async file => {
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', file);
        
        // Use the backend API for uploading instead of direct Cloudinary API
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload/craftsman-portfolio`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
          }
        );
        
        return response.data.url;
      });
      
      const imageUrls = await Promise.all(uploadPromises);
      
      setFormData(prevData => ({
        ...prevData,
        portfolio: [...prevData.portfolio, ...imageUrls]
      }));
      
      setSuccessMessage("Images uploaded successfully!");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading images:', error);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prevData => ({
      ...prevData,
      portfolio: prevData.portfolio.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form
    if (!formData.name || !formData.rate || formData.availableCities.length === 0 || !formData.experience || !formData.projectsCompleted || !formData.phoneNumber || !formData.email) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      
      // Preserve the existing location field if it exists
      const dataToSubmit = {
        ...formData,
        // Only set location to first city if it's empty but we have cities
        location: formData.location || (formData.availableCities.length > 0 ? formData.availableCities[0] : ''),
      };
      
      const method = isAddMode ? 'post' : 'put';
      const url = isAddMode ? `${API_URL}/craftsmen` : `${API_URL}/craftsmen/${id}`;
      
      await axios({
        method,
        url,
        data: dataToSubmit,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccessMessage(isAddMode ? 'Craftsman created successfully!' : 'Craftsman updated successfully!');
      
      // Navigate back to the craftsmen list after a short delay
      setTimeout(() => {
        navigate('/admin/craftsmen');
      }, 1000);
    } catch (err) {
      console.error('Error saving craftsman:', err);
      setError(err.response?.data?.message || 'Failed to save craftsman. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveAdminContainer 
      title={isAddMode ? "Add Craftsman" : "Edit Craftsman"} 
      showBackButton 
      backTo="/admin/craftsmen"
    >
      {fetchLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006452]"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Rate (per hour) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Available Cities/Locations <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cities..."
                  className="w-full p-2 border rounded"
                  onFocus={(e) => {
                    const cityDropdown = document.getElementById('cityDropdown');
                    if (cityDropdown) {
                      cityDropdown.classList.remove('hidden');
                    }
                  }}
                  onChange={(e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const cityDropdown = document.getElementById('cityDropdown');
                    
                    if (searchTerm.length > 0) {
                      cityDropdown.classList.remove('hidden');
                    } else {
                      cityDropdown.classList.add('hidden');
                    }

                    // Filter cities based on search
                    const cityItems = cityDropdown.getElementsByTagName('div');
                    let visibleCount = 0;
                    for (let i = 0; i < cityItems.length; i++) {
                      const cityText = cityItems[i].textContent.toLowerCase();
                      if (cityText.includes(searchTerm)) {
                        cityItems[i].classList.remove('hidden');
                        visibleCount++;
                        // Limit visible items to improve performance
                        if (visibleCount > 50) {
                          cityItems[i].classList.add('hidden');
                        }
                      } else {
                        cityItems[i].classList.add('hidden');
                      }
                    }
                  }}
                />
                {formData.availableCities.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">Please select at least one city</p>
                )}
                <div
                  id="cityDropdown"
                  className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto hidden"
                >
                  {citiesOptions.map((city, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        // Use custom handler to maintain location field
                        handleAddCity(city);
                        // Hide dropdown
                        const dropdown = document.getElementById('cityDropdown');
                        if (dropdown) {
                          dropdown.classList.add('hidden');
                        }
                        // Clear the search input
                        const searchInput = document.querySelector('input[placeholder="Search cities..."]');
                        if (searchInput) {
                          searchInput.value = '';
                        }
                      }}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              </div>

              {/* Display selected cities as tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.availableCities.map((city, index) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                    {city}
                    <button
                      type="button"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      onClick={() => handleRemoveCity(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">All selected cities will be used for filtering. Users will be able to find this craftsman when searching in any of these locations.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                >
                  <option value="Solo">Solo</option>
                  <option value="Company">Company</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Google Location
                </label>
                <input
                  type="text"
                  name="googleLocation"
                  value={formData.googleLocation}
                  onChange={handleChange}
                  placeholder="Google Maps URL or location name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Pin Code
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
              
              
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Experience (years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Projects Completed <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="projectsCompleted"
                  value={formData.projectsCompleted}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
            </div>
            
           
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Google Reviews
              </label>
              <input
                type="number"
                name="googleReviews"
                value={formData.googleReviews}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Rating
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              >
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="show"
                  checked={formData.show}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Listed (visible to users)</span>
              </label>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Portfolio Images <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="portfolio-upload"
                  disabled={uploadingImages}
                />
                <label
                  htmlFor="portfolio-upload"
                  className="cursor-pointer block text-center py-2 px-4 bg-[#006452] text-white rounded-md hover:bg-[#00543f] transition duration-300"
                >
                  {uploadingImages ? "Uploading..." : "Upload Images"}
                </label>
                <p className="text-gray-500 text-sm mt-2">Upload craftsman's portfolio images (max 10MB per image)</p>
                
                {formData.portfolio.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Uploaded Images:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {formData.portfolio.map((image, index) => (
                        <div key={index} className="relative group">
                          <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin/craftsmen')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-4 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#006452] text-white rounded-md hover:bg-[#00543f] transition-colors"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Craftsman"}
              </button>
            </div>
          </form>
        </div>
      )}
    </ResponsiveAdminContainer>
  );
};

export default AdminCraftsmanEdit;