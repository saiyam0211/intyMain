import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import defaultBanner from "../../assets/banner.png";
import axios from "axios";
import { useTopRatedContext } from "../../Context/TopRatedContext";
import Verified from "../../assets/iw-assured.png";

const API_URL = "http://localhost:3000/api";

export default function CompanyCard({ company, edit = false, onCompareChange }) {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localCompany, setLocalCompany] = useState({});
  const [isInComparison, setIsInComparison] = useState(false);
  const { topRatedCount, setTopRatedCount } = useTopRatedContext();
  const [distance, setDistance] = useState(null);
  const [shouldShowDistance, setShouldShowDistance] = useState(true);

  useEffect(() => {
    if (company) {
      setLocalCompany(company);
      if (company.topRated) setTopRatedCount(prev => prev + 1);
      console.log(`Company ${company.name} - Assured status: ${company.assured || 'Not set'}`, company);
    }
    
    // Check if we should hide distance
    const hideDistance = localStorage.getItem('hideDistanceInCompare') === 'true';
    setShouldShowDistance(!hideDistance);
  }, [company, setTopRatedCount]);

  // Calculate distance when component mounts or when company changes
  useEffect(() => {
    if (company && shouldShowDistance) {
      calculateDistanceFromUser(company);
    }
  }, [company, shouldShowDistance]);

  useEffect(() => {
    if (user && localCompany._id) {
      const compareList = JSON.parse(localStorage.getItem(`compareList_${user.id}`) || '[]');
      setIsInComparison(compareList.some(comp => comp._id === localCompany._id));
    }
  }, [localCompany._id, user]);

  // Calculate distance between user and company
  const calculateDistanceFromUser = (company) => {
    // Check if distance should be hidden based on user preference
    if (localStorage.getItem('hideDistanceInCompare') === 'true') {
      console.log('Skipping distance calculation due to user preference');
      return;
    }
    
    const userLiveLocationStr = localStorage.getItem('userLiveLocation');
    if (!userLiveLocationStr) {
      console.log("No user live location found in localStorage");
      return;
    }

    try {
      const userLocation = JSON.parse(userLiveLocationStr);
      console.log("User location from localStorage:", userLocation);
      
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        console.log("Invalid user location data");
        return;
      }
      
      // Log the entire company object to see all available fields
      console.log("Full company object for coordinate extraction:", company);
      
      // Check if company has coordinates directly (this is the format we're now using)
      if (company.coordinates) {
        // Handle different coordinate formats
        let companyLat, companyLng;
        
        if (typeof company.coordinates === 'object') {
          // Object format: { latitude, longitude } or { lat, lng }
          companyLat = company.coordinates.latitude || company.coordinates.lat;
          companyLng = company.coordinates.longitude || company.coordinates.lng;
        } else if (typeof company.coordinates === 'string') {
          // String format: "latitude,longitude"
          try {
            const coordParts = company.coordinates.split(',');
            if (coordParts.length === 2) {
              companyLat = parseFloat(coordParts[0].trim());
              companyLng = parseFloat(coordParts[1].trim());
            }
          } catch (e) {
            console.error("Error parsing coordinates string:", e);
          }
        }
        
        if (companyLat && companyLng) {
          console.log("Using company's coordinates:", { lat: companyLat, lng: companyLng });
          
          const dist = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            companyLat,
            companyLng
          );
          
          console.log(`Distance calculated using company's coordinates: ${dist} km`);
          setDistance(dist);
          return;
        }
      }
      
      // The rest of the function is fallback logic if the coordinates property is missing
      
      // Check if company has lat and lng fields
      if (company.lat && company.lng) {
        console.log("Using company's lat/lng fields:", { lat: company.lat, lng: company.lng });
        
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          company.lat,
          company.lng
        );
        
        console.log(`Distance calculated using company's lat/lng: ${dist} km`);
        setDistance(dist);
        return;
      }
      
      // Check if company has latitude and longitude fields
      if (company.latitude && company.longitude) {
        console.log("Using company's latitude/longitude fields:", { latitude: company.latitude, longitude: company.longitude });
        
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          company.latitude,
          company.longitude
        );
        
        console.log(`Distance calculated using company's latitude/longitude: ${dist} km`);
        setDistance(dist);
        return;
      }
      
      // Check if coordinates are in the address field
      if (company.address && typeof company.address === 'string') {
        // Try to extract coordinates from address field
        // Some APIs store coordinates in the address field in format "... [lat,lng]"
        const coordMatch = company.address.match(/\[(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\]/);
        if (coordMatch && coordMatch.length === 3) {
          const lat = parseFloat(coordMatch[1]);
          const lng = parseFloat(coordMatch[2]);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            console.log("Extracted coordinates from address:", { lat, lng });
            
            const dist = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              lat,
              lng
            );
            
            console.log(`Distance calculated using coordinates from address: ${dist} km`);
            setDistance(dist);
            return;
          }
        }
      }
      
      // Fallback to city-based mapping if no direct coordinates are available
      const cityCoordinates = {
        'Bengaluru': { lat: 12.9716, lng: 77.5946 },
        'Indore': { lat: 22.7196, lng: 75.8577 },
        'Nagpur': { lat: 21.1458, lng: 79.0882 }
      };
      
      // Get coordinates for the company's city
      const companyCity = company.location;
      console.log("Company location (city):", companyCity); // Debug log
      
      if (!companyCity) {
        console.log("Company has no location data");
        return;
      }
      
      const companyCityCoords = cityCoordinates[companyCity];
      
      if (!companyCityCoords) {
        console.log(`No coordinates found for city: ${companyCity}`);
        return;
      }
      
      // Use city coordinates as fallback
      const dist = calculateDistance(
        userLocation.latitude, 
        userLocation.longitude, 
        companyCityCoords.lat, 
        companyCityCoords.lng
      );
      
      console.log(`Distance calculated using city coordinates (fallback): ${dist} km`); // Debug log
      setDistance(dist);
    } catch (err) {
      console.error("Error calculating distance:", err);
    }
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
    return d.toFixed(1); // Return distance with 1 decimal place
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  // Apply Cloudinary background removal transformation to logo
  const getLogoWithoutBackground = (logoUrl) => {
    if (!logoUrl) return defaultBanner;
    
    // Check if it's a Cloudinary URL
    if (logoUrl.includes('cloudinary.com')) {
      try {
        // Simple and reliable approach - split and join
        const parts = logoUrl.split('/upload/');
        if (parts.length === 2) {
          // Use the simple bgremoval effect which is more reliable
          return parts[0] + '/upload/e_bgremoval/' + parts[1];
        }
      } catch (err) {
        console.error('Error applying background removal:', err);
      }
    }
    return logoUrl;
  };

  // Determine the banner image source dynamically
  const getBannerImage = () => {
    // Try to use banner images in order of priority
    if (localCompany?.logo) return localCompany.logo; // Keep original logo as first priority for banner
    if (localCompany?.bannerImage1) return localCompany.bannerImage1;
    if (localCompany?.bannerImage2) return localCompany.bannerImage2;
    if (localCompany?.bannerImage3) return localCompany.bannerImage3;

    // If no image is available, use the default banner as fallback
    return defaultBanner;
  };

  // Get logo with background removed
  const getCompanyLogo = () => {
    return localCompany?.logo ? getLogoWithoutBackground(localCompany.logo) : defaultBanner;
  };

  const handleCompare = (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to use comparison feature');
      return;
    }

    const compareList = JSON.parse(localStorage.getItem(`compareList_${user.id}`) || '[]');

    if (isInComparison) {
      const newList = compareList.filter(comp => comp._id !== localCompany._id);
      localStorage.setItem(`compareList_${user.id}`, JSON.stringify(newList));
      setIsInComparison(false);
    } else {
      if (compareList.length >= 3) {
        alert('You can only compare up to 3 companies. Please remove one to add another.');
        return;
      }
      const newList = [...compareList, localCompany];
      localStorage.setItem(`compareList_${user.id}`, JSON.stringify(newList));
      setIsInComparison(true);
    }

    if (onCompareChange) {
      onCompareChange();
    }
  };

  const handleTopRating = async () => {
    if (localCompany?.topRated == false && topRatedCount >= 3) {
      alert("Already 3 companies marked rated!");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const token = localStorage.getItem("adminToken");
      console.log("Using token:", token ? "Token exists" : "No token");

      const response = await axios.put(`${API_URL}/companies/edit/${localCompany?._id}`, {
        topRated: localCompany?.topRated ? false : true
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        timeout: 120000, // 2min second timeout
      });

      console.log("API Response:", response.data); // Debug log
      if (localCompany?.topRated == true) setTopRatedCount(prev => prev - 1);
      else setTopRatedCount(prev => prev + 1);
      setLocalCompany(response.data);
    } catch (err) {
      console.error("Error Rating companies:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to rate company. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyListing = async () => {
    try {
      setError(null);
      setLoading(true);

      const token = localStorage.getItem("adminToken");
      console.log("Using token:", token ? "Token exists" : "No token");

      const response = await axios.put(`${API_URL}/companies/edit/${localCompany?._id}`, {
        show: localCompany?.show ? false : true
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        timeout: 120000, // 2min second timeout
      });

      console.log("API Response:", response.data); // Debug log
      setLocalCompany(response.data);
    } catch (err) {
      console.error("Error Listing companies:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to list company. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate average rating from reviews
  const averageRating = localCompany.reviews?.length > 0
    ? (localCompany.reviews.reduce((acc, review) => acc + review.rating, 0) / localCompany.reviews.length).toFixed(1)
    : 5;

  // Get total number of reviews
  const totalReviews = localCompany?.googleReviews;

  // Update the showDistance function
  const showDistance = () => {
    // Check if distance should be hidden based on user preference
    const hideDistance = localStorage.getItem('hideDistanceInCompare') === 'true';
    console.log('hideDistanceInCompare flag:', hideDistance);
    
    if (hideDistance) {
      console.log('Distance display disabled due to user preference');
      return false;
    }
    
    // Get user's live location from localStorage
    const userLiveLocationStr = localStorage.getItem('userLiveLocation');
    
    // Only show distance if we have user's live location
    if (!userLiveLocationStr) {
      console.log('No user location found, hiding distance');
      return false;
    }
    
    // Only show distance if we have valid distance data
    const hasValidDistance = distance !== null && !isNaN(distance);
    console.log('Has valid distance data:', hasValidDistance);
    return hasValidDistance;
  };

  // Check if this is nearest company
  const isNearest = () => {
    // If nearest flag is explicitly set on the company, use that
    if (company && company.isNearest) {
      return true;
    }
    
    // Otherwise, only show nearest badge if location is a constraint
    if (localStorage.getItem('hideDistanceInCompare') === 'true') {
      return false;
    }
    
    // Check if this company has a valid distance and is the first in the list
    return distance !== null && !isNaN(distance) && company && company.isFirstCard;
  };

  // Add an effect that specifically listens for localStorage and custom events
  useEffect(() => {
    // Create a storage event listener
    const handleStorageChange = (e) => {
      console.log('Storage changed:', e.key, e.newValue);
      
      // If hideDistanceInCompare flag changes, update the state
      if (e.key === 'hideDistanceInCompare') {
        const hideDistance = e.newValue === 'true';
        console.log('hideDistanceInCompare flag changed to:', hideDistance);
        setShouldShowDistance(!hideDistance);
      }
    };
    
    // Handler for the custom locationPreferenceChanged event
    const handleLocationPreferenceChanged = () => {
      console.log('Location preference changed event received');
      const hideDistance = localStorage.getItem('hideDistanceInCompare') === 'true';
      console.log('Current hideDistanceInCompare flag:', hideDistance);
      setShouldShowDistance(!hideDistance);
    };
    
    // Add the listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('locationPreferenceChanged', handleLocationPreferenceChanged);
    
    // Also check the current value on mount
    const hideDistance = localStorage.getItem('hideDistanceInCompare') === 'true';
    setShouldShowDistance(!hideDistance);
    
    // Cleanup the listeners on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('locationPreferenceChanged', handleLocationPreferenceChanged);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="ml-5 w-[294px] mt-10 h-auto bg-white shadow-2xl rounded-[16px] relative hover:shadow-emerald-950">
      {/* Show distance if available, otherwise show top rated badge */}
      {showDistance() && (
        <div className="absolute bg-[#006452] top-[-35px] left-[-12px] rounded-r-lg flex items-center gap-2 mt-4 ml-3 p-2">
          <svg 
            className="w-4 h-4 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div className={`text-sm font-medium ${distance !== null ? 'text-white-600' : 'text-white-400'}`}>
            {distance !== null ? (
              <>
                <span className="font-semibold text-white">{distance}</span> <span className="font-semibold text-white">km away</span>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span>Calculating distance</span>
                <span className="flex gap-1">
                  <span className="animate-bounce delay-0">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* "Nearest" badge */}
      {isNearest() && (
        <div className="absolute bg-orange-500 top-[-35px] right-[-12px] rounded-l-lg flex items-center gap-1 mt-4 mr-3 p-2 z-10">
          <svg 
            className="w-4 h-4 text-white" 
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M5.05025 4.05025C7.78392 1.31658 12.2161 1.31658 14.9497 4.05025C17.6834 6.78392 17.6834 11.2161 14.9497 13.9497L10 18.8995L5.05025 13.9497C2.31658 11.2161 2.31658 6.78392 5.05025 4.05025ZM10 11C11.1046 11 12 10.1046 12 9C12 7.89543 11.1046 7 10 7C8.89543 7 8 7.89543 8 9C8 10.1046 8.89543 11 10 11Z"
            />
          </svg>
          <span className="font-semibold text-white text-sm">Nearest</span>
        </div>
      )}
      
      {localCompany?.assured === "Yes" && (
        <div className="absolute top-[185px] left-[-45px] px-4 py-2 rounded-br-lg rounded-tl-lg z-20">
          <img src={Verified} alt="verified" />
        </div>
      )}
      {/* Review Section - Custom Google Review */}
      <div className="flex justify-between p-4">
        <div className="flex items-center">
          {/* Google Logo */}
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 48 48"
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
          </div>

          {/* Review Info */}
          <div className="flex flex-col ml-2">
            {/* Text mentioning reviews */}
            <span className="text-md text-gray-600 ml-1">{totalReviews} reviews</span>

            {/* Star Rating */}
            <div className="flex">
              {/* Stars based on rating */}
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            </div>
          </div>
        </div>

        {isSignedIn ? (
          <button
            onClick={handleCompare}
            className={`cursor-pointer w-[96px] h-[31px] rounded-[8px] mt-3.5 text-white
              ${isInComparison
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-[rgba(0,100,82,0.4)] hover:bg-[#006452]'
              }`}
          >
            {isInComparison ? 'Remove' : 'Compare'}
          </button>
        ) : (
          <button
            className="button cursor-pointer w-[96px] h-[31px] bg-[rgba(0,100,82,0.4)] text-white rounded-[8px] mt-3.5 hover:bg-[#006452]"
            onClick={() => {
              navigate('/compare');
            }}
          >
            Compare
          </button>
        )}
      </div>

      {/* Image Section - Now using background-removed logo */}
      <div className="flex justify-center items-center w-full h-36 overflow-hidden bg-white">
        <img
          className="max-w-full max-h-full object-contain"
          src={getCompanyLogo()}
          alt={localCompany?.name || localCompany?.companyName || "Company Logo"}
          onError={(e) => {
            console.error("Error loading logo, falling back to banner");
            e.target.onerror = null;
            e.target.src = getBannerImage(); // Fallback to banner image if logo fails
          }}
        />
      </div>

      {/* Company Details */}
      <div className="bg-[rgba(0,100,82,0.4)] text-white w-full p-5 rounded-[16px] hover:bg-[#006452] transition duration-300 flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <p
              className="text-[22px] font-bold"
              style={{
                fontWeight: 700,
                fontSize: "22px",
                lineHeight: "26.63px",
                letterSpacing: "0%",
              }}
            >
              {localCompany?.projectsCount || localCompany?.projects || '0'}+
            </p>
            <p
              className="text-[12px]"
              style={{
                fontWeight: 500,
                fontSize: "12px",
                lineHeight: "14.52px",
                letterSpacing: "0%",
              }}
            >
              Projects Completed
            </p>
          </div>
          {localCompany?.usp && (
            <button className="bg-[rgba(254,97,0,1)] text-sm h-5 w-25 text-white rounded-[2px] px-2 truncate">
              {localCompany.usp.split(',')[0].trim()}
            </button>
          )}
        </div>
        <div className="flex-col">
          <p
            className="text-2xl font-bold"
            style={{
              fontWeight: 700,
              fontSize: "22px",
              lineHeight: "26.63px",
              letterSpacing: "0%",
            }}
          >
            {localCompany?.yearsOfExperience || localCompany?.experience || '0'}+
          </p>
          <p
            style={{
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "14.52px",
              letterSpacing: "0%",
            }}
          >
            Years Experience
          </p>
        </div>
        <div className="flex-col">
          <p
            className="text-2xl font-bold"
            style={{
              fontWeight: 700,
              fontSize: "22px",
              lineHeight: "26.63px",
              letterSpacing: "0%",
            }}
          >
            {localCompany?.branchCount || localCompany?.branches || '1'}+
          </p>
          <p
            style={{
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "14.52px",
              letterSpacing: "0%",
            }}
          >
            Branches
          </p>
        </div>
        <button className="mt-1 p-2 cursor-pointer bg-white w-full rounded-4xl text-blue-500" onClick={() => {
          navigate(`/CompanyProfile/${localCompany?._id}`)
        }}>
          Know More
        </button>
        {edit && (
          <button className="mt-1 p-2 cursor-pointer bg-white w-full rounded-4xl text-blue-500" onClick={() => {
            navigate(`/admin/editCompany/${localCompany?._id}`)
          }}>
            Edit
          </button>
        )}
        {edit && (
          <button className="mt-1 p-2 cursor-pointer bg-white w-full rounded-4xl text-blue-500" onClick={handleTopRating}>
            {localCompany?.topRated ? "Remove TopRated" : "Mark TopRated"}
          </button>
        )}
        {edit && (
          <button className="mt-1 p-2 cursor-pointer bg-white w-full rounded-4xl text-blue-500" onClick={handleCompanyListing}>
            {localCompany?.show ? "Unlist" : "List"}
          </button>
        )}
      </div>
    </div>
  );
}