// pages/InteriorDesigner/InteriorDesigner.jsx
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import axios from 'axios';
import review from "../../assets/googlereview.png";
import backgroundImage from "../../assets/background.png";
import logo1 from "../../assets/103_logo 1.png";
import logo2 from "../../assets/logo2.png";
import logo3 from "../../assets/143_logo 3.png";
import logo4 from "../../assets/141_logo 4.png";
import Header from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import TrueFocus from '../../components/FocusLink/Focuslink';
import Carousel from "../../components/TableCorousel/Tablecorousel";
import ProfileCard from '../../components/ProfileCard/Profilecard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import Designers from '../../components/Designers/Designers';
import DesignersWrapper from '../../components/DesignerWrapper/DesignerWrapper';
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import lock from "../../assets/lock.png";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import LocationPopup from '../../components/LocationPopup/LocationPopup';

// Fallback to sample data if API fails
const sampleProfiles = [
  {
    id: 1,
    name: "Rahul Sharma",
    rate: "₹ 250/hr",
    location: "Koramangala",
    reviewImage: review,
    experience: "8+",
    projectsCompleted: "180+",
    googleReviews: "120",
    rating: "4.5",
    portfolio: [
      "https://example.com/sample1.jpg",
      "https://example.com/sample2.jpg"
    ]
  },
  {
    id: 2,
    name: "Priya Singh",
    rate: "₹ 300/hr",
    location: "Indiranagar",
    reviewImage: review,
    experience: "10+",
    projectsCompleted: "300+",
    googleReviews: "240",
    rating: "5",
    portfolio: [
      "https://example.com/sample3.jpg",
      "https://example.com/sample4.jpg"
    ]
  },
];

// Categories & Thresholds (Rate in ₹/hr)
const categories = {
  "Basic": { min: 0, max: 250 },
  "Standard": { min: 250, max: 300 },
  "Premium": { min: 300, max: 350 },
  "Luxury": { min: 350, max: Infinity }
};

const customImages = [
  logo1,
  logo2,
  logo3,
  logo4,
];

const InteriorDesigner = () => {
  const [selectedCategory, setSelectedCategory] = useState("Basic");
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(localStorage.getItem('userLocation') || '');
  const [showLocationPopup, setShowLocationPopup] = useState(!localStorage.getItem('userLocation'));

  // Restrict category selection for non-logged in users
  const handleCategorySelect = (category) => {
    if (!isSignedIn && (category === "Standard" || category === "Premium" || category === "Luxury")) {
      // Show toast notification about premium content
      toast.info("Login required to access " + category + " category designers");
      // Still set the category to show the login box
      setSelectedCategory(category);
      return;
    }
    setSelectedCategory(category);
  };

  // Handle location selection
  const handleLocationSelect = (location, coordinates, address) => {
    console.log(`Selected location: ${location}, Coordinates:`, coordinates);
    if (location) {
      setUserLocation(location);
      localStorage.setItem('userLocation', location);
      localStorage.setItem('userFilterLocation', location); // Store separately for filtering

      // Store exact coordinates if available
      if (coordinates) {
        const liveLocationData = {
          latitude: coordinates.latitude || coordinates.lat,
          longitude: coordinates.longitude || coordinates.lng,
          address: address || location,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('userLiveLocation', JSON.stringify(liveLocationData));
      } else {
        // If no coordinates but we have a location name, try to get default coordinates for that city
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

        if (cityCoordinates[location]) {
          const liveLocationData = {
            latitude: cityCoordinates[location].lat,
            longitude: cityCoordinates[location].lng,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('userLiveLocation', JSON.stringify(liveLocationData));
        } else {
          // Use center of India as fallback
          const liveLocationData = {
            latitude: 20.5937,
            longitude: 78.9629,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('userLiveLocation', JSON.stringify(liveLocationData));
        }
      }

      // Fetch designers with the selected location
      fetchDesignersWithLocation(location);
    } else {
      // If no location is selected, clear the location data
      localStorage.removeItem('userLocation');
      localStorage.removeItem('userLiveLocation');
      localStorage.removeItem('userFilterLocation');

      // Show location popup
      setShowLocationPopup(true);
    }

    // Hide location popup if a location was selected
    if (location) {
      setShowLocationPopup(false);
    }
  };

  const fetchDesignersWithLocation = (locationValue) => {
    console.log(`Fetching designers with location: ${locationValue}`);
    fetchDesigners(locationValue);
  };

  const handleChangeLocation = () => {
    // Clear location data
    setUserLocation('');
    localStorage.removeItem('userLocation');
    localStorage.removeItem('userLiveLocation');

    // Show location popup
    setShowLocationPopup(true);
  };

  // Fetch designers from API
  const fetchDesigners = async (location = null) => {
    try {
      setLoading(true);
      
      let apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/designers`;
      
      // Add location parameter if provided
      if (location) {
        apiUrl += `?location=${encodeURIComponent(location)}`;
      }
      
      const response = await axios.get(apiUrl);

      // Ensure designers is always an array
      let designers = [];
      if (response.data && Array.isArray(response.data)) {
        designers = response.data;
      } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
        designers = response.data.data;
      } else {
        console.error('Unexpected API response format:', response.data);
        setError('Received unexpected data format from server');
        setDesigners([]);
        return;
      }

      // Validate portfolio images
      const validatedDesigners = designers.map(designer => ({
        ...designer,
        portfolio: (designer.portfolio || []).filter(image =>
          typeof image === 'string' &&
          (image.startsWith('http://') || image.startsWith('https://'))
        )
      }));

      // Log portfolio images for debugging
      validatedDesigners.forEach((designer, index) => {
        console.log(`Designer ${index + 1} Portfolio:`, {
          portfolioLength: designer.portfolio ? designer.portfolio.length : 0,
          portfolioImages: designer.portfolio
        });
      });

      setDesigners(validatedDesigners);
    } catch (err) {
      console.error('Error fetching designers:', err);
      setError('Failed to load designers. Using sample data instead.');
      setDesigners(sampleProfiles);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    // Check if we have live location data
    const userLiveLocationStr = localStorage.getItem('userLiveLocation');
    if (userLiveLocationStr) {
      console.log("Found live location data in localStorage");
      try {
        // Parse the live location to verify it's valid
        const userLiveLocation = JSON.parse(userLiveLocationStr);
        if (userLiveLocation.latitude && userLiveLocation.longitude) {
          console.log("Live location data is valid:", userLiveLocation);
          console.log(`User's exact coordinates: ${userLiveLocation.latitude}, ${userLiveLocation.longitude}`);
        } else {
          console.log("Live location data is invalid, removing it");
          localStorage.removeItem('userLiveLocation');
        }
      } catch (err) {
        console.error("Error parsing live location data:", err);
        localStorage.removeItem('userLiveLocation');
      }
    } else {
      console.log("No live location data found in localStorage");
    }

    // Get the filter location (might be different from userLocation)
    const filterLocation = localStorage.getItem('userFilterLocation') || userLocation;

    // Only fetch if we have a location, otherwise wait for location popup
    if (filterLocation) {
      fetchDesigners(filterLocation);
    } else {
      // Still need to set loading to false if no location yet
      setLoading(false);
    }
  }, []);

  // Filter Profiles based on selected focus category and login status
  const filteredDesigners = Array.isArray(designers) ? designers.filter(designer => {
    // For non-logged in users, only show Basic category
    if (!isSignedIn && (selectedCategory === "Standard" || selectedCategory === "Premium" || selectedCategory === "Luxury")) {
      return false;
    }

    // Extract numeric rate value
    let rate;
    if (designer && designer.rateNumeric !== undefined) {
      // Use pre-calculated numeric rate from API
      rate = designer.rateNumeric;
    } else if (designer && designer.rate) {
      // Extract from rate string
      const rateMatch = designer.rate.match(/\d+/);
      rate = rateMatch ? parseInt(rateMatch[0], 10) : 0;
    } else {
      // Default to 0 if no rate is found
      rate = 0;
    }

    const { min, max } = categories[selectedCategory];
    return rate >= min && rate < max;
  }) : [];

  return (
    <div className="bg-white">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} />
      
      {/* Header Section */}
      <div className="absolute top-0 left-0 w-full bg-transparent z-50">
        <Header />
      </div>

      {/* Location Popup - only show if showLocationPopup is true */}
      {showLocationPopup && (
        <LocationPopup onLocationSelect={handleLocationSelect} />
      )}

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[400px] bg-cover bg-center text-white flex items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(250,250,250,0.85)] to-[rgba(0,100,82,0.85)]"></div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="z-50 font-inter font-black text-4xl md:text-[64px] leading-[77.45px] tracking-normal text-white"
        >
          Interior Designers
        </motion.h2>
      </motion.section>

      {/* Location Display */}
      {userLocation && (
        <div className="flex justify-center items-center mt-4 px-4">
          <div className="bg-gray-100 py-2 px-4 rounded-full flex items-center text-sm">
            <FontAwesomeIcon icon={faLocationDot} className="text-[#006452] mr-2" />
            <span className="mr-2">Location: <strong>{userLocation}</strong></span>
            <button 
              onClick={handleChangeLocation}
              className="text-[#006452] hover:text-[#004d3d] font-medium ml-2"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Focus Links */}
      <div className="m-12 px-4">
        <TrueFocus 
          sentence="Basic Standard Premium Luxury" 
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* Non-logged in message for Standard/Premium/Luxury */}
      {!isSignedIn && (selectedCategory === "Standard" || selectedCategory === "Premium" || selectedCategory === "Luxury") && (
        <div className="mt-12 mb-8 bg-gradient-to-r from-[#006452] to-[#00836b] rounded-lg shadow-xl p-4 sm:p-8 text-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="bg-white p-3 sm:p-4 rounded-full mb-4">
              <img src={lock} alt="Lock" className="w-8 sm:w-10 h-8 sm:h-10" />
            </div>
            <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">
              Premium Content
            </h3>
            <p className="text-white/90 mb-4 sm:mb-6 max-w-lg text-sm sm:text-base">
              {selectedCategory} category designers are only available to logged in users. Create a free account to unlock all designers in this category.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="bg-white text-[#006452] hover:bg-gray-100 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold shadow-lg transition-all text-sm sm:text-base"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-white/20 hover:bg-white/30 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold shadow-lg transition-all text-sm sm:text-base"
              >
                Sign Up
              </button>
              <button 
                onClick={() => setSelectedCategory("Basic")}
                className="bg-white/20 hover:bg-white/30 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold shadow-lg transition-all text-sm sm:text-base"
              >
                View Basic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006452]"></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto max-w-4xl my-4">
          <p>{error}</p>
        </div>
      )}

      {/* No Results Message */}
      {!loading && filteredDesigners.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-3">No designers found in the {selectedCategory} category.</p>
        </div>
      )}

      {/* Carousel & Filtered Designer Cards */}
      <div className="flex flex-col space-y-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto mb-16">
        {!loading && filteredDesigners.length > 0 && (isSignedIn ? filteredDesigners : filteredDesigners.slice(0, 3)).map(designer => (
          <div
            key={designer._id || designer.id}
            className="w-full flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden"
            style={{ height: 'auto', minHeight: { md: '380px' } }}
          >
            <div className='w-full md:w-1/2 h-[300px] md:h-[380px]'>
              {/* Improved Portfolio Image Handling */}
              {designer.portfolio && Array.isArray(designer.portfolio) && designer.portfolio.length > 0 ? (
                <div className="h-full">
                  <Carousel customImages={designer.portfolio} />
                </div>
              ) : (
                // Default carousel if no portfolio images
                <div className="h-full">
                  <Carousel />
                </div>
              )}
            </div>
            <div className='w-full md:w-1/2 h-auto md:h-[380px]'>
              <ProfileCard
                id={designer._id || designer.id}
                name={designer.name}
                rate={designer.rate}
                location={<><FontAwesomeIcon icon={faLocationDot} /> {designer.location}</>}
                availableCities={designer.availableCities}
                reviewImage={designer.reviewImage || review}
                experience={designer.experience}
                projectsCompleted={designer.projectsCompleted}
                description={designer.description}
                email={designer.email}
                phoneNumber={designer.phoneNumber}
                googleReviews={designer.googleReviews || "0"}
                rating={designer.rating || "5"}
                contactType="designer"
              />
            </div>
          </div>
        ))}
        
        {/* Login card for non-logged-in users if more designers exist */}
        {!isSignedIn && filteredDesigners.length > 3 && (
          <div className="mt-12 mb-8 bg-gradient-to-r from-[#006452] to-[#00836b] rounded-lg shadow-xl p-4 sm:p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-white p-3 sm:p-4 rounded-full mb-4">
                <img src={lock} alt="Lock" className="w-8 sm:w-10 h-8 sm:h-10" />
              </div>
              <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">
                {filteredDesigners.length - 3 >= 10 ? "10+" : filteredDesigners.length - 3} More Designers Available
              </h3>
              <p className="text-white/90 mb-4 sm:mb-6 max-w-lg text-sm sm:text-base">
                Create a free account to unlock all designers matching your search criteria and access advanced features.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-white text-[#006452] hover:bg-gray-100 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold shadow-lg transition-all text-sm sm:text-base"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold shadow-lg transition-all text-sm sm:text-base"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logo Grid Section */}
      {/* <div className="mt-12">
        <CardCrousel images={customImages} showOnlyImages={true} largeImage={true} />
      </div> */}
      
      {/* Explore Companies Section */}
      <div className="mt-12 mb-6 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
          Explore Companies
        </h2>
        <div className="w-24 h-1 bg-[#006452] mx-auto mt-4"></div>
      </div>
      <DesignersWrapper hideHeadings={true} />

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

export default InteriorDesigner;