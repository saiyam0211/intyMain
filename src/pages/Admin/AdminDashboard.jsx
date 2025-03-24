import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';
import React, { useState, useEffect, useCallback, useRef } from 'react';

// Search component using OpenStreetMap's Nominatim instead of Google Places
function SearchBox({ onPlaceSelected }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Function to extract coordinates from Google Maps URL
  const extractCoordsFromGoogleMapsUrl = (url) => {
    try {
      // Handle Google Maps URLs with @lat,lng format
      const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        return {
          lat: parseFloat(atMatch[1]),
          lng: parseFloat(atMatch[2])
        };
      }

      // Handle Google Maps URLs with ll=lat,lng format
      const llMatch = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (llMatch) {
        return {
          lat: parseFloat(llMatch[1]),
          lng: parseFloat(llMatch[2])
        };
      }

      // Handle Google Maps URLs with q=lat,lng format
      const qMatch = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) {
        return {
          lat: parseFloat(qMatch[1]),
          lng: parseFloat(qMatch[2])
        };
      }

      return null;
    } catch (error) {
      console.error("Error extracting coordinates from URL:", error);
      return null;
    }
  };

  // Function to handle the search using Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);

      // Check if the input is a Google Maps URL
      if (searchQuery.includes('google.com/maps') || searchQuery.includes('goo.gl/maps')) {
        const coords = extractCoordsFromGoogleMapsUrl(searchQuery);

        if (coords) {
          // Get address from coordinates
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1&countrycodes=in`,
            {
              headers: {
                'Accept-Language': 'en-US,en;q=0.9'
              }
            }
          );

          if (response.data && response.data.display_name) {
            onPlaceSelected({
              lat: coords.lat,
              lng: coords.lng,
              address: response.data.display_name
            });
            setSearchQuery(''); // Clear the search input after successful search
          } else {
            alert('Could not find address for this location. The coordinates have been captured.');
            onPlaceSelected({
              lat: coords.lat,
              lng: coords.lng,
              address: `Latitude: ${coords.lat}, Longitude: ${coords.lng}`
            });
            setSearchQuery('');
          }
          setIsSearching(false);
          return;
        }
      }

      // Regular search using Nominatim if not a Google Maps URL or couldn't extract coordinates
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
    <div className="mb-4">
      <div className="bg-white p-2 rounded shadow-md">
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a location in India or paste Google Maps URL"
            className="p-2 border rounded-l w-full"
            disabled={isSearching}
          />
          <button
            type="button"
            onClick={handleSearch}
            className={`${isSearching ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-r flex items-center justify-center min-w-[100px]`}
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
      <p className="text-xs text-gray-500 mt-1">For better results, include city/state name (e.g., "Koramangala, Bangalore") or paste a Google Maps URL</p>
    </div>
  );
}

const AdminDashboard = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default India center
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchAddress, setSearchAddress] = useState("");
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const mapContainerRef = useRef(null);
  const [offerTags, setOfferTags] = useState([]);
  const [awardTags, setAwardTags] = useState([]);
  const [uspTags, setUspTags] = useState([]);
  const [offerInput, setOfferInput] = useState("");
  const [awardInput, setAwardInput] = useState("");
  const [uspInput, setUspInput] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('companyFormData');
    return savedData ? JSON.parse(savedData) : {
      // Original fields
      name: "",
      projects: "",
      experience: "",
      calculatedExperience: "",
      yearError: "",
      branches: "",
      logo: null,
      // New fields from screenshots
      registeredCompanyName: "",
      nameDisplay: "",
      description: "",
      availableCities: [],
      officialWebsite: "",
      fullName: "",
      designation: "",
      phoneNumber: "",
      minMaxBudget: "",
      type: [],
      bannerImages: [], // Empty array, not Array(10).fill(null)
      discountsOfferTimeline: "",
      numberOfProjectsCompleted: "",
      digitalBrochure: null,
      usp: "",
      contactEmail: "",
      googleRating: "",
      googleReviews: "",
      googleReviewCount: "", // Add this new field
      anyAwardWon: "",
      categoryType: "",
      paymentType: [],
      assured: "",
      latitude: "",
      longitude: "",
      // workInTeams: "",
      deliveryTimeline: "",
      basicPriceRange: "",
      premiumPriceRange: "",
      luxuryPriceRange: "",
      serviceCategories: [],
      projectType: "", // Changed from "residential" to empty string
      propertySizeRange: "", // Changed from "small" to empty string
      priceRange: "", // Changed from "budget" to empty string
    };
  });
  const navigate = useNavigate();
  const [uploadingImages, setUploadingImages] = useState(false);

  // Cities options based on the screenshots
  const citiesOptions = [
    "Agra", "Ahmedabad", "Ajmer", "Akola", "Aligarh", "Allahabad", "Amravati", "Amritsar",
    "Aurangabad", "Bangalore", "Bareilly", "Belgaum", "Bhavnagar", "Bhilai", "Bhiwandi",
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
    // Adding more Indian cities
    "Agartala", "Aizawl", "Aligarh", "Alwar", "Ambala", "Ambarnath", "Ambikapur", "Anand", "Anantapur",
    "Asansol", "Avadi", "Baharampur", "Balasore", "Ballari", "Bathinda", "Begusarai", "Berhampur",
    "Bhagalpur", "Bharatpur", "Bhilwara", "Bhimavaram", "Bhind", "Bhiwani", "Bhubaneswar", "Bidar",
    "Bijapur", "Bikaner", "Bilaspur", "Budaun", "Bulandshahr", "Burhanpur", "Buxar", "Champdani",
    "Chandrapur", "Chhatarpur", "Chhindwara", "Chittoor", "Cuddalore", "Darbhanga", "Davanagere",
    "Deoghar", "Dewas", "Dhanbad", "Dharwad", "Dibrugarh", "Dindigul", "Durg", "Durgapur", "Eluru",
    "Erode", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Gandhidham", "Gandhinagar", "Gangtok",
    "Gaya", "Gopalpur", "Gudivada", "Gulbarga", "Guntakal", "Guntur", "Gurgaon", "Haldia", "Hapur",
    "Hardwar", "Hazaribagh", "Hindupur", "Hospet", "Howrah", "Imphal", "Itanagar", "Jehanabad", "Jhunjhunu",
    "Kadapa", "Kakinada", "Kalyan", "Kamarhati", "Kanchipuram", "Karaikudi", "Karawal Nagar", "Karimnagar",
    "Karnal", "Katihar", "Khammam", "Kharagpur", "Kirari Suleman Nagar", "Kishanganj", "Kolar", "Kolhapur",
    "Kollam", "Korba", "Kottayam", "Kulti", "Kumbakonam", "Latur", "Loni", "Ludhiana", "Machilipatnam",
    "Madanapalle", "Madhyamgram", "Mahaboobnagar", "Maheshtala", "Malegaon", "Malerkotla", "Mangalore",
    "Mathura", "Mau", "Medinipur", "Mira-Bhayandar", "Miryalaguda", "Mirzapur", "Morbi", "Morena", "Motihari",
    "Munger", "Muzaffarnagar", "Muzaffarpur", "Nadiad", "Nagercoil", "Nagpur", "Naihati", "Nanded", "Nandyal",
    "Narasaraopet", "Nashik", "Nellore", "New Delhi", "Nizamabad", "Ongole", "Orai", "Ozhukarai", "Pali",
    "Pallavaram", "Panchkula", "Panihati", "Panipat", "Panvel", "Parbhani", "Pathankot", "Patiala", "Patna",
    "Phagwara", "Pimpri-Chinchwad", "Pollachi", "Pondicherry", "Proddatur", "Pudukkottai", "Pune", "Puri",
    "Purnia", "Raichur", "Raiganj", "Raipur", "Rajahmundry", "Rajkot", "Rajpur Sonarpur", "Ramagundam",
    "Rampur", "Ranchi", "Ratlam", "Rewa", "Rohtak", "Rourkela", "Sagar", "Saharanpur", "Saharsa", "Salem",
    "Sambalpur", "Sambhal", "Sangli", "Santipur", "Sasaram", "Satara", "Satna", "Secunderabad", "Serampore",
    "Shahjahanpur", "Shimla", "Shimoga", "Shivpuri", "Sikar", "Silchar", "Siliguri", "Singrauli", "Sirsa",
    "Sitapur", "Siwan", "Solapur", "Sonipat", "Sri Ganganagar", "Srikakulam", "Srinagar", "Surendranagar",
    "Suryapet", "Tadepalligudem", "Tadipatri", "Tenali", "Tezpur", "Thanjavur", "Thoothukudi", "Thrissur",
    "Tinsukia", "Tiruchirapalli", "Tirunelveli", "Tirupati", "Tirupur", "Tiruvottiyur", "Tumkur", "Udaipur",
    "Udupi", "Ujjain", "Ulhasnagar", "Uluberia", "Unnao", "Vadodara", "Valsad", "Vapi", "Varanasi", "Vasai-Virar",
    "Vellore", "Vijayawada", "Visakhapatnam", "Vizianagaram", "Warangal", "Yamunanagar", "Yavatmal"
  ];

  // Age of company options
  const ageOptions = ["0-1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

  // Budget options
  const budgetOptions = ["Any budget", "upto ₹5 Lakh", "upto ₹10 Lakh", "upto ₹15 Lakh", "upto ₹20 Lakh", "Above ₹20 Lakh"];

  // Type options
  const typeOptions = ["Residential", "Commercial"];

  // Category type options
  const categoryOptions = ["Interior Designer", "Architect", "Contractor", "Home Decor"];

  // Payment type options
  const paymentOptions = ["Full Payment", "Installments", "Milestone-based"];

  // Assured options
  const assuredOptions = ["Yes", "No"];

  // Team options
  const teamOptions = ["Yes", "No"];

  // Rating Options
  const ratingOptions = ["", "0.0", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"];
  // Project Type options (for search)
  const projectTypeOptions = ["Studio", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "Duplex", "Penthouse", "Villa", "Commercial", "Kitchen", "Bedroom", "Bathroom"];
  // Property Size options (for search)
  const propertySizeRangeOptions = ["400 to 600", "600 - 800", "800 - 1000", "1000 - 1200", "1200 - 1400", "1400 - 1600", "1600 - 1800",
    "1800 - 2000", "2000 - 2400", "2400 - 2800", "2800 - 3200", "3200 - 4000", "4000 - 5000", "5000+"];
  // Price Range options (for search)
  const priceRangeOptions = ["1Lakh to 3Lakh", "3Lakh to 6Lakh", "6Lakh to 10Lakh", "10Lakh to 15Lakh", "15Lakh to 20Lakh",
    "20Lakh to 25Lakh", "25Lakh to 30Lakh", "30Lakh to 40Lakh", "40Lakh+"];
  // Service Categories options (for search)
  const serviceCategoriesOptions = ["Kitchen Design", "Bedroom Design", "Living Room", "Bathroom", "Full Home", "Office Space", "Commercial Space", "Outdoor Design"];

  // Add this right after serviceCategoriesOptions and before API_URL (around line 317)
  const deliveryTimelineOptions = [
    "1 month", "2 months", "3 months", "4 months", "5 months",
    "6 months", "9 months", "12 months", "18 months", "24 months"
  ];

  // Set API_URL
  const API_URL = "http://localhost:3000/api";

  // Helper function to convert file to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

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
    });

    // Cleanup on unmount
    return () => {
      if (map) {
        map.remove();
        setMap(null);
        setMarker(null);
      }
    };
  }, [mapContainerRef.current]);

  // Handle map click
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;

    // Update selected location
    setSelectedLocation({ lat, lng });

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

    // Update selected location
    setSelectedLocation({ lat, lng });
    setSearchAddress(address);

    // Update form data
    setFormData({
      ...formData,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    });

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
    setSelectedLocation(null);
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

    setFormData({
      ...formData,
      latitude: "",
      longitude: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for select fields that should not have duplicates
    if (name === 'deliveryTimeline') {
      setFormData({ ...formData, [name]: value }); // Just store the single value
      return;
    }

    // If the field is "experience" (which is now the year of establishment)
    if (name === "experience") {
      // Calculate years of experience based on current year
      const currentYear = new Date().getFullYear();
      const establishmentYear = parseInt(value);

      // Only calculate if the input is a valid year
      if (!isNaN(establishmentYear) && establishmentYear > 0 && establishmentYear <= currentYear) {
        const yearsOfExperience = currentYear - establishmentYear;
        setFormData({
          ...formData,
          [name]: value,
          calculatedExperience: yearsOfExperience.toString(), // Store calculated experience
          yearError: "" // Clear any previous error
        });
      } else {
        // Just update the establishment year without calculating experience
        let errorMsg = "";
        if (value !== "") {
          if (isNaN(establishmentYear)) {
            errorMsg = "Please enter a valid year";
          } else if (establishmentYear <= 0) {
            errorMsg = "Year must be greater than 0";
          } else if (establishmentYear > currentYear) {
            errorMsg = "Year cannot be in the future";
          }
        }

        setFormData({
          ...formData,
          [name]: value,
          calculatedExperience: "",
          yearError: errorMsg
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e, index = null) => {
    const { name, files } = e.target;

    if (name.startsWith('bannerImage')) {
      const newBannerImages = [...formData.bannerImages];
      newBannerImages[index] = files[0];
      setFormData({ ...formData, bannerImages: newBannerImages });
    } else {
      setFormData({ ...formData, [name]: files[0] });
    }
  };

  // Handler for testimonial text inputs
  const handleTestimonialChange = (index, field, value) => {
    setFormData({
      ...formData,
      [`testimonial_${index}_${field}`]: value
    });
  };

  // Handle offer tags
  const handleOfferInputChange = (e) => {
    setOfferInput(e.target.value);
  };

  const handleOfferKeyDown = (e) => {
    if (e.key === 'Enter' && offerInput.trim()) {
      e.preventDefault();
      const newTags = [...offerTags, offerInput.trim()];
      setOfferTags(newTags);
      setFormData({ ...formData, discountsOfferTimeline: newTags.join(',') });
      setOfferInput('');
    }
  };

  const removeOfferTag = (indexToRemove) => {
    const newTags = offerTags.filter((_, index) => index !== indexToRemove);
    setOfferTags(newTags);
    setFormData({ ...formData, discountsOfferTimeline: newTags.join(',') });
  };

  // Handle award tags
  const handleAwardInputChange = (e) => {
    setAwardInput(e.target.value);
  };

  const handleAwardKeyDown = (e) => {
    if (e.key === 'Enter' && awardInput.trim()) {
      e.preventDefault();
      const newTags = [...awardTags, awardInput.trim()];
      setAwardTags(newTags);
      setFormData({ ...formData, anyAwardWon: newTags.join(',') });
      setAwardInput('');
    }
  };

  const removeAwardTag = (indexToRemove) => {
    const newTags = awardTags.filter((_, index) => index !== indexToRemove);
    setAwardTags(newTags);
    setFormData({ ...formData, anyAwardWon: newTags.join(',') });
  };

  // Function to save form data as draft to localStorage
  const saveDraft = useCallback(() => {
    try {
      const currentTime = new Date();
      
      // Create a draft object with all form data except file objects
      const draftData = {
        ...formData,
        // Remove file objects as they can't be stored in localStorage
        logo: null,
        digitalBrochure: null,
        testimonialsAttachment: null,
        // Keep the banner images that have URLs (strings)
        bannerImages: formData.bannerImages.filter(item => typeof item === 'string'),
        googleReviewCount: formData.googleReviewCount, // Make sure it's included
      };

      // Save testimonials data (without image files)
      const draftTestimonials = testimonials.map(testimonial => ({
        ...testimonial,
        image: null // Remove image file
      }));

      // Create the complete draft object
      const draft = {
        formData: draftData,
        testimonials: draftTestimonials,
        offerTags,
        awardTags,
        uspTags,
        timestamp: currentTime.toISOString(),
      };

      // For debugging
      console.log("Saving draft with banner images:", draftData.bannerImages);

      // Save to localStorage
      localStorage.setItem('adminDashboardDraft', JSON.stringify(draft));

      // Update last saved time
      setLastSavedTime(currentTime);

      // Show success message only for manual saves
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  }, [formData, testimonials, offerTags, awardTags, uspTags, formData.googleReviewCount]);

  // Manual save with feedback
  const handleManualSave = () => {
    const saved = saveDraft();
    if (saved) {
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000); // Hide message after 3 seconds
    } else {
      setError('Failed to save draft. Please try again.');
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled) return;

    // Set up auto-save timer (every 30 seconds)
    const autoSaveTimer = setInterval(() => {
      saveDraft();
    }, 30000); // 30 seconds

    // Clean up timer on unmount
    return () => clearInterval(autoSaveTimer);
  }, [autoSaveEnabled, saveDraft]);

  // Function to load draft data from localStorage
  const loadDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem('adminDashboardDraft');

      if (savedDraft) {
        const draft = JSON.parse(savedDraft);

        // Ensure bannerImages is always an array
        let formDataWithFixedImages = { ...draft.formData };
        
        // If bannerImages is null or not an array, reset it to empty array
        if (!formDataWithFixedImages.bannerImages || !Array.isArray(formDataWithFixedImages.bannerImages)) {
          formDataWithFixedImages.bannerImages = [];
        }
        
        // Filter out any null or undefined values in bannerImages
        formDataWithFixedImages.bannerImages = formDataWithFixedImages.bannerImages.filter(url => url);
        
        console.log("Loading draft with banner images:", formDataWithFixedImages.bannerImages);

        // Restore form data with fixed banner images
        setFormData(prevData => ({
          ...prevData,
          ...formDataWithFixedImages
        }));

        // Restore testimonials (without images)
        if (draft.testimonials && draft.testimonials.length > 0) {
          setTestimonials(draft.testimonials);
        }

        // Restore tags
        if (draft.offerTags) setOfferTags(draft.offerTags);
        if (draft.awardTags) setAwardTags(draft.awardTags);
        if (draft.uspTags) setUspTags(draft.uspTags);

        // Set last saved time
        if (draft.timestamp) {
          setLastSavedTime(new Date(draft.timestamp));
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading draft:', error);
      return false;
    }
  }, []);

  // Load draft data when component mounts
  useEffect(() => {
    const hasDraft = loadDraft();
    if (hasDraft) {
      setSuccess('Draft loaded successfully. Please reupload any files.');
      setTimeout(() => setSuccess(false), 5000);
    }
  }, [loadDraft]);

  // Function to clear draft data
  const clearDraft = () => {
    try {
      localStorage.removeItem('adminDashboardDraft');
      setSuccess('Draft cleared successfully');
      setTimeout(() => setSuccess(false), 3000);

      // Reset last saved time
      setLastSavedTime(null);

      // Reset form to initial state
      setFormData({
        name: "",
        projects: "",
        experience: "",
        calculatedExperience: "",
        yearError: "",
        branches: "",
        logo: null,
        registeredCompanyName: "",
        nameDisplay: "",
        description: "",
        availableCities: [],
        officialWebsite: "",
        fullName: "",
        designation: "",
        phoneNumber: "",
        minMaxBudget: "",
        type: [],
        bannerImages: [], // Initialize as empty array, not Array(10).fill(null)
        discountsOfferTimeline: "",
        numberOfProjectsCompleted: "",
        digitalBrochure: null,
        usp: "",
        contactEmail: "",
        googleRating: "",
        googleReviews: "",
        googleReviewCount: "", // Add this to the reset
        anyAwardWon: "",
        categoryType: "",
        paymentType: [],
        assured: "",
        latitude: "",
        longitude: "",
        // workInTeams: "",
        deliveryTimeline: "",
        basicPriceRange: "",
        premiumPriceRange: "",
        luxuryPriceRange: "",
        serviceCategories: [],
      });

      // Reset other state
      setTestimonials([]);
      setOfferTags([]);
      setAwardTags([]);
      setUspTags([]);
      setOfferInput("");
      setAwardInput("");
      setUspInput("");

    } catch (error) {
      console.error('Error clearing draft:', error);
      setError('Failed to clear draft. Please try again.');
    }
  };

  const validateForm = () => {
    const requiredFields = {
      name: 'Company Name',
      projects: 'Number of Projects',
      experience: 'Year of establishment',
      branches: 'Number of Branches',
      logo: 'Company Logo',
      description: 'Description',
      availableCities: 'Available Cities',
      latitude: 'Location (Latitude)',
      longitude: 'Location (Longitude)',
      basicPriceRange: 'Basic Price Range',
      premiumPriceRange: 'Premium Price Range',
      luxuryPriceRange: 'Luxury Price Range',
      deliveryTimeline: 'Delivery Timeline',
      projectType: 'Project Type',
      propertySizeRange: 'Property Size Range',
      priceRange: 'Price Range',
      type: 'Type' // Add type to required fields
    };

    const missingFields = [];

    Object.entries(requiredFields).forEach(([field, label]) => {
      const value = formData[field];
      const isEmpty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && !(value instanceof File) && Object.keys(value).length === 0);

      if (isEmpty) {
        missingFields.push(label);
      }
    });

    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Initialize FormData object
      const data = new FormData();

      // Add full validation
      if (!validateForm()) {
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }

      // Ensure all enum fields have valid values
      if (!formData.deliveryTimeline) {
        setError('Delivery Timeline is required');
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }

      if (!formData.projectType) {
        setError('Project Type is required');
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }

      if (!formData.propertySizeRange) {
        setError('Property Size Range is required');
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }

      if (!formData.priceRange) {
        setError('Price Range is required');
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }

      // Add all form fields to FormData - be careful with array fields
      Object.keys(formData).forEach(key => {
        // Skip deliveryTimeline in this loop - we'll handle it separately
        if (key === 'deliveryTimeline') {
          return; // Skip this iteration
        }
        
        if (key === 'type') {
          // Handle the type array properly
          if (Array.isArray(formData[key]) && formData[key].length > 0) {
            // Join array values into a comma-separated string
            data.append('type', formData[key].join(','));
          } else if (formData[key]) {
            // If it's a single value, append as is
            data.append('type', formData[key]);
          }
        } else if (key === 'bannerImages') {
          if (Array.isArray(formData.bannerImages) && formData.bannerImages.length > 0) {
            // Filter out any null/undefined values
            const validBannerImages = formData.bannerImages.filter(url => url);
            
            // Don't use JSON.stringify - send as a simple array for FormData
            validBannerImages.forEach((url, index) => {
              data.append('bannerImages', url); // Send as multiple fields with the same name
            });
            
            // Also add a count field so backend knows how many to expect
            data.append('bannerImagesCount', validBannerImages.length);
            
            console.log('Sending banner images:', validBannerImages);
          }
        } else if (Array.isArray(formData[key])) {
          // For other array fields
          formData[key].forEach(item => {
            data.append(`${key}[]`, item);
          });
        } else if (formData[key] instanceof File) {
          // Handle file fields
          data.append(key, formData[key]);
        } else if (formData[key] !== null && formData[key] !== undefined) {
          // Handle all other fields
          data.append(key, formData[key]);
        }
      });

      // Add testimonials
      if (testimonials.length > 0) {
        data.append('testimonials', JSON.stringify(testimonials));
      }

      // In your form submission, add this before sending to the backend
      if (formData.deliveryTimeline) {
        // Extract just the number from strings like "2 months"
        const timelineValue = formData.deliveryTimeline;
        // Handle if it's an array (which seems to be happening)
        if (Array.isArray(timelineValue)) {
          // Just use the first value to avoid duplicates
          const firstValue = timelineValue[0];
          // Extract the number part from "X months"
          const numericValue = parseInt(firstValue.split(' ')[0]);
          data.append('deliveryTimeline', numericValue);
        } else {
          // Extract the number from a string like "2 months"
          const numericValue = parseInt(timelineValue.split(' ')[0]);
          data.append('deliveryTimeline', numericValue);
        }
      } else {
        data.append('deliveryTimeline', '');
      }

      // Add this before submitting the form - right after validateForm() check
      // This helps confirm the form data has all required values
      console.log("Form data to be submitted:", {
        // Key fields to check
        logo: formData.logo ? "File present" : "No logo file",
        name: formData.name,
        deliveryTimeline: formData.deliveryTimeline,
        projectType: formData.projectType,
        propertySizeRange: formData.propertySizeRange,
        priceRange: formData.priceRange,
        type: formData.type,
        bannerImages: formData.bannerImages.length > 0 ? `${formData.bannerImages.length} images` : "No images",
      });

      const token = localStorage.getItem("adminToken");
      const response = await axios.post(`${API_URL}/companies`, data, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
      });

      // Add this to check the exact response from the server
      console.log('Server response:', response.data);

      // If the company was created but the UI still shows "failed to create company"
      // it means we have a logic issue in success handling
      const company = response.data.company || response.data;
      console.log('Company details returned from server:', company);

      if (!company || !company._id) {
        throw new Error('Server returned success but no company details were received');
      }

      // Clear localStorage after successful submission
      localStorage.removeItem('companyFormData');
      localStorage.removeItem('adminDashboardDraft');

      toast.success('Company registered successfully!');

      // Get the company ID
      const companyId = company._id;
      
      console.log('Company created successfully!', response.data);

      setTimeout(() => {
        navigate(`/CompanyProfile/${companyId}`);
      }, 1500);

    } catch (error) {
      console.error("Error creating company:", error);
      
      // More detailed error reporting
      let errorMessage = "Failed to create company";
      
      if (error.response) {
        // The server responded with an error status
        errorMessage = error.response.data?.message || errorMessage;
        console.error("Server response error:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      }
      
      setError(errorMessage);
      window.scrollTo(0, 0);
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add a new empty testimonial
  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      {
        name: "",
        position: "",
        quote: "",
        image: null,
        order: testimonials.length
      }
    ]);
  };

  // Remove testimonial at specified index
  const removeTestimonial = (indexToRemove) => {
    const newTestimonials = testimonials
      .filter((_, index) => index !== indexToRemove)
      .map((testimonial, index) => ({
        ...testimonial,
        order: index
      }));
    setTestimonials(newTestimonials);
  };

  // Update testimonial data
  const updateTestimonial = (index, field, value) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = {
      ...newTestimonials[index],
      [field]: value
    };
    setTestimonials(newTestimonials);
  };

  // Handle testimonial image changes for new approach
  const handleDynamicImageChange = async (index, file) => {
    if (!file) return;

    try {
      const base64Image = await fileToBase64(file);
      updateTestimonial(index, "image", base64Image);
    } catch (error) {
      console.error("Error converting image to Base64:", error);
    }
  };

  // Function to toggle auto-save
  const toggleAutoSave = () => {
    setAutoSaveEnabled(prev => !prev);
  };

  // Handle USP tags
  const handleUspInputChange = (e) => {
    setUspInput(e.target.value);
  };

  const handleUspKeyDown = (e) => {
    if (e.key === 'Enter' && uspInput.trim()) {
      e.preventDefault();
      const newTags = [...uspTags, uspInput.trim()];
      setUspTags(newTags);
      setFormData({ ...formData, usp: newTags.join(',') });
      setUspInput('');
    }
  };

  const removeUspTag = (indexToRemove) => {
    const newTags = uspTags.filter((_, index) => index !== indexToRemove);
    setUspTags(newTags);
    setFormData({ ...formData, usp: newTags.join(',') });
  };

  // Add this function near your other handlers
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Add file size validation
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileCategory', 'company-banners');

        const response = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        return response.data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setFormData(prev => {
        const updatedData = {
          ...prev,
          bannerImages: [...prev.bannerImages, ...uploadedUrls].slice(0, 10)
        };

        // Save to localStorage
        localStorage.setItem('companyFormData', JSON.stringify(updatedData));
        return updatedData;
      });

      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        bannerImages: prev.bannerImages.filter((_, index) => index !== indexToRemove)
      };
      // Save to localStorage immediately after removal
      localStorage.setItem('companyFormData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  // Add this function to clear form data
  const clearForm = () => {
    localStorage.removeItem('companyFormData');
    setFormData({
      // ... your initial state ...
      bannerImages: [],
    });
  };

  // Add a warning when user tries to leave the page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (formData.bannerImages.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData.bannerImages]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Company Registration Dashboard</h1>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <div>
              <span className="font-bold">Success!</span> Company data submitted successfully.
            </div>
            <button onClick={() => setSuccess(false)} className="text-green-700">
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {draftSaved && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Draft saved successfully! You can continue later.
          </div>
        )}

        {/* Draft Management */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            {lastSavedTime && (
              <p className="text-sm text-gray-600">
                Last saved: {lastSavedTime.toLocaleString()}
              </p>
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSave"
                checked={autoSaveEnabled}
                onChange={toggleAutoSave}
                className="mr-2"
              />
              <label htmlFor="autoSave" className="text-sm text-gray-600">Auto-save (every 30s)</label>
            </div>
          </div>
          <button
            type="button"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm"
            onClick={clearDraft}
          >
            Clear Draft
          </button>
        </div>

        {/* Add Company Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Company</h2>
          <div className="text-sm text-gray-600 mb-4">Fields marked with <span className="text-red-500">*</span> are required</div>
          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.preventDefault()}
            className="space-y-6"
          >
            {/* Hidden inputs for latitude and longitude */}
            <input type="hidden" name="latitude" value={formData.latitude} />
            <input type="hidden" name="longitude" value={formData.longitude} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Original fields */}
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Company Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="Company Name"
                  className="w-full p-2 border rounded"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Number of Projects <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="projects"
                  placeholder="Number of Projects"
                  className="w-full p-2 border rounded"
                  value={formData.projects}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Year of establishment <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="experience"
                  placeholder="Year of establishment"
                  className={`w-full p-2 border rounded ${formData.yearError ? 'border-red-500' : ''}`}
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  required
                />
                {formData.yearError ? (
                  <p className="text-sm text-red-600 mt-1">
                    {formData.yearError}
                  </p>
                ) : formData.calculatedExperience ? (
                  <p className="text-sm text-green-600 mt-1">
                    Years of Experience: {formData.calculatedExperience} years
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the year when the company was established. Years of experience will be calculated automatically.
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Number of Branches <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="branches"
                  placeholder="Number of Branches"
                  className="w-full p-2 border rounded"
                  value={formData.branches}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Company Logo <span className="text-red-500">*</span></label>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  className="w-full p-2 border rounded"
                  onChange={(e) => handleFileChange(e)}
                  required
                />
                <p className="text-xs text-red-500">Image Size Should Be 200x200 PX</p>
              </div>

              {/* New fields from screenshots */}
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Registered Company Name</label>
                <input
                  type="text"
                  name="registeredCompanyName"
                  placeholder="Registered Company Name"
                  className="w-full p-2 border rounded"
                  value={formData.registeredCompanyName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Name Display <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="nameDisplay"
                  placeholder="Display Name"
                  className="w-full p-2 border rounded"
                  value={formData.nameDisplay}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-span-3">
                <label className="block text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  placeholder="Description"
                  className="w-full p-2 border rounded"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              {/* <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Age of Company</label>
                <select
                  name="ageOfCompany"
                  className="w-full p-2 border rounded"
                  value={formData.ageOfCompany}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>Select Age of Company</option>
                  {ageOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div> */}
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">
                  Available Cities/Locations <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search and select cities (required)"
                    className="w-full p-2 border rounded mb-2"
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      const cityDropdown = document.getElementById('cityDropdown');

                      // Show/hide dropdown based on search
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
                          // Add city to selected cities if not already there
                          if (!formData.availableCities.includes(city)) {
                            setFormData({
                              ...formData,
                              availableCities: [...formData.availableCities, city]
                            });
                          }
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
                        onClick={() => {
                          setFormData({
                            ...formData,
                            availableCities: formData.availableCities.filter((_, i) => i !== index)
                          });
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Link to Official Website</label>
                <input
                  type="url"
                  name="officialWebsite"
                  placeholder="https://example.com"
                  className="w-full p-2 border rounded"
                  value={formData.officialWebsite}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  className="w-full p-2 border rounded"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Designation</label>
                <input
                  type="text"
                  name="designation"
                  placeholder="Designation"
                  className="w-full p-2 border rounded"
                  value={formData.designation}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  className="w-full p-2 border rounded"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Min-Max Budget</label>
                <select
                  name="minMaxBudget"
                  className="w-full p-2 border rounded"
                  value={formData.minMaxBudget}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>Select Min-Max Budget</option>
                  {budgetOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Type <span className="text-red-500">*</span></label>
                <div className="w-full p-2 border rounded bg-white">
                  {typeOptions.map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`type-${index}`}
                        value={option}
                        checked={formData.type.includes(option)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData(prevData => ({
                            ...prevData,
                            type: isChecked
                              ? [...prevData.type, option]
                              : prevData.type.filter(t => t !== option)
                          }));
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`type-${index}`} className="text-sm">{option}</label>
                    </div>
                  ))}
                </div>
                {formData.type.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Please select at least one type</p>
                )}
              </div>
              {/* <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Work in Teams</label>
                <select
                  name="workInTeams"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.workInTeams}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>Select Work In Teams</option>
                  {teamOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div> */}
            </div>
            {/* Update the form fields to make them required */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="col-span-3">
                <h3 className="text-lg font-medium mb-2">Price Range Categories</h3>
              </div>

              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Basic Price Range <span className="text-red-500">*</span></label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">₹</span>
                  <input
                    type="text"
                    name="basicPriceRange"
                    placeholder="1000-5000"
                    className="w-full p-2 border rounded"
                    value={formData.basicPriceRange}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Format: min-max (e.g., 1000-5000)</p>
              </div>

              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Premium Price Range <span className="text-red-500">*</span></label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">₹</span>
                  <input
                    type="text"
                    name="premiumPriceRange"
                    placeholder="5000-10000"
                    className="w-full p-2 border rounded"
                    value={formData.premiumPriceRange}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Format: min-max (e.g., 5000-10000)</p>
              </div>

              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Luxury Price Range <span className="text-red-500">*</span></label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">₹</span>
                  <input
                    type="text"
                    name="luxuryPriceRange"
                    placeholder="10000-20000"
                    className="w-full p-2 border rounded"
                    value={formData.luxuryPriceRange}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Format: min-max (e.g., 10000-20000)</p>
              </div>
            </div>
            {/* Banner Images Section */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Banner Images</h3>

              {/* Upload Area */}
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
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="banner-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#006452] hover:text-[#004d3b] focus-within:outline-none"
                    >
                      <span>Upload files</span>
                      <input
                        id="banner-upload"
                        name="banner-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileUpload}
                        disabled={uploadingImages}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  <p className="text-xs text-red-500">Image Size Should Be 1350x400 PX</p>

                  {/* Upload Progress */}
                  {uploadingImages && (
                    <div className="mt-2">
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-[#006452] animate-pulse mr-2"></div>
                        <span className="text-sm text-[#006452]">Uploading images...</span>
                      </div>
                    </div>
                  )}

                  {/* Image Count - Only show when there are images */}
                  {formData.bannerImages.length > 0 && (
                    <div className="mt-2">
                      <span className={`text-sm ${formData.bannerImages.length >= 5 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                        {formData.bannerImages.length} of 5 required images uploaded
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Only show uploaded images grid when there are images */}
              {formData.bannerImages.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {formData.bannerImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Banner ${index + 1}`}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Company Location */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Company Location</h3>
              <p className="text-sm text-gray-600 mb-2">Search for a location or click on the map to select the company's location.</p>

              {/* Search Box */}
              <SearchBox onPlaceSelected={handlePlaceSelected} />

              <div style={{ position: 'relative', height: '400px', width: '100%' }}>
                {/* Leaflet Map */}
                <div
                  ref={mapContainerRef}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded"
                ></div>

                {mapLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="mt-2 text-blue-600">Loading map...</p>
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

              {/* Latitude and Longitude Display */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="col-span-1">
                  <label className="block text-gray-700 mb-2">Latitude <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      name="latitude"
                      placeholder="Latitude"
                      className="w-full p-2 border rounded bg-gray-50"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Set by clicking on the map or searching for a location</p>
                </div>
                <div className="col-span-1">
                  <label className="block text-gray-700 mb-2">Longitude <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      name="longitude"
                      placeholder="Longitude"
                      className="w-full p-2 border rounded bg-gray-50"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Set by clicking on the map or searching for a location</p>
                </div>
              </div>
            </div>

            {/* Google Rating Dropdown */}
            <div className="col-span-1">
              <label className="block text-gray-700 mb-2">Google Rating</label>
              <div className="relative">
                <input
                  type="number"
                  name="googleRating"
                  placeholder="Enter rating (0.0 - 5.0)"
                  className="w-full p-2 border rounded"
                  value={formData.googleRating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-yellow-500">★</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter a value between 0.0 and 5.0</p>
            </div>

            {/* Add this near other similar input fields, probably around the Google Rating field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Review Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="googleReviewCount"
                value={formData.googleReviewCount}
                onChange={(e) => setFormData({ ...formData, googleReviewCount: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter number of Google reviews"
                min="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter the total number of Google reviews</p>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Discounts/Offer/Timeline</label>
                <div className="w-full p-2 border rounded bg-white min-h-[100px]">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {offerTags.map((tag, index) => (
                      <div key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeOfferTag(index)}
                          className="ml-2 text-orange-600 hover:text-orange-800"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={offerInput}
                    onChange={handleOfferInputChange}
                    onKeyDown={handleOfferKeyDown}
                    placeholder="Type offer and press Enter"
                    className="w-full p-1 border-b border-gray-300 focus:outline-none focus:border-[#006452]"
                  />
                  <input
                    type="hidden"
                    name="discountsOfferTimeline"
                    value={formData.discountsOfferTimeline}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Press Enter to add each offer</p>
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">No. of Awards Won</label>
                <textarea
                  name="numberOfProjectsCompleted"
                  placeholder="No. of Awards Won"
                  className="w-full p-2 border rounded"
                  value={formData.numberOfProjectsCompleted}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Digital Brochure (PDF only)</label>
                <input
                  type="file"
                  name="digitalBrochure"
                  accept=".pdf"
                  className="w-full p-2 border rounded"
                  onChange={(e) => handleFileChange(e)}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">USP (Unique Selling Points)</label>
                <div className="w-full p-2 border rounded bg-white min-h-[100px]">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {uspTags.map((tag, index) => (
                      <div key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeUspTag(index)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={uspInput}
                    onChange={handleUspInputChange}
                    onKeyDown={handleUspKeyDown}
                    placeholder="Type USP and press Enter"
                    className="w-full p-1 border-b border-gray-300 focus:outline-none focus:border-[#006452]"
                  />
                  <input
                    type="hidden"
                    name="usp"
                    value={formData.usp}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Press Enter to add each USP</p>
              </div>
              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Contact Email Address</label>
                <input
                  type="email"
                  name="contactEmail"
                  placeholder="Contact Email Address"
                  className="w-full p-2 border rounded"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Search Keywords</label>
                <input
                  type="text"
                  name="searchKeywords"
                  placeholder="keywords, separated, by, commas"
                  className="w-full p-2 border rounded"
                  value={formData.searchKeywords}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500">Comma-separated keywords to improve search</p>
              </div>

              <div className="col-span-1">
                <label className="block text-gray-700 mb-2">Specific Neighborhoods</label>
                <input
                  type="text"
                  name="specificNeighborhoods"
                  placeholder="koramangala, indiranagar, etc."
                  className="w-full p-2 border rounded"
                  value={formData.specificNeighborhoods}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500">Comma-separated list of neighborhoods served</p>
              </div>
            </div>
            {/* Add these form fields in an appropriate section of your form */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Timeline */}
                <div className="col-span-1">
                  <label className="block text-gray-700 mb-2">
                    Delivery Timeline <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="deliveryTimeline"
                    className="w-full p-2 border rounded"
                    value={formData.deliveryTimeline}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Delivery Timeline</option>
                    {deliveryTimelineOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {!formData.deliveryTimeline && (
                    <p className="text-xs text-red-500 mt-1">Delivery Timeline is required</p>
                  )}
                </div>

                {/* Project Type */}
                <div className="col-span-1">
                  <label className="block text-gray-700 mb-2">
                    Project Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="projectType"
                    className="w-full p-2 border rounded"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Project Type</option>
                    {projectTypeOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {!formData.projectType && (
                    <p className="text-xs text-red-500 mt-1">Project Type is required</p>
                  )}
                </div>

                {/* Property Size Range */}
                <div className="col-span-1">
                  <label className="block text-gray-700 mb-2">
                    Property Size Range <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="propertySizeRange"
                    className="w-full p-2 border rounded"
                    value={formData.propertySizeRange}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Property Size Range</option>
                    {propertySizeRangeOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {!formData.propertySizeRange && (
                    <p className="text-xs text-red-500 mt-1">Property Size Range is required</p>
                  )}
                </div>

                {/* Price Range */}
                <div className="col-span-1">
                  <label className="block text-gray-700 mb-2">
                    Price Range <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priceRange"
                    className="w-full p-2 border rounded"
                    value={formData.priceRange}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Price Range</option>
                    {priceRangeOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {!formData.priceRange && (
                    <p className="text-xs text-red-500 mt-1">Price Range is required</p>
                  )}
                </div>
              </div>
            </div>
            {/* NEW DYNAMIC TESTIMONIALS SECTION */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-semibold mb-4">Company Testimonials</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add testimonials from your clients to display on your company profile page.
              </p>

              {/* Testimonials add button */}
              <div className="mb-6 flex justify-between items-center">
                <h4 className="font-medium">Testimonials ({testimonials.length})</h4>
                <button
                  type="button"
                  onClick={addTestimonial}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add New Testimonial
                </button>
              </div>

              {/* Dynamic testimonials list */}
              {testimonials.map((testimonial, index) => (
                <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Testimonial #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeTestimonial(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Client Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full p-2 border rounded"
                        value={testimonial.name || ''}
                        onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Project Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Modern Villa Design"
                        className="w-full p-2 border rounded"
                        value={testimonial.position || ''}
                        onChange={(e) => updateTestimonial(index, 'position', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block text-gray-700 mb-1 text-sm">Testimonial Quote <span className="text-red-500">*</span></label>
                    <textarea
                      placeholder="Their service was excellent and exceeded our expectations..."
                      className="w-full p-2 border rounded"
                      rows="3"
                      value={testimonial.quote || ''}
                      onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">Client Photo <span className="text-red-500">*</span></label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full p-2 border rounded"
                      onChange={(e) => handleDynamicImageChange(index, e.target.files[0])}
                      required={!testimonial.image}
                    />
                    {testimonial.image && (
                      <div className="mt-2">
                        <img
                          src={testimonial.image}
                          alt="Testimonial preview"
                          className="h-16 w-16 object-cover rounded-full border border-gray-300"
                        />
                      </div>
                    )}
                    <p className="text-xs text-red-500">Image Size Should Be 100x100 PX (Square)</p>
                  </div>
                </div>
              ))}

              {testimonials.length > 0 && (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-md mb-4">
                  <p><strong>Note:</strong> All testimonial fields are required. Each testimonial must include a name, position, quote, and photo.</p>
                </div>
              )}
            </div>
            <div className="flex justify-center mt-6 space-x-4">
              <button
                type="button"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                onClick={handleManualSave}
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        {/* Form Instructions */}
        <div className="mt-4 p-4 bg-blue-100 text-blue-800 rounded-md mb-8">
          <h3 className="font-bold mb-2">Registration Instructions</h3>
          <p>Fill out all relevant details in the form above to register a company. Fields marked with * are required.</p>
          <p className="mt-2">For best results:</p>
          <ul className="list-disc ml-6 mt-1">
            <li>Upload company logo at 200x200px</li>
            <li>Banner images should be 1350x400px</li>
            <li>Brochure and testimonials must be in PDF format</li>
            <li>Client testimonial photos should be 100x100px (square)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;