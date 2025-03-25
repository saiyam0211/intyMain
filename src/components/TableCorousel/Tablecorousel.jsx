import React, { useState } from 'react';
import chair from "../../assets/chair.png";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const TableCorousel = ({ customImages = [] }) => {
   // Default images in case none are provided
   const defaultImages = [
     chair,
     chair,
     chair,
   ];

   // Use provided images or default ones
   const carouselImages = customImages.length > 0 ? customImages : defaultImages;
   const [currentIndex, setCurrentIndex] = useState(0);

   const nextImage = () => {
     setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
   };

   const prevImage = () => {
     setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselImages.length) % carouselImages.length);
   };

   // Only render carousel if there are images
   if (carouselImages.length === 0) {
     return null;
   }

   return (
     <div className="relative w-full h-full">
       <div className="relative flex justify-center items-center h-full">
         {/* Previous button - only show if more than one image */}
         {carouselImages.length > 1 && (
           <button
             className="absolute left-2 sm:left-2 text-white bg-zinc-600 bg-opacity-50 p-2 rounded-full z-10"
             onClick={prevImage}
           >
             <FaChevronLeft size={10} />
           </button>
         )}
         
         <img
           src={carouselImages[currentIndex]}
           alt={`Portfolio Image ${currentIndex + 1}`}
           className="w-full h-full object-cover"
           style={{ height: '100%', objectFit: 'cover' }}
         />
         
         {/* Next button - only show if more than one image */}
         {carouselImages.length > 1 && (
           <button
             className="absolute right-2 sm:right-2 text-white bg-zinc-600 bg-opacity-50 p-2 rounded-full z-10"
             onClick={nextImage}
           >
             <FaChevronRight size={10} />
           </button>
         )}

         {/* Dots for carousel - only show if more than one image */}
         {carouselImages.length > 1 && (
           <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center gap-1 sm:gap-2">
             {carouselImages.map((_, index) => (
               <div
                 key={index}
                 onClick={() => setCurrentIndex(index)}
                 className={`w-2 sm:w-3 h-2 sm:h-1 rounded-full cursor-pointer transition-all duration-300 ${
                   currentIndex === index ? 'bg-black' : 'bg-gray-400'
                 }`}
               ></div>
             ))}
           </div>
         )}
       </div>
     </div>
   );
};

export const CompanyImagesCarousel = ({ company }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Updated function to collect all banner images
  const getBannerImages = () => {
    const images = [];
    
    // Check for bannerImages array first
    if (company?.bannerImages && Array.isArray(company.bannerImages)) {
      images.push(...company.bannerImages.filter(img => img));
    }
    
    // Check for individual bannerImage fields (checking up to 10 to ensure we get all)
    for (let i = 1; i <= 10; i++) {
      const fieldName = `bannerImage${i}`;
      if (company?.[fieldName]) {
        console.log(`Found ${fieldName}:`, company[fieldName]); // Debug log
        images.push(company[fieldName]);
      }
    }
    
    // Add logo as fallback if no banner images
    if (images.length === 0 && company?.logo) {
      images.push(company.logo);
    }
    
    // If still no images, use default
    if (images.length === 0) {
      images.push(chair);
    }
    
    // Remove any duplicates and null/undefined values
    const uniqueImages = [...new Set(images.filter(img => img))];
    console.log('Total unique images found:', uniqueImages.length); // Debug log
    return uniqueImages;
  };

  const carouselImages = getBannerImages();

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselImages.length) % carouselImages.length);
  };

  // Debug log for current image
  console.log('Current image:', carouselImages[currentIndex]);

  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      <div className="relative flex justify-center items-center">
        {/* Previous button */}
        {carouselImages.length > 1 && (
          <button
            className="absolute left-2 sm:left-2 text-white bg-zinc-600 bg-opacity-50 p-2 rounded-full z-10 hover:bg-opacity-70 transition-all duration-300"
            onClick={prevImage}
            type="button"
          >
            <FaChevronLeft size={16} />
          </button>
        )}
        
        {/* Image display */}
        <div className="w-full h-full">
          <img
            src={carouselImages[currentIndex]}
            alt={`Banner Image ${currentIndex + 1}`}
            className="w-full md:h-[313px] sm:h-80 object-contain s:rounded-t-md md:rounded-l-md lg:rounded-l-md"
            onError={(e) => {
              console.log('Image load failed, using fallback'); // Debug log
              e.target.src = chair;
              e.target.onerror = null;
            }}
          />
        </div>
        
        {/* Next button */}
        {carouselImages.length > 1 && (
          <button
            className="absolute right-2 sm:right-2 text-white bg-zinc-600 bg-opacity-50 p-2 rounded-full z-10 hover:bg-opacity-70 transition-all duration-300"
            onClick={nextImage}
            type="button"
          >
            <FaChevronRight size={16} />
          </button>
        )}

        {/* Navigation dots */}
        {carouselImages.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center gap-1 sm:gap-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 sm:w-3 h-2 sm:h-1 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'bg-white w-4 sm:w-5' 
                    : 'bg-gray-400'
                }`}
                type="button"
              />
            ))}
          </div>
        )}
      </div>

      {/* Image counter */}
      {carouselImages.length > 1 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
          {currentIndex + 1} / {carouselImages.length}
        </div>
      )}
    </div>
  );
};

export default TableCorousel;