import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const Hero = ({ company = {}, isEnquiryOpen, setIsEnquiryOpen }) => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isInComparison, setIsInComparison] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [travelTime, setTravelTime] = useState(null);
  const [shouldShowDistance, setShouldShowDistance] = useState(true);

  // Sample USPs - in a real implementation, these would come from the backend
  const sampleUSPs = [
    "Premium Quality Materials",
    "On-Time Delivery",
    "5-Year Warranty",
    "Free Consultation"
  ];

  // Set default values when component mounts or when user state changes
  useEffect(() => {
    if (isSignedIn && user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.primaryEmailAddress?.emailAddress || ''
      }));
    }
  }, [isSignedIn, user]);

  const defaultCompany = {
    latitude: "22.6129",
    longitude: "75.6650",
  };
  const companyData = { ...defaultCompany, ...company };

  const getLogoWithoutBackground = (logoUrl) => {
    if (!logoUrl) return "";
    if (logoUrl.includes("cloudinary.com")) {
      try {
        const parts = logoUrl.split("/upload/");
        if (parts.length === 2) {
          return parts[0] + "/upload/e_bgremoval/" + parts[1];
        }
      } catch (err) {
        console.error("Error applying background removal:", err);
      }
    }
    return logoUrl;
  };
  useEffect(() => {
    if (user && companyData._id) {
      const compareList = JSON.parse(localStorage.getItem(`compareList_${user.id}`) || '[]');
      setIsInComparison(compareList.some(comp => comp._id === companyData._id));
    }

    // Check if we should hide distance
    const hideDistance = localStorage.getItem('hideDistanceInCompare') === 'true';
    setShouldShowDistance(!hideDistance);
  }, [companyData._id, user]);

  const processedLogo = getLogoWithoutBackground(companyData.logo);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const GoogleLogo = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCostEstimatorClick = () => {
    if (!isSignedIn) {
      alert('Please login to use the cost estimator');
      return;
    }

    // Navigate to the estimator page instead of compare page
    navigate('/cost-estimator', {
      state: {
        companyId: companyData._id,
        companyName: companyData.name,
        priceData: {
          basicPriceRange: companyData.basicPriceRange ,
          premiumPriceRange: companyData.premiumPriceRange ,
          luxuryPriceRange: companyData.luxuryPriceRange
        }
      }
    });
  };

  const handleEnquireClick = () => {
    setIsEnquiryOpen(true);
    setSubmitStatus(null);
  };

  const handleCostEstimatorButton = () => {
    handleCostEstimatorClick();
  };

  const handleCloseEnquiry = () => {
    setIsEnquiryOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Validate form data
      if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim() || !formData.description.trim()) {
        throw new Error("All fields are required");
      }

      // Include company information in the submission
      const enquiryData = {
        ...formData,
        companyId: companyData._id,
        companyName: companyData.name,
        companyEmail: companyData.email,
        userId: isSignedIn && user ? user.id : null
      };

      // Get the base URL based on environment
      const baseURL = process.env.NODE_ENV === 'production'
        ? 'https://inty-backend.onrender.com'
        : 'https://inty-backend.onrender.com';

      const response = await axios.post(`${baseURL}/api/contact/enquiry`, enquiryData);

      if (response.data.success) {
        setSubmitStatus({
          success: true,
          message: "Your enquiry has been submitted successfully! We'll get back to you soon."
        });

        // Reset form after successful submission
        setTimeout(() => {
          setIsEnquiryOpen(false);
          // Keep user info if signed in, but clear other fields
          setFormData(prev => ({
            name: isSignedIn && user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
            email: isSignedIn && user ? user.primaryEmailAddress?.emailAddress || "" : "",
            mobile: "",
            description: ""
          }));
          setSubmitStatus(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      setSubmitStatus({
        success: false,
        message: error.response?.data?.message || error.message || "Failed to submit enquiry. Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Function to convert degrees to radians
  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Request user's location once
  const getUserLocation = () => {
    setIsLocationLoading(true);
    setLocationError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Calculate distance
          const dist = calculateDistance(
            latitude,
            longitude,
            parseFloat(companyData.latitude),
            parseFloat(companyData.longitude)
          );

          setDistance(dist);

          // Estimate travel time (rough approximation)
          // Assuming average driving speed of 40 km/h in urban areas
          const estimatedMinutes = Math.round((dist / 40) * 60);
          setTravelTime(`~${estimatedMinutes} min drive`);

          setIsLocationLoading(false);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setLocationError("Could not access your location. Please ensure location services are enabled.");
          setIsLocationLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocationLoading(false);
    }
  };

  // Format distance for display
  const formatDistance = (distanceInKm) => {
    if (distanceInKm < 1) {
      return `${Math.round(distanceInKm * 1000)} meters`;
    } else {
      return `${distanceInKm.toFixed(1)} km`;
    }
  };

  // Clean up watchPosition when component unmounts
  useEffect(() => {
    return () => {
      // No cleanup needed anymore
    };
  }, []);

  //for handling comparision 
  const handleCompare = (e) => {
    e.preventDefault();

    if (!isSignedIn) {
      alert('Please login to use comparison feature');
      return;
    }

    const compareList = JSON.parse(localStorage.getItem(`compareList_${user.id}`) || '[]');

    if (isInComparison) {
      const newList = compareList.filter(comp => comp._id !== companyData._id);
      localStorage.setItem(`compareList_${user.id}`, JSON.stringify(newList));
      setIsInComparison(false);
    } else {
      if (compareList.length >= 3) {
        alert('You can only compare up to 3 companies. Please remove one to add another.');
        return;
      }
      const newList = [...compareList, companyData];
      localStorage.setItem(`compareList_${user.id}`, JSON.stringify(newList));
      setIsInComparison(true);
    }
  };

  const inputStyle = "w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:border-[#006452]";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const textareaStyle = "w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:border-[#006452] resize-none";
  const locationBtnStyle = "flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-[#006452] border border-[#006452] rounded-md shadow-sm text-sm font-medium hover:bg-[#f0f9f6] transition-colors";

  return (
    <>
      <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] bg-gradient-to-b from-[#006452] to-[#c2f8ee]">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
              {companyData.nameDisplay || "Company Name"}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 drop-shadow-md">

            </p>

            {/* USP Section */}
            {companyData.usp && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex flex-wrap justify-center gap-3 mb-8"
              >
                {companyData.usp.split(',').map((usp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/30 shadow-lg"
                  >
                    <span className="font-medium">{usp.trim()}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <button
                onClick={handleCostEstimatorClick}
                className="bg-white text-[#006452] px-6 py-3 rounded-md font-bold hover:bg-opacity-90 transition-all duration-300 shadow-lg flex items-center gap-2"
              >
                Cost Estimator
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-20 sm:-mt-24 md:-mt-28 lg:-mt-32 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col lg:flex-row gap-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="w-full lg:w-1/2"
          >

            <div className="h-px w-full bg-gray-200 my-2"></div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center justify-center">
                <img
                  src={processedLogo}
                  alt={`${companyData.name} Logo`}
                  className="h-16 sm:h-20 md:h-28 lg:h-32 object-contain transition-all hover:scale-105 duration-300"
                  onError={(e) => {
                    console.error("Error loading logo with background removal");
                    e.target.onerror = null;
                    e.target.src = companyData.logo;
                  }}
                />
              </div>
              <div className="hidden sm:block h-16 md:h-20 lg:h-24 bg-black w-[2px]"></div>
              <div className="flex items-center sm:flex-col md:flex-row gap-2 mt-3 sm:mt-0">
                <GoogleLogo />
                <div className="text-xs sm:text-sm md:text-base">
                  <span className="font-bold">{companyData.googleReviews}</span> Reviews <br />
                  <div className="flex mt-1">
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i} className="text-yellow-500 text-xs sm:text-sm md:text-base">{star}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Offers Section */}
            {companyData.discountsOfferTimeline && (
              <div className="w-full mt-4">
                <div className="h-px w-full bg-gray-200 mb-3"></div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Offers</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {companyData.discountsOfferTimeline.split(',').map((offer, index) => (
                    <div key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                      {offer.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Awards Section */}
            {companyData.anyAwardWon && (
              <div className="w-full mt-4">
                <div className="h-px w-full bg-gray-200 mb-3"></div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Awards</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {companyData.anyAwardWon.split(',').map((award, index) => (
                    <div key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                      {award.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* USP Section */}
            {companyData.usp && (
              <div className="w-full mt-4">
                <div className="h-px w-full bg-gray-200 mb-3"></div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Unique Selling Points</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {companyData.usp.split(',').map((usp, index) => (
                    <div key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                      {usp.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3 w-full">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCompare}
                className={`px-3 py-2 w-full ${isInComparison ? 'bg-red-500 hover:bg-red-600' : 'bg-[#006452] hover:bg-[#004d3b]'} text-white rounded-md transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                </svg>
                <span className="whitespace-nowrap">{isInComparison ? 'Remove from Compare' : 'Add to Compare'}</span>
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="mt-4 lg:mt-0 w-full lg:w-1/2 max-w-lg relative"
          >
            <div className="relative rounded-lg overflow-hidden shadow-md" style={{ height: '350px' }}>
              {/* Replace the static map solution with an iframe */}
              {companyData && companyData.latitude && companyData.longitude ? (
                <div className="relative w-full h-full overflow-hidden">
                  {/* Google Maps iframe */}
                  <iframe
                    title={`${companyData.name || 'Company'} Location`}
                    className="absolute inset-0 w-full h-full z-10"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${parseFloat(companyData.latitude)},${parseFloat(companyData.longitude)}&zoom=15`}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>

                  {/* Decorative borders - updated design */}
                  <div className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none z-20"></div>
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#006452] rounded-tl-lg pointer-events-none z-20"></div>
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#006452] rounded-tr-lg pointer-events-none z-20"></div>
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#006452] rounded-bl-lg pointer-events-none z-20"></div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#006452] rounded-br-lg pointer-events-none z-20"></div>


                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#e6f7f2] to-[#f0f9f6]">
                  <div className="text-center p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-[#006452]/10">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 border-2 border-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Location Unavailable</h3>
                    <div className="w-16 h-0.5 bg-gray-200 mx-auto mb-3"></div>
                    <p className="text-gray-500 font-medium">No location data available</p>
                    <p className="text-gray-400 text-sm mt-2">Company coordinates not provided</p>
                  </div>
                </div>
              )}

              {/* Distance indicator - updated design */}
              {distance !== null && shouldShowDistance && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg text-[#006452] font-medium text-sm shadow-lg z-30 border border-[#006452]/10">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Distance: {formatDistance(distance)}</span>
                  </div>
                  {travelTime && (
                    <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-[#006452]/10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Drive time: {travelTime}</span>
                    </div>
                  )}
                </div>
              )}

              {/* City label - updated design */}
              {/* <div className="absolute top-16 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[#006452] font-medium text-sm shadow-lg z-30 border border-[#006452]/10 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {companyData.city || companyData.location || 'Location'}
              </div> */}

              {/* Location button controls - updated design */}
              <div className="absolute bottom-3 left-0 right-0 flex flex-wrap gap-2 justify-center z-30">
                {!userLocation && !isLocationLoading && (
                  <button
                    onClick={getUserLocation}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-md text-[#006452] border border-[#006452] rounded-lg shadow-lg text-sm font-medium hover:bg-[#f0f9f6] transition-all duration-300"
                    disabled={isLocationLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Check Distance</span>
                  </button>
                )}

                {userLocation && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${parseFloat(companyData.latitude)},${parseFloat(companyData.longitude)}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/95 hover:bg-green-600 text-white rounded-lg shadow-lg text-sm font-medium transition-all duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span>Get Directions</span>
                  </a>
                )}

                {isLocationLoading && (
                  <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-lg text-[#006452] text-sm shadow-lg flex items-center gap-2 border border-[#006452]/10">
                    <svg className="animate-spin h-5 w-5 text-[#006452]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Finding location...</span>
                  </div>
                )}
              </div>

              {/* Location error message - updated design */}
              {locationError && (
                <div className="absolute bottom-16 left-3 right-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm text-center z-30 shadow-md">
                  <div className="flex items-center gap-2 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {locationError}
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        </div>
      </div>

      {/* Centered Enquiry Now Modal Outside Main Container for unblured effect! */}
      {isEnquiryOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 sm:mx-auto"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Enquire Now</h2>

            {submitStatus && (
              <div className={`p-3 rounded-md mb-4 ${submitStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {submitStatus.message}
              </div>
            )}

            {/* Responsive Form with Stacked elements with padding, margin and sizes for Mobile view
             and full screens (md)*/}
            <form className="mx-auto mt-0" onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className={labelStyle}>Name:</label>
                <input
                  type="text"
                  id="name"
                  className={inputStyle}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className={labelStyle}>Email:</label>
                <input
                  type="email"
                  id="email"
                  className={inputStyle}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="mobile" className={labelStyle}>Mobile Number:</label>
                <input
                  type="tel"
                  id="mobile"
                  className={inputStyle}
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter your mobile number"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className={labelStyle}>Description:</label>
                <textarea
                  id="description"
                  rows="4"
                  className={textareaStyle}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Please describe your project requirements..."
                  required
                />
              </div>

              {/* Responsive Buttons: Stacked for small screens */}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEnquiry}
                  className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 transition-colors mb-2 sm:mb-0"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006452] text-white rounded-md hover:bg-[#004d3b] transition-colors flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Enquiry"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Hero;