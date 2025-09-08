// pages/Craftsmen/Craftsmen.jsx
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import axios from 'axios';
import backgroundImage from "../../assets/background.png";
import logo1 from "../../assets/103_logo 1.png";
import logo2 from "../../assets/logo2.png";
import logo3 from "../../assets/143_logo 3.png";
import logo4 from "../../assets/141_logo 4.png";
import Header from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import TrueFocus from '../../components/FocusLink/Focuslink';
import Carousel from "../../components/TableCorousel/Tablecorousel";
import CraftsmanProfileCard from '../../components/ProfileCard/CraftsmanProfileCard';
import DesignersWrapper from '../../components/DesignerWrapper/DesignerWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import lock from "../../assets/lock.png";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import LocationPopup from '../../components/LocationPopup/LocationPopup';
import { storeUserFilter } from "../../services/filterStorageService";

// Fallback to sample data if API fails
const sampleProfiles = [
  { id: 1, name: "Ajay Kumar", rate: "₹ 200/hr", location: "Koramangala", experience: "6+", projectsCompleted: "120+", googleReviews: "98", rating: "4.5" },
  { id: 2, name: "Ramesh Patel", rate: "₹ 250/hr", location: "Indiranagar", experience: "8+", projectsCompleted: "150+", googleReviews: "120", rating: "4.8" },
  { id: 3, name: "Suresh Singh", rate: "₹ 300/hr", location: "HSR Layout", experience: "10+", projectsCompleted: "200+", googleReviews: "180", rating: "5" },
  { id: 4, name: "Rahul Joshi", rate: "₹ 350/hr", location: "Whitefield", experience: "7+", projectsCompleted: "130+", googleReviews: "85", rating: "4.2" },
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

const Craftsmen = () => {
  const [selectedCategory, setSelectedCategory] = useState("Basic");
  const [craftsmen, setCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(localStorage.getItem('userLocation') || '');
  const [showLocationPopup, setShowLocationPopup] = useState(!localStorage.getItem('userLocation'));

  // Restrict category selection for non-logged in users
  const handleCategorySelect = async (category) => {
    if (!isSignedIn && (category === "Standard" || category === "Premium" || category === "Luxury")) {
      // Show toast notification about premium content
      toast.info("Login required to access " + category + " category craftsmen");
      // Still set the category to show the login box
      setSelectedCategory(category);
      return;
    }
    
    // Store filter data for analytics
    try {
      await storeUserFilter({
        userId: user?.id || 'anonymous',
        userEmail: user?.emailAddresses?.[0]?.emailAddress || '',
        searchTerm: category,
        filters: {
          location: userLocation || '',
          type: 'craftsman',
          category: category,
          assuredOnly: false
        },
        pageType: 'craftsman'
      });
    } catch (error) {
      console.error('Error storing filter data:', error);
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
      
      // Fetch craftsmen with the selected location
      fetchCraftsmenWithLocation(location);
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

  const fetchCraftsmenWithLocation = (locationValue) => {
    console.log(`Fetching craftsmen with location: ${locationValue}`);
    fetchCraftsmen(locationValue);
  };

  const handleChangeLocation = () => {
    // Clear location data
    setUserLocation('');
    localStorage.removeItem('userLocation');
    localStorage.removeItem('userLiveLocation');

    // Show location popup
    setShowLocationPopup(true);
  };

  // Fetch craftsmen from API
  const fetchCraftsmen = async (location = null) => {
    try {
      setLoading(true);
      
      let apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/craftsmen`;
      
      // Add location parameter if provided
      if (location) {
        apiUrl += `?location=${encodeURIComponent(location)}`;
      }
      
      const response = await axios.get(apiUrl);

      // Ensure craftsmen is always an array
      if (response.data && Array.isArray(response.data)) {
        console.log('Craftsman data is an array:', response.data);
        setCraftsmen(response.data);
      } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
        // If response has a nested data property that's an array
        console.log('Craftsman data is in a nested property:', response.data.data);
        setCraftsmen(response.data.data);
      } else {
        // Default to empty array if data format is unexpected
        console.error('Unexpected API response format:', response.data);
        setCraftsmen([]);
        setError('Received unexpected data format from server');
      }
    } catch (err) {
      console.error('Error fetching craftsmen:', err);
      setError('Failed to load craftsmen. Using sample data instead.');
      setCraftsmen(sampleProfiles);
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
      fetchCraftsmen(filterLocation);
    } else {
      // Still need to set loading to false if no location yet
      setLoading(false);
    }
  }, []);

  // Filter craftsmen based on selected category and login status
  const filteredCraftsmen = Array.isArray(craftsmen) ? craftsmen.filter(craftsman => {
    // For non-logged in users, only show Basic category
    if (!isSignedIn && (selectedCategory === "Standard" || selectedCategory === "Premium" || selectedCategory === "Luxury")) {
      return false;
    }

    // Extract numeric rate value
    let rate;
    if (craftsman && craftsman.rateNumeric !== undefined) {
      // Use pre-calculated numeric rate from API
      rate = craftsman.rateNumeric;
    } else if (craftsman && craftsman.rate) {
      // Extract from rate string for sample data
      const rateMatch = craftsman.rate.match(/\d+/);
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
          Craftsman
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

      {/* Focus Links (Pass the setSelectedCategory function) */}
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
              {selectedCategory} category craftsmen are only available to logged in users. Create a free account to unlock all craftsmen in this category.
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
      {!loading && filteredCraftsmen.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-3">No craftsmen found in the {selectedCategory} category.</p>
        </div>
      )}

      {/* Carousel & Filtered Craftsman Cards */}
      <div className="flex flex-col space-y-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto mb-16">
        {!loading && filteredCraftsmen.length > 0 && (isSignedIn ? filteredCraftsmen : filteredCraftsmen.slice(0, 3)).map(craftsman => (
          <div
            key={craftsman._id || craftsman.id}
            className="w-full flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden"
            style={{ height: 'auto', minHeight: { md: '380px' } }}
          >
            <div className='w-full md:w-1/2 h-[300px] md:h-[380px]'>
              {/* Improved Portfolio Image Handling */}
              {craftsman.portfolio && Array.isArray(craftsman.portfolio) && craftsman.portfolio.length > 0 ? (
                <div className="h-full">
                  <Carousel customImages={craftsman.portfolio} />
                </div>
              ) : (
                // Default carousel if no portfolio images
                <div className="h-full">
                  <Carousel />
                </div>
              )}
            </div>
            <div className='w-full md:w-1/2 h-auto md:h-[380px]'>
              <CraftsmanProfileCard
                id={craftsman._id || craftsman.id}
                name={craftsman.name}
                rate={craftsman.rate}
                location={<><FontAwesomeIcon icon={faLocationDot} /> {craftsman.location}</>}
                availableCities={craftsman.availableCities}
                reviewImage={craftsman.reviewImage}
                experience={craftsman.experience}
                projectsCompleted={craftsman.projectsCompleted}
                description={craftsman.description}
                email={craftsman.email}
                phoneNumber={craftsman.phoneNumber}
                googleReviews={craftsman.googleReviews || "0"}
                rating={craftsman.rating || "5"}
                contactType="craftsman"
              />
            </div>
          </div>
        ))}
        
        {/* Login card for non-logged-in users if more craftsmen exist */}
        {!isSignedIn && filteredCraftsmen.length > 3 && (
          <div className="mt-12 mb-8 bg-gradient-to-r from-[#006452] to-[#00836b] rounded-lg shadow-xl p-4 sm:p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-white p-3 sm:p-4 rounded-full mb-4">
                <img src={lock} alt="Lock" className="w-8 sm:w-10 h-8 sm:h-10" />
              </div>
              <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">
                {filteredCraftsmen.length - 3 >= 10 ? "10+" : filteredCraftsmen.length - 3} More Craftsmen Available
              </h3>
              <p className="text-white/90 mb-4 sm:mb-6 max-w-lg text-sm sm:text-base">
                Create a free account to unlock all craftsmen matching your search criteria and access advanced features.
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
      {/* <div>
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

export default Craftsmen;