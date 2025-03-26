import React, { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import './MasonryGallery.css'; // We'll create this file next

const MasonryGallery = ({ company }) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleImages, setVisibleImages] = useState(3);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!company) return;
    
    setIsLoading(true);
    // Clear images first to avoid duplicates
    setImages([]);
    
    console.log("Company in MasonryGallery:", company);
    
    // Array to collect all banner images
    const bannerImages = [];
    
    // Handle bannerImages array (from MongoDB)
    if (company.bannerImages && Array.isArray(company.bannerImages)) {
      console.log("Using bannerImages array with", company.bannerImages.length, "images");
      bannerImages.push(...company.bannerImages.filter(img => img));
    } 
    
    // Also check for individual bannerImage properties
    Object.keys(company).forEach((key) => {
      if (key.includes("bannerImage") && company[key] && typeof company[key] === 'string') {
        console.log("Found bannerImage property:", key, company[key]);
        // Only add if not already in the array
        if (!bannerImages.includes(company[key])) {
          bannerImages.push(company[key]);
        }
      }
    });
    
    setImages(bannerImages);
    setIsLoading(false);
    
    // Log final images
    console.log("Final banner images for masonry:", bannerImages);
  }, [company]);

  // Function to show more images
  const handleViewMore = () => {
    setVisibleImages(images.length);
  };

  // Responsive breakpoints for the masonry grid
  const breakpointColumnsObj = {
    default: 4, // Default is 4 columns
    1100: 3,    // 3 columns at 1100px
    700: 2,     // 2 columns at 700px
    500: 1      // 1 column at 500px
  };

  // Get the images to display based on mobile state
  const displayImages = isMobile ? images.slice(0, visibleImages) : images;
  const hasMoreImages = isMobile && images.length > visibleImages;

  return (
    <div className="w-full mb-16 px-4 md:px-8 max-w-[1600px] mx-auto">
      <h2 className="text-4xl font-bold text-center mb-8 mt-12">
        Our Gallery
      </h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#006452]"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl">No gallery images available for this company.</p>
        </div>
      ) : (
        <div className="masonry-gallery-container">
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {displayImages.map((url, index) => (
              <div key={index} className="masonry-item">
                <Zoom>
                  <img
                    src={url}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                    }}
                  />
                </Zoom>
              </div>
            ))}
          </Masonry>
          
          {/* More images indicator and View More button */}
          {hasMoreImages && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-2">
                {images.length - visibleImages} more images available
              </p>
              <button
                onClick={handleViewMore}
                className="bg-[#006452] text-white px-6 py-3 rounded-md hover:bg-[#004d3b] transition-colors shadow-md"
              >
                View All Images
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MasonryGallery; 