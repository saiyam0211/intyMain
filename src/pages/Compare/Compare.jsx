import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { X, ChevronRight, ChevronLeft, Plus } from "lucide-react";
import Header from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import backgroundImage from "../../assets/background.png";
import axios from "axios";
import TableCorousel, { CompanyImagesCarousel } from "../../components/TableCorousel/Tablecorousel";
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { AiOutlineStar } from 'react-icons/ai';

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
  return d.toFixed(1);
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

const calculateDistanceFromUser = (company) => {
  const userLiveLocationStr = localStorage.getItem('userLiveLocation');
  
  // If we don't have user's live location, don't show distance
  if (!userLiveLocationStr) {
    return null;
  }

  try {
    const userLocation = JSON.parse(userLiveLocationStr);
    
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return null;
    }
    
    // Check if company has coordinates directly
    if (company.coordinates) {
      let companyLat, companyLng;
      
      if (typeof company.coordinates === 'object') {
        companyLat = company.coordinates.latitude || company.coordinates.lat;
        companyLng = company.coordinates.longitude || company.coordinates.lng;
      } else if (typeof company.coordinates === 'string') {
        const coordParts = company.coordinates.split(',');
        if (coordParts.length === 2) {
          companyLat = parseFloat(coordParts[0].trim());
          companyLng = parseFloat(coordParts[1].trim());
        }
      }
      
      if (companyLat && companyLng) {
        return calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          companyLat,
          companyLng
        );
      }
    }
    
    // Check if company has lat and lng fields
    if (company.lat && company.lng) {
      return calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        company.lat,
        company.lng
      );
    }
    
    // Check if company has latitude and longitude fields
    if (company.latitude && company.longitude) {
      return calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        company.latitude,
        company.longitude
      );
    }
    
    return null;
  } catch (err) {
    console.error("Error calculating distance:", err);
    return null;
  }
};

// Add this component for lazy loading images with a loading state
const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse w-full h-full bg-gray-200"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">Image not available</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        loading="lazy"
      />
    </div>
  );
};

const Compare = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for image carousel - one index per company
  const [currentImageIndexes, setCurrentImageIndexes] = useState([0, 0, 0]); // For up to 3 companies
  // Add new state for visible companies and active tab
  const [visibleCompanies, setVisibleCompanies] = useState([0, 1, 2]);
  const [activeTab, setActiveTab] = useState(0);

  // Add useEffect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      fetchCompaniesForComparison();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCompaniesForComparison = async () => {
    try {
      setLoading(true);
      // First get the IDs from localStorage
      const compareList = JSON.parse(
        localStorage.getItem(`compareList_${user.id}`) || "[]"
      );

      if (compareList.length === 0) {
        setCompanies([]);
        setLoading(false);
        return;
      }

      // Get the company IDs
      const companyIds = compareList.map((company) => company._id);
      
      // Check localStorage cache first for company data
      const cachedData = localStorage.getItem(`compare_cache_${user.id}`);
      const cacheTimestamp = localStorage.getItem(`compare_cache_timestamp_${user.id}`);
      const now = new Date().getTime();
      
      // Use cache if it exists and is less than 1 hour old
      if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < 3600000)) {
        try {
          const parsedCache = JSON.parse(cachedData);
          // Verify the cache has all the companies we need
          const hasAllCompanies = companyIds.every(id => 
            parsedCache.some(company => company._id === id)
          );
          
          if (hasAllCompanies) {
            console.log("Using cached company data");
            // Filter to only include companies that are in the compare list
            const filteredCache = parsedCache.filter(company => 
              companyIds.includes(company._id)
            );
            setCompanies(filteredCache);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Error parsing cache:", err);
          // Continue with API fetch if cache parsing fails
        }
      }

      // Batch fetch approach: one API call with all IDs
      try {
        // Using query parameter to send all IDs at once
        const idsParam = companyIds.join(',');
        const response = await axios.get(
          `https://inty-3.onrender.com/api/companies/batch?ids=${idsParam}`
        );
        
        if (response.data && Array.isArray(response.data.companies) && response.data.companies.length > 0) {
          console.log("Successfully fetched companies in batch:", response.data.companies.length);
          setCompanies(response.data.companies);
          
          // Cache the results in localStorage
          localStorage.setItem(`compare_cache_${user.id}`, JSON.stringify(response.data.companies));
          localStorage.setItem(`compare_cache_timestamp_${user.id}`, now.toString());
          return;
        }
        
        // Fallback to individual requests if batch endpoint fails or isn't available
        console.log("Batch endpoint failed, falling back to individual requests");
        const requests = companyIds.map((id) =>
          axios.get(
            `https://inty-3.onrender.com/api/companies/getCompany/${id}`
          )
        );

        const responses = await Promise.all(requests);
        
        // Extract company details
        const fetchedCompanies = responses.map(response => {
          const companyDetails = response.data.companyDetails;
          return companyDetails;
        });

        if (fetchedCompanies.length > 0) {
          setCompanies(fetchedCompanies);
          
          // Cache the results in localStorage
          localStorage.setItem(`compare_cache_${user.id}`, JSON.stringify(fetchedCompanies));
          localStorage.setItem(`compare_cache_timestamp_${user.id}`, now.toString());
        } else {
          // If API call was successful but returned empty data
          console.warn(
            "API returned empty data, using localStorage data as fallback"
          );
          setCompanies(compareList);
        }
      } catch (err) {
        // If API call failed completely, use the localStorage data
        console.warn(
          "API call failed, using localStorage data as fallback:",
          err
        );
        setCompanies(compareList);
      }
    } catch (err) {
      console.error("Error in comparison process:", err);
      setError("Error processing comparison data");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Modify the removeCompany function to handle visibility
  const removeCompany = async (companyId, index) => {
    // Update localStorage
    const compareList = JSON.parse(
      localStorage.getItem(`compareList_${user.id}`) || "[]"
    );
    const newList = compareList.filter((company) => company._id !== companyId);
    localStorage.setItem(`compareList_${user.id}`, JSON.stringify(newList));

    // Update state
    setCompanies((prevCompanies) =>
      prevCompanies.filter((company) => company._id !== companyId)
    );

    // Update visible companies - FIX: Ensure we're properly updating the visibleCompanies array
    setVisibleCompanies((prev) => {
      const newVisibleCompanies = prev.filter((i) => i !== index);
      // If we removed an index, we need to adjust the indices that are greater than the removed index
      return newVisibleCompanies.map((i) => (i > index ? i - 1 : i));
    });

    // Update active tab if needed
    if (activeTab === index && visibleCompanies.length > 1) {
      setActiveTab(visibleCompanies.filter((i) => i !== index)[0]);
    }
  };

  // First, update the RatingStars component to handle undefined values better
  const RatingStars = ({ rating = 0 }) => {
    const stars = [];
    const ratingNum = parseFloat(rating) || 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(ratingNum)) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i - 0.5 <= ratingNum) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<AiOutlineStar key={i} className="text-yellow-400" />);
      }
    }
    
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="ml-1 text-sm">({ratingNum.toFixed(1)})</span>
      </div>
    );
  };

  // Update the comparisonMetrics array with better error handling
  const comparisonMetrics = [
    // Only include distance metric if we have user's live location AND hideDistanceInCompare is not set
    ...(localStorage.getItem('userLiveLocation') && localStorage.getItem('hideDistanceInCompare') !== 'true' ? [{
      key: "distance",
      label: "Distance",
      valueKey: "distance",
      defaultValue: "N/A",
      getValue: (company) => {
        const distance = calculateDistanceFromUser(company);
        return distance ? `${distance} km away` : "N/A";
      }
    }] : []),
    {
      key: "usp",
      label: "USP",
      valueKey: "usp",
      defaultValue: "-",
      getValue: (company) => {
        return company.usp && company.usp.trim() !== "" ? company.usp : "-";
      }
    },
    {
      key: "completedProjects",
      label: "Completed Projects",
      valueKey: "projects",
      defaultValue: "N/A",
    },
    {
      key: "years of experience",
      label: "Years of Experience",
      valueKey: "experience",
      defaultValue: "N/A",
      suffix: " years",
    },
    {
      key: "deliveryTimelines",
      label: "Delivery Timelines",
      valueKey: "deliveryTimeline",
      defaultValue: "N/A",
      suffix: " months",
    },
    {
      key: "discountsOfferTimeline",
      label: "Offers",
      valueKey: "discountsOfferTimeline",
      defaultValue: "N/A",
    },
    {
      key: "price",
      label: "Price Range per 1000 sq ft",
      valueKey: "minMaxBudget",
      defaultValue: "N/A",
      render: (_, company) => {
        let priceRangeText = "N/A";
        
        // Check if company has both basicPriceRange and luxuryPriceRange
        if (company.basicPriceRange !== undefined && company.luxuryPriceRange !== undefined) {
          // Convert to numbers in case they are stored as strings
          const basicPrice = parseFloat(company.basicPriceRange);
          const luxuryPrice = parseFloat(company.luxuryPriceRange);
          
          if (!isNaN(basicPrice) && !isNaN(luxuryPrice)) {
            const basicPricePerK = basicPrice * 1000;
            const luxuryPricePerK = luxuryPrice * 1000;
            
            // Format numbers with commas for Indian numbering system (e.g., 1,00,000)
            const formatPrice = (price) => {
              return price.toLocaleString('en-IN');
            };
            
            priceRangeText = `₹${formatPrice(basicPricePerK)} - ₹${formatPrice(luxuryPricePerK)}`;
          }
        }
        
        // Fall back to the minMaxBudget if it exists
        if (priceRangeText === "N/A" && company.minMaxBudget) {
          priceRangeText = company.minMaxBudget;
        }
        
        return (
          <div className="flex flex-col gap-2">
            <div className="text-xs sm:text-base md:text-lg font-semibold break-words">
              {priceRangeText}
            </div>
            <Button
              onClick={() => navigate('/cost-estimator', {
                state: {
                  companyId: company._id,
                  companyName: company.name,
                  priceData: {
                    basicPriceRange: company.basicPriceRange,
                    premiumPriceRange: company.premiumPriceRange,
                    luxuryPriceRange: company.luxuryPriceRange
                  }
                }
              })}
              className="bg-[#006452] hover:bg-[#005443] text-white px-3 py-1 text-sm rounded-md w-full mt-1"
            >
              Calculate Cost
            </Button>
          </div>
        );
      }
    },
    {
      key: "googleRating",
      label: "Google Rating",
      valueKey: "googleRating",
      defaultValue: "0",
      render: (value, company = {}) => {
        // Add safety checks
        const rating = company?.googleRating || value || 0;
        return <RatingStars rating={rating} />;
      }
    },
    {
      key: "bannerImages",
      label: "Images",
      valueKey: "bannerImages",
      isImage: true,
      render: (_, company) => <CompanyImagesCarousel company={company} />
    },
    // {
    //   key:"estimator link",
    //   label: "Estimator Link",
    //   valueKey: "",
    //   defaultValue: "visit cost estimator",
    // },
    {
      key: "visitProfile",
      label: "Company Profile",
      valueKey: "_id",
      render: (_, company) => (
        <Button
          onClick={() => navigate(`/CompanyProfile/${company._id}`)}
          className="bg-[#006452] hover:bg-[#005443] text-white px-4 py-2 rounded-md w-full"
        >
          Visit Profile
        </Button>
      )
    }
  ];

  // Update the getCompanyValue function with better error handling
  const getCompanyValue = (company = {}, metric) => {
    if (!metric) return '';

    if (metric.render) {
      return metric.render(company[metric.valueKey], company);
    }
    
    if (metric.getValue) {
      console.log('Using getValue function for metric:', metric.key);
      return metric.getValue(company);
    }
    
    if (metric.isImage) {
      return []; 
    }

    // Handle non-image values
    const value = company[metric.valueKey];
    if (value === undefined || value === null) {
      return metric.defaultValue;
    }

    return `${metric.prefix || ""}${value}${metric.suffix || ""}`;
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <section
          className="relative h-[300px] sm:h-[400px] md:h-[515px] bg-cover bg-center text-white flex items-center justify-center px-4"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(250,250,250,0.85)] to-[rgba(0,100,82,0.85)]"></div>
          <h2 className="z-50 font-inter font-black text-3xl sm:text-4xl md:text-[64px] leading-tight text-white text-center">
            Compare Companies
          </h2>
        </section>
        <div className="pt-12 px-8">
          <div className="text-center p-4 bg-red-50 rounded">
            Please login to use the comparison feature.
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Custom company colors based on the image
  const companyColors = [
    "bg-teal-200", // green/teal
    "bg-orange-200", // orange
    "bg-blue-200", //blue
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header isResidentialPage={true} />
        <div className="container mx-auto px-4 py-20 flex justify-center items-center">
          <div className="text-center w-full max-w-md">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#006452] mx-auto mb-4"></div>
            <p className="text-gray-600 mb-4">Loading comparison data...</p>
            
            {/* Progress indicators */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div className="bg-[#006452] h-2.5 rounded-full w-3/4 animate-pulse"></div>
            </div>
            
            <p className="text-xs text-gray-500">
              This may take a moment. We're loading detailed information about the companies you're comparing.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header isResidentialPage={true} />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center p-4 bg-red-50 rounded">{error}</div>
          <div className="mt-4 text-center">
            <Button
              onClick={() => fetchCompaniesForComparison()}
              className="bg-[#006452] hover:bg-[#005443] text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Replace the existing getHorizontalLineWidth function with this:
  const getHorizontalLineWidth = () => {
    const visibleCount = companies.length;
    const totalWidth = 25 + (visibleCount * 25); 

    // Ensure width doesn't exceed the actual content
    if (visibleCount === 1) {
      return "50%"; 
    } else if (visibleCount === 2) {
      return "75%"; 
        } else {
      return "100%";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="absolute top-0 left-0 w-full bg-transparent z-50">
        <Header isResidentialPage={true} />
      </div>

      <section
        className="relative h-[200px] sm:h-[250px] md:h-[300px] bg-cover bg-center text-white flex items-center justify-center px-4"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(250,250,250,0.85)] to-[rgba(0,100,82,0.85)]"></div>
        <h2 className="z-50 font-inter font-black text-xl sm:text-3xl md:text-5xl leading-tight text-white text-center">
          Compare Companies
        </h2>
      </section>

      <div className="container mx-auto px-4 py-8">
        {companies.length === 0 ? (
          <div className="text-center">
            <div className="p-4 bg-yellow-50 rounded mb-4">
              No companies added to comparison yet.
            </div>
            <Button
              onClick={() => navigate("/residential-space")}
              className="bg-[#006452] hover:bg-[#005443] text-white"
            >
              Browse Companies
            </Button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto p-4">
            {/* Mobile View */}
            <div className="md:hidden">
              <div className="overflow-x-scroll">
                <div className="min-w-[800px]">
                  {/* Header Row */}
                  <div className="grid grid-cols-4 text-center gap-6">
                    <div className="p-4 bg-white font-bold min-w-[200px]"></div>
                    {companies.map(
                      (company, idx) =>
                        visibleCompanies.includes(idx) && (
                          <div
                            key={company._id || idx}
                            className={`p-2 sm:p-4 ${
                              idx === 0
                                ? "bg-teal-400"
                                : idx === 1
                                ? "bg-orange-400"
                                : "bg-blue-400"
                            } flex items-center justify-center h-16 sm:h-20 rounded-md relative min-w-[200px]`}
                          >
                            <button
                              onClick={() => removeCompany(company._id, idx)}
                              className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shadow-lg"
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            </button>
                            {company.logo ? (
                              <LazyImage
                                src={company.logo}
                                alt="Company Logo"
                                className="h-12 sm:h-16 w-auto"
                              />
                            ) : (
                              <span className="text-white font-bold">
                                {company.name}
                              </span>
                            )}
                          </div>
                        )
                    )}
                    {companies.length === 2 && (
                      <div className="min-w-[200px]">
                        <Button
                          onClick={() => navigate("/residential-space")}
                          className="w-full h-16 sm:h-20 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md flex items-center justify-center"
                        >
                          <div className="flex flex-col items-center">
                            <Plus className="h-6 w-6 mb-1" />
                            <span className="text-sm">Add More</span>
                          </div>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Data Rows */}
                  {comparisonMetrics.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="grid grid-cols-4 gap-6 relative"
                    >
                      <div className="p-2 sm:p-4 bg-white font-bold flex items-center justify-start text-xs sm:text-sm md:text-base min-w-[200px]">
                        {row.label}
                      </div>
                      {/* Add horizontal line with fixed width calculation */}
                      {rowIndex !== 0 && (
                        <div
                          className="absolute top-0 left-0"
                          style={{
                            height: "2px",
                            background: "#115e59",
                            width: getHorizontalLineWidth(), // Use the helper function
                            transition: "width 0.3s ease",
                          }}
                        />
                      )}
                      {companies.map(
                        (company, idx) =>
                          visibleCompanies.includes(idx) && (
                            <div
                              key={idx}
                              className={`p-2 sm:p-4 ${
                                idx === 0
                                  ? "bg-teal-200"
                                  : idx === 1
                                  ? "bg-orange-200"
                                  : "bg-blue-200"
                              } flex items-center justify-center font-semibold text-xs sm:text-base min-w-[200px]`}
                            >
                              {row.isImage ? (
                                <div className="w-full h-[200px] sm:h-[280px] md:h-[320px]">
                                  <LazyImage
                                    src={company.bannerImages[0] || company.logo}
                                    alt="Company Banner Image"
                                    className="w-full h-full"
                                  />
                                </div>
                              ) : (
                                <div className="text-xs sm:text-base md:text-lg font-semibold break-words">
                                  {row.render ? 
                                    row.render(getCompanyValue(company, row), company || {}) : 
                                    getCompanyValue(company, row)}
                                </div>
                              )}
                            </div>
                          )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <div className="pb-4">
                <div className="min-w-[768px]">
                  {/* Header Row */}
                  <div className="grid grid-cols-4 text-center gap-[19px]">
                    <div className="p-4 bg-white font-bold"></div>
                    {companies.map(
                      (company, idx) =>
                        visibleCompanies.includes(idx) && (
                          <div
                            key={company._id || idx}
                            className={`p-2 sm:p-4 ${
                              idx === 0
                                ? "bg-teal-400"
                                : idx === 1
                                ? "bg-orange-400"
                                : "bg-blue-400"
                            } flex items-center justify-center h-16 sm:h-20 rounded-md relative`}
                          >
                            <button
                              onClick={() => removeCompany(company._id, idx)}
                              className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shadow-lg"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 sm:h-4 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            {company.logo ? (
                              <LazyImage
                                src={company.logo}
                                alt="Company Logo"
                                className="h-12 sm:h-16 w-auto"
                              />
                            ) : (
                              <span className="text-white font-bold">
                                {company.name}
                              </span>
                            )}
                          </div>
                        )
                    )}
                    {companies.length <= 2 && (
                      <div>
                        <Button
                          onClick={() => navigate("/residential-space")}
                          className="w-full h-16 sm:h-20 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md flex items-center justify-center"
                        >
                          <div className="flex flex-col items-center">
                            <Plus className="h-6 w-6 mb-1" />
                            <span className="text-sm">Add More</span>
                          </div>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Data Rows */}
                  {comparisonMetrics.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-[19px] relative"
                    >
                      <div className="p-2 sm:p-4 bg-white font-bold flex items-center justify-start text-xs sm:text-sm md:text-base">
                        {row.label}
                      </div>
                      {/* Add horizontal line with fixed width calculation */}
                      {rowIndex !== 0 && (
                        <div
                          className="absolute top-0 left-0"
                          style={{
                            height: "1.5px",
                            background: "#115e59",
                            width: getHorizontalLineWidth(), // Use the helper function
                            transition: "width 0.3s ease",
                          }}
                        />
                      )}
                      {companies.map(
                        (company, idx) =>
                          visibleCompanies.includes(idx) && (
                            <div
                              key={idx}
                              className={`p-2 sm:p-4 ${
                                idx === 0
                                  ? "bg-teal-200"
                                  : idx === 1
                                  ? "bg-orange-200"
                                  : "bg-blue-200"
                              } flex items-center justify-center font-semibold text-xs sm:text-base`}
                            >
                              {row.isImage ? (
                                <div className="w-full h-[200px] sm:h-[280px] md:h-[320px]">
                                  <LazyImage
                                    src={company.bannerImages[0] || company.logo}
                                    alt="Company Banner Image"
                                    className="w-full h-full"
                                  />
                                </div>
                              ) : (
                                <div className="text-xs sm:text-base md:text-lg font-semibold break-words">
                                  {row.render ? 
                                    row.render(getCompanyValue(company, row), company || {}) : 
                                    getCompanyValue(company, row)}
                                </div>
                              )}
                            </div>
                          )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile-specific instructions */}
        <div className="md:hidden mt-4 p-3 bg-blue-50 text-blue-800 rounded text-xs sm:text-sm">
          <p>Swipe horizontally to view the full comparison table.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const AddCompanyButton = ({ onClick }) => (
  <div className="flex items-center justify-center h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
    onClick={onClick}>
    <div className="text-center">
      <div className="text-gray-400 mb-2">
        <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <span className="text-gray-500 font-medium">Add Company</span>
    </div>
  </div>
);

export default Compare;