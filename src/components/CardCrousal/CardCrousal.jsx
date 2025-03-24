import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import googlereview from "/images/google-icon.png";
import axios from "axios"
import { useNavigate } from "react-router-dom";

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
        return "translate-x-0 scale-105 opacity-100 z-10";
      case "left":
        return "-translate-x-[120%] scale-95 opacity-60 z-0";
      case "right":
        return "translate-x-[120%] scale-95 opacity-60 z-0";
      case "farLeft":
        return "-translate-x-[240%] scale-90 opacity-30 z-0";
      case "farRight":
        return "translate-x-[240%] scale-90 opacity-30 z-0";
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
                <div className="text-2xl font-bold text-white">{data.experience}+</div>
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

  const API_URL = "/api/companies";
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCompanies = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "Fetching from:",
        `${API_URL}?page=${page}&limit=${10}&search=${search}`
      ); // Debug log

      const response = await axios.get(API_URL, {
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

  return (
    <div className="py-8 md:py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
          Other Similar Companies
        </h2>
        <div className="w-24 h-1 bg-[#006452] mx-auto mt-4"></div>
      </div>

      <div className="flex items-center justify-center md:h-[460px] md:-translate-y-20">
        <div className="flex items-center w-[100%] md:w-[90%] m-auto gap-8">
          <button
            onClick={handlePrevious}
            disabled={isAnimating}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-black/30 hover:bg-black/40 transition-colors group z-10"
          >
            <ChevronLeft className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </button>

          <div className="relative w-full h-[600px] overflow-hidden">
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
            className="flex items-center justify-center w-12 h-12 rounded-full bg-black/30 hover:bg-black/40 transition-colors group z-10"
          >
            <ChevronRight className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;