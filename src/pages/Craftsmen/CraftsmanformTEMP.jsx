// components/CraftsmanForm/CraftsmanForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

const CraftsmanForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL if in edit mode
    const isEditMode = !!id;

    // Map related states
    const mapContainerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [searchAddress, setSearchAddress] = useState("");

    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        name: '',
        rate: '',
        location: '',
        latitude: '',
        longitude: '',
        category: 'Basic',
        experience: '',
        projectsCompleted: '',
        specialty: '',
        description: '',
        phoneNumber: '',
        email: '',
        portfolio: [],
        googleReviews: '',
        rating: '5', // Default value
        isListed: false, // By default, set to unlisted
    });

    // Initialize AOS for animations
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true
        });
    }, []);

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

        // Get address from coordinates
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

    // Search component using Nominatim
    const SearchBox = () => {
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
                    
                    // Update form data directly
                    setFormData(prev => ({
                        ...prev,
                        latitude: parseFloat(result.lat).toFixed(6),
                        longitude: parseFloat(result.lon).toFixed(6),
                        location: result.display_name.split(',')[0] // Use first part of address
                    }));
                    
                    setSearchAddress(result.display_name);
                    
                    // Update map and marker
                    if (map) {
                        map.setView([parseFloat(result.lat), parseFloat(result.lon)], 13);
                        
                        if (marker) {
                            marker.setLatLng([parseFloat(result.lat), parseFloat(result.lon)]);
                        } else {
                            const newMarker = L.marker([parseFloat(result.lat), parseFloat(result.lon)]).addTo(map);
                            setMarker(newMarker);
                        }
                    }
                    
                    setSearchQuery(''); // Clear the search input after successful search
                } else {
                    toast.error('Location not found in India. Please try a more specific search term.');
                }
            } catch (error) {
                console.error('Error searching for location:', error);
                toast.error('Error searching for location. Please try again.');
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
                            className={`${isSearching ? 'bg-green-600/60' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-r flex items-center justify-center min-w-[100px]`}
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
    };

    // Fetch craftsman data if in edit mode
    useEffect(() => {
        const fetchCraftsman = async () => {
            if (!isEditMode) return;

            try {
                setFetchLoading(true);
                const res = await axios.get(`http://localhost:3000/api/craftsmen/${id}`);

                // Format the data for the form
                const craftsman = res.data;
                setFormData({
                    name: craftsman.name || '',
                    rate: craftsman.rate || '',
                    location: craftsman.location || '',
                    latitude: craftsman.latitude || '',
                    longitude: craftsman.longitude || '',
                    category: craftsman.category || 'Basic',
                    experience: craftsman.experience || '',
                    projectsCompleted: craftsman.projectsCompleted || '',
                    specialty: craftsman.specialty || '',
                    description: craftsman.description || '',
                    phoneNumber: craftsman.phoneNumber || '',
                    email: craftsman.email || '',
                    portfolio: craftsman.portfolio || [],
                    googleReviews: craftsman.googleReviews || '',
                    rating: craftsman.rating || '5',
                    isListed: craftsman.isListed || false,
                });
            } catch (err) {
                console.error('Error fetching craftsman:', err);
                setMessage({
                    type: 'error',
                    text: 'Failed to load craftsman data. Please try again or create a new profile.'
                });
                toast.error('Failed to load craftsman data.');
            } finally {
                setFetchLoading(false);
            }
        };

        fetchCraftsman();
    }, [id, isEditMode]);

    // Handle text input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for rate to ensure proper format
        if (name === 'rate') {
            // Strip non-numeric characters except for the first occurrence of '₹'
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData({ ...formData, [name]: `₹ ${numericValue}/hr` });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Improved file upload handling
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Check file size and type
        const invalidFiles = files.filter(file => {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File ${file.name} is too large. Maximum file size is 10MB.`);
                return true;
            }
            
            // Check file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                toast.error(`File ${file.name} is not a valid image type. Please upload JPEG, PNG, or GIF.`);
                return true;
            }
            
            return false;
        });

        // If any files are invalid, stop upload
        if (invalidFiles.length > 0) return;

        setUploadingImages(true);
        setMessage({ type: 'info', text: 'Uploading images to Cloudinary...' });

        try {
            if (files.length === 1) {
                // Single file upload
                const formData = new FormData();
                formData.append('file', files[0]);
                formData.append('fileCategory', 'craftsman-portfolios');

                const response = await axios.post('http://localhost:3000/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Add the new image URL to the portfolio array
                setFormData(prevData => ({
                    ...prevData,
                    portfolio: [...prevData.portfolio, response.data.secure_url]
                }));
            } else {
                // Multiple file upload
                const uploadFormData = new FormData();
                files.forEach(file => {
                    uploadFormData.append('files', file);
                });
                uploadFormData.append('fileCategory', 'craftsman-portfolios');

                const response = await axios.post('http://localhost:3000/api/upload/multiple', uploadFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Add all new image URLs to the portfolio array
                const uploadedUrls = response.data.map(item => item.secure_url);
                setFormData(prevData => ({
                    ...prevData,
                    portfolio: [...prevData.portfolio, ...uploadedUrls]
                }));
            }

            setMessage({ type: 'success', text: 'Images uploaded successfully!' });
            toast.success('Images uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to upload images. Please try again.'
            });
            toast.error(error.response?.data?.message || 'Failed to upload images. Please try again.');
        } finally {
            setUploadingImages(false);
        }
    };

    // Remove an uploaded image
    const removeImage = (indexToRemove) => {
        setFormData({
            ...formData,
            portfolio: formData.portfolio.filter((_, index) => index !== indexToRemove)
        });
    };

    // Validate form fields
    const validateForm = () => {
        const requiredFields = [
            { field: 'name', label: 'Craftsman Name' },
            { field: 'rate', label: 'Rate' },
            { field: 'location', label: 'Location' },
            { field: 'category', label: 'Category' },
            { field: 'experience', label: 'Experience' },
            { field: 'projectsCompleted', label: 'Projects Completed' },
            { field: 'specialty', label: 'Specialty' },
            { field: 'description', label: 'Description' },
            { field: 'phoneNumber', label: 'Phone Number' },
            { field: 'email', label: 'Email Address' },
            { field: 'googleReviews', label: 'Google Reviews Count' }
        ];

        // Check each required field
        for (const { field, label } of requiredFields) {
            if (!formData[field] || formData[field].trim() === '') {
                toast.error(`${label} is required.`);
                return false;
            }
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address.');
            return false;
        }

        // Check phone number format (10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
            toast.error('Please enter a valid 10-digit phone number.');
            return false;
        }

        // Check portfolio images (minimum 5 required)
        if (formData.portfolio.length < 5) {
            toast.error('At least 5 portfolio images are required.');
            return false;
        }

        // Add location validation - if location is provided, make sure coordinates are too
        if (formData.location && (!formData.latitude || !formData.longitude)) {
            toast.error('Please select a location on the map or use the search function.');
            return false;
        }

        return true; // All validations passed
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setMessage({ type: 'info', text: `${isEditMode ? 'Updating' : 'Creating'} craftsman profile...` });

        try {
            let response;

            // Prepare form data for submission
            const submissionData = {
                ...formData,
                // Ensure rateNumeric is calculated for backend filtering
                rateNumeric: parseInt(formData.rate.replace(/[^\d]/g, ''), 10),
                isListed: formData.isListed // Include the listing status
            };

            if (isEditMode) {
                // Update existing craftsman
                response = await axios.put(`http://localhost:3000/api/craftsmen/${id}`, submissionData);
            } else {
                // Create new craftsman
                response = await axios.post('http://localhost:3000/api/craftsmen', submissionData);
            }

            setMessage({
                type: 'success',
                text: `Craftsman profile ${isEditMode ? 'updated' : 'created'} successfully! ${!isEditMode ? 'Your profile will be reviewed by an admin before being listed.' : ''}`
            });
            
            toast.success(`Craftsman profile ${isEditMode ? 'updated' : 'created'} successfully! ${!isEditMode ? 'Your profile will be reviewed by an admin before being listed.' : ''}`);

            // Redirect to craftsmen list after successful submission
            setTimeout(() => {
                navigate('/craftsmen');
            }, 3000);

        } catch (error) {
            console.error('Submission error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'save'} profile. Please try again.`
            });
            toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'save'} profile. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while fetching data in edit mode
    if (isEditMode && fetchLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006452]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg" data-aos="fade-up">
                    <h2 className="text-2xl font-bold text-[#006452] mb-6">
                        {isEditMode ? 'Edit Craftsman Profile' : 'Add New Craftsman'}
                    </h2>

                    {message.text && (
                        <div className={`p-4 mb-6 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' :
                            message.type === 'success' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Craftsman Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                                    placeholder="Full Name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rate (₹/hr) *
                                </label>
                                <input
                                    type="text"
                                    name="rate"
                                    value={formData.rate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                                    placeholder="₹ 250/hr"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                                    placeholder="Area/Neighborhood/City"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                                >
                                    <option value="Basic">Basic</option>
                                    <option value="Standard">Standard</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Luxury">Luxury</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Specialty *
                                </label>
                                <input
                                    type="text"
                                    name="specialty"
                                    value={formData.specialty}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                                    placeholder="e.g. Woodworking, Plumbing, etc."
                                />
                            </div>

                            {/* Google Reviews Count */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Google Reviews Count *
                                </label>
                                <input
                                    type="number"
                                    name="googleReviews"
                                    value={formData.googleReviews}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                                    placeholder="Number of Google reviews"
                                />
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rating (out of 5) *
                                </label>
                                <select
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                                >
                                    <option value="5">5 Stars</option>
                                    <option value="4.5">4.5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3.5">3.5 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2.5">2.5 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1.5">1.5 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Experience (years) *
                                </label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                                    placeholder="e.g. 5+"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Projects Completed *
                                </label>
                                <input
                                    type="text"
                                    name="projectsCompleted"
                                    value={formData.projectsCompleted}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                                    placeholder="e.g. 100+"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                                    placeholder="10-digit number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>

                        {/* Craftsman Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                                placeholder="Brief description of the craftsman's expertise and skills..."
                            ></textarea>
                        </div>

                        {/* Portfolio Images Upload - requiring at least 5 images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Portfolio Images * <span className="text-red-500">(minimum 5 images required)</span>
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-[#006452] hover:text-[#004d3b] focus-within:outline-none"
                                        >
                                            <span>Upload files</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={handleFileUpload}
                                                disabled={uploadingImages || loading}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>

                                    {/* Upload Progress Indicator */}
                                    {uploadingImages && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-center">
                                                <div className="w-4 h-4 rounded-full bg-[#006452] animate-pulse mr-2"></div>
                                                <span className="text-sm text-[#006452]">Uploading to Cloudinary...</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Image Count Indicator */}
                                    <div className="mt-2">
                                        <span className={`text-sm ${formData.portfolio.length >= 5 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                                            {formData.portfolio.length} of 5 required images uploaded
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Display uploaded images */}
                            {formData.portfolio.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {formData.portfolio.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image}
                                                alt={`Portfolio ${index + 1}`}
                                                className="h-24 w-full object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                                            >
                                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Location field with map */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Location Information</h3>
                            
                            <div className="form-group">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Area/Neighborhood/City"
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">This field is automatically filled when selecting a location on the map, but can be edited manually if needed.</p>
                            </div>
                            
                            {/* Map Search */}
                            <div className="form-group">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Search Location or Click on Map
                                </label>
                                <SearchBox />
                            </div>
                            
                            {/* Map Container */}
                            <div style={{ position: 'relative', height: '400px', width: '100%', marginTop: '12px' }}>
                                <div
                                    ref={mapContainerRef}
                                    style={{ height: '100%', width: '100%' }}
                                    className="rounded border border-gray-300"
                                ></div>
                                
                                {mapLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                                            <p className="mt-2 text-green-500">Loading map...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Display selected address if available */}
                            {searchAddress && (
                                <div className="mt-2 p-2 bg-gray-100 rounded flex justify-between items-center">
                                    <p className="text-sm"><strong>Selected Address:</strong> {searchAddress}</p>
                                    <button
                                        type="button"
                                        onClick={clearLocationSelection}
                                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                            
                            {/* Hidden coordinates fields */}
                            <input type="hidden" name="latitude" value={formData.latitude} />
                            <input type="hidden" name="longitude" value={formData.longitude} />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/craftsmen')}
                                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading || uploadingImages}
                                className="px-6 py-3 bg-[#006452] text-white rounded-md hover:bg-[#004d3b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006452] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? `${isEditMode ? 'Updating...' : 'Saving...'}` : `${isEditMode ? 'Update' : 'Save'} Craftsman Profile`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CraftsmanForm;