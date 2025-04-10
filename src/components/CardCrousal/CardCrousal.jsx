import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import googlereview from "/images/google-icon.png";
import { apiClient } from "../../services/apiService"; // Import our apiClient
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const CarouselCard = ({ data, position, image, showOnlyImages, largeImage }) => {
  const navigate = useNavigate();

  // Function to apply Cloudinary background removal to image URLs
  const getLogoWithoutBackground = (imageUrl) => {
    if (!imageUrl) return "";
    
    // Check if it's a Cloudinary URL
    if (imageUrl.includes('cloudinary.com')) {
      try {
        // Split and join approach for reliable URL transformation
        const parts = imageUrl.split('/upload/');
        if (parts.length === 2) {
          // Apply background removal effect
          return parts[0] + '/upload/e_bgremoval/' + parts[1];
        }
      } catch (err) {
        console.error('Error applying background removal:', err);
      }
    }
    return imageUrl;
  };

  const getCardStyles = () => {
    switch (position) {
      case "center":
        return "translate-x-0 scale-100 opacity-100 z-10";
      case "left":
        return "-translate-x-[95%] scale-90 opacity-70 z-0";
      case "right":
        return "translate-x-[95%] scale-90 opacity-70 z-0";
      case "farLeft":
        return "-translate-x-[190%] scale-85 opacity-40 z-0";
      case "farRight":
        return "translate-x-[190%] scale-85 opacity-40 z-0";
      default:
        return "translate-x-0 opacity-0";
    }
  };

  const getStarRating = () => {
    const rating = Math.min(5, Math.max(1, Math.round(data.reviews / 10))); // Example logic
    return rating;
  };

  // Process the image to remove background
  const processedLogoImage = getLogoWithoutBackground(image);

  return (
    <div className={`absolute transition-all duration-700 ease-in-out transform ${getCardStyles()}`}>
      <div className="bg-white rounded-lg shadow-lg p-4 w-72 mx-3">
        {showOnlyImages ? (
          <div className="flex justify-center mb-4 bg-white">
            <img 
              src={processedLogoImage} 
              alt="Interior Company Logo" 
              className={`h-35 ${largeImage ? 'md:h-20' : ''} object-contain`}
              onError={(e) => {
                console.error("Error loading logo with background removal");
                e.target.onerror = null;
                e.target.src = image; // Fallback to original image if transformation fails
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-1">
                <img src={googlereview} alt="Google Icon" className="w-10" />
                  <span className="text-sm text-gray-600">{data.googleReviews} Reviews</span>
                  <div className="flex items-center gap-1">
                    {[...Array(getStarRating())].map((_, index) => (
                      <Star key={index} className="w-2 h-2 text-orange-500" fill="currentColor" />
                    ))}
                  </div>
              </div>
            </div>

            <div className="flex justify-center mb-4 bg-white">
              <img 
                src={processedLogoImage} 
                alt="Interior Company Logo" 
                className="h-10 object-contain"
                onError={(e) => {
                  console.error("Error loading logo with background removal");
                  e.target.onerror = null;
                  e.target.src = image; // Fallback to original image if transformation fails
                }}
              />
            </div>

            <div className="bg-[#006452] p-4 rounded-lg">
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-white">{data.projects}+</span>
                </div>
                <span className="text-sm text-white">Projects Completed</span>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-white">
                  {(() => {
                    // Calculate years of experience based on establishment year if available
                    if (data.establishmentYear) {
                      const currentYear = new Date().getFullYear();
                      const yearsOfExperience = currentYear - parseInt(data.establishmentYear);
                      return `${yearsOfExperience}`;
                    }
                    
                    // If we have experience but it looks like an establishment year (greater than 1900)
                    if (data?.experience && parseInt(data.experience) > 1900) {
                      const currentYear = new Date().getFullYear();
                      const yearsOfExperience = currentYear - parseInt(data.experience);
                      return `${yearsOfExperience}`;
                    }
                    
                    // Fall back to existing values if available
                    return data.yearsOfExperience || data.experience || '0';
                  })()}+
                </div>
                <span className="text-sm text-white">Years of Experience</span>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-white">{data.branches}+</div>
                <span className="text-sm text-white">Branches</span>
              </div>

              <button className="mt-1 p-2 cursor-pointer bg-white w-full rounded-4xl text-blue-500" onClick={() => {
                navigate(`/CompanyProfile/${data._id}`)
              }}>
                Know More
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Carousel = ({ images, showOnlyImages = false, largeImage = false }) => {

  // Remove direct API_URL and use apiClient instead which handles CORS
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  // Helper function for background removal in both views
  const getLogoWithoutBackground = (imageUrl) => {
    if (!imageUrl) return "";
    
    // Check if it's a Cloudinary URL
    if (imageUrl.includes('cloudinary.com')) {
      try {
        // Split and join approach for reliable URL transformation
        const parts = imageUrl.split('/upload/');
        if (parts.length === 2) {
          // Apply background removal effect
          return parts[0] + '/upload/e_bgremoval/' + parts[1];
        }
      } catch (err) {
        console.error('Error applying background removal:', err);
      }
    }
    return imageUrl;
  };

  const fetchCompanies = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "Fetching companies with page:", page, "and search:", search
      );

      // Use apiClient with the correct endpoint path
      const response = await apiClient.get('companies', {
        params: {
          page,
          limit: 10,
          search,
        },
      });

      console.log("API Response:", response.data); // Debug log

      if (response.data && Array.isArray(response.data.companies)) {
        setCompanies(response.data.companies);
        setCurrentPage(response.data.currentPage);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch companies. Please try again later."
      );
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const getCardPosition = (index) => {
    const total = companies?.length;
    const diff = (index - currentIndex + total) % total;

    if (diff === 0) return "center";
    if (diff === 1) return "right";
    if (diff === total - 1) return "left";
    if (diff === 2) return "farRight";
    if (diff === total - 2) return "farLeft";
    return "hidden";
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % companies?.length);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + companies?.length) % companies?.length);
    setTimeout(() => setIsAnimating(false), 700);
  };

  // Touch handlers for swipe functionality
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50) {
      // Swipe left
      handleNext();
    }
    if (touchEndX - touchStartX > 50) {
      // Swipe right
      handlePrevious();
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
          Other Similar Companies
        </h2>
        <div className="w-24 h-1 bg-[#006452] mx-auto mt-4"></div>
      </div>

      {!isSignedIn ? (
        <div className="mt-12 mb-8 bg-gradient-to-r from-[#006452] to-[#00836b] rounded-lg shadow-xl p-4 sm:p-8 text-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="bg-white p-3 sm:p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 sm:w-10 h-8 sm:h-10 text-[#006452]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">
              Login to explore more companies
            </h3>
            <p className="text-white/90 mb-4 sm:mb-6 max-w-lg text-sm sm:text-base">
              Create a free account to view similar companies and access advanced comparison features.
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
      ) : (
        <>
          <div 
            className="flex md:hidden items-center justify-center overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center w-[100%] m-auto gap-8 overflow-x-hidden">
              <button
                onClick={handlePrevious}
                disabled={isAnimating}
                className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-black/30 hover:bg-black/40 transition-colors group z-10"
              >
                <ChevronLeft className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              </button>

              <div className="relative w-full h-[600px] overflow-x-hidden">
                <div className="absolute inset-0 flex items-center w-full justify-center gap-6">
                  {companies?.map((card, index) => {
                    if (card.show) return (
                      <CarouselCard 
                        key={card._id} 
                        data={card} 
                        position={getCardPosition(index)} 
                        image={card.logo} 
                        showOnlyImages={showOnlyImages} 
                        largeImage={largeImage} 
                      />
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={isAnimating}
                className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-black/30 hover:bg-black/40 transition-colors group z-10"
              >
                <ChevronRight className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
          
          {/* Desktop view - horizontal scrollable cards */}
          <div className="hidden md:block relative px-8 mx-auto max-w-7xl">
            <button
              onClick={handlePrevious}
              disabled={isAnimating}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-black/30 hover:bg-black/40 transition-colors group z-10"
            >
              <ChevronLeft className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </button>
            
            <div className="overflow-hidden px-8">
              <div className="flex gap-6 transition-transform duration-700" 
                 style={{ transform: `translateX(-${currentIndex * (300 + 24)}px)` }}>
                {companies?.map((card, index) => {
                  if (card.show) return (
                    <div key={card._id} className="flex-shrink-0 w-[300px]">
                      <div className="bg-white rounded-lg shadow-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-1">
                            <img src={googlereview} alt="Google Icon" className="w-10" />
                            <span className="text-sm text-gray-600">{card.googleReviews} Reviews</span>
                            <div className="flex items-center gap-1">
                              {[...Array(Math.min(5, Math.max(1, Math.round(card.reviews / 10))))].map((_, idx) => (
                                <Star key={idx} className="w-2 h-2 text-orange-500" fill="currentColor" />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center mb-4 bg-white">
                          <img 
                            src={getLogoWithoutBackground(card.logo)} 
                            alt="Interior Company Logo" 
                            className="h-12 object-contain"
                            onError={(e) => {
                              console.error("Error loading logo with background removal");
                              e.target.onerror = null;
                              e.target.src = card.logo;
                            }}
                          />
                        </div>

                        <div className="bg-[#006452] p-4 rounded-lg">
                          <div className="mb-4">
                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-bold text-white">{card.projects}+</span>
                            </div>
                            <span className="text-sm text-white">Projects Completed</span>
                          </div>

                          <div className="mb-4">
                            <div className="text-2xl font-bold text-white">
                              {(() => {
                                // Calculate years of experience based on establishment year if available
                                if (card.establishmentYear) {
                                  const currentYear = new Date().getFullYear();
                                  const yearsOfExperience = currentYear - parseInt(card.establishmentYear);
                                  return `${yearsOfExperience}`;
                                }
                                
                                // If we have experience but it looks like an establishment year (greater than 1900)
                                if (card?.experience && parseInt(card.experience) > 1900) {
                                  const currentYear = new Date().getFullYear();
                                  const yearsOfExperience = currentYear - parseInt(card.experience);
                                  return `${yearsOfExperience}`;
                                }
                                
                                // Fall back to existing values if available
                                return card.yearsOfExperience || card.experience || '0';
                              })()}+
                            </div>
                            <span className="text-sm text-white">Years of Experience</span>
                          </div>

                          <div className="mb-4">
                            <div className="text-2xl font-bold text-white">{card.branches}+</div>
                            <span className="text-sm text-white">Branches</span>
                          </div>

                          <button className="mt-1 p-2 cursor-pointer bg-white w-full rounded-4xl text-blue-500" onClick={() => {
                            navigate(`/CompanyProfile/${card._id}`)
                          }}>
                            Know More
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                  return null;
                })}
              </div>
            </div>
            
            <button
              onClick={handleNext}
              disabled={isAnimating}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-black/30 hover:bg-black/40 transition-colors group z-10"
            >
              <ChevronRight className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          {/* Pagination dots for mobile */}
          <div className="flex justify-center mt-4 md:hidden">
            {companies?.filter(card => card.show)?.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isAnimating) return;
                  setIsAnimating(true);
                  setCurrentIndex(index);
                  setTimeout(() => setIsAnimating(false), 700);
                }}
                className={`w-2 h-2 mx-1 rounded-full transition-all ${
                  index === currentIndex ? "bg-[#006452] w-3 h-3" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;