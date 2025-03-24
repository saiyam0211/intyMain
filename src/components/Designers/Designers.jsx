import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API_URL = "http://localhost:3000/api";

// Add only background images as hardcoded
const backgroundImages = [
  "/images/desiger1.png",
  "/images/desiger2.png",
  "/images/desiger3.png",
  "/images/desiger4.png",
  "/images/desiger5.png",
  "/images/desiger6.png"
];

const Designers = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carouselRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const itemWidth = 280;  // Width of each item in the carousel

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/companies`, {
        params: {
          limit: 100,
          page: 1,
          showAll: true
        }
      });
      
      let companiesData = [];
      if (response.data && Array.isArray(response.data)) {
        companiesData = response.data;
      } else if (response.data && Array.isArray(response.data.companies)) {
        companiesData = response.data.companies;
      } else if (response.data && response.data.companyDetails) {
        companiesData = [response.data.companyDetails];
      } else {
        throw new Error('Unexpected data format received');
      }

      const validCompanies = companiesData
        .filter(company => 
          company && 
          company.name &&
          company.projects &&
          company.experience &&
          company.branches &&
          company.logo // Make sure logo exists
        )
        .sort((a, b) => b.projects - a.projects)
        .map((company, index) => ({
          ...company,
          // Only add background image, use company's own logo
          backgroundImage: backgroundImages[index % backgroundImages.length]
        }));

      setCompanies(validCompanies);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate how many copies we need to fill the viewport
  const getCarouselItems = () => {
    if (companies.length === 0) return [];
    
    // Create enough copies to fill the viewport and allow smooth infinite scrolling
    const copies = Math.ceil(window.innerWidth / itemWidth) + 2;
    const items = [];
    
    // Create the required number of copies
    for (let i = 0; i < copies; i++) {
      items.push(...companies);
    }
    
    return items;
  };

  const moveCarousel = (direction) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const totalItems = companies.length;
    let newIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % totalItems;
    } else {
      newIndex = (currentIndex - 1 + totalItems) % totalItems;
    }

    setCurrentIndex(newIndex);

    // Reset position when reaching the end of the set
    if (newIndex === 0 && direction === 'next') {
      setTimeout(() => {
        carouselRef.current.style.transition = 'none';
        setCurrentIndex(0);
        // Force a reflow
        carouselRef.current.offsetHeight;
        carouselRef.current.style.transition = 'transform 0.5s ease-in-out';
      }, 500);
    }

    if (newIndex === totalItems - 1 && direction === 'prev') {
      setTimeout(() => {
        carouselRef.current.style.transition = 'none';
        setCurrentIndex(totalItems - 1);
        // Force a reflow
        carouselRef.current.offsetHeight;
        carouselRef.current.style.transition = 'transform 0.5s ease-in-out';
      }, 500);
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  // Update the carousel position effect
  useEffect(() => {
    if (!carouselRef.current || companies.length === 0) return;

    const updateCarouselPosition = () => {
      const offset = -(currentIndex * itemWidth);
      carouselRef.current.style.transform = `translateX(${offset}px)`;
    };

    carouselRef.current.style.transition = isAnimating ? 'transform 0.5s ease-in-out' : 'none';
    updateCarouselPosition();
  }, [currentIndex, isAnimating, itemWidth, companies.length]);

  // Add resize handler
  useEffect(() => {
    const handleResize = () => {
      if (carouselRef.current) {
        carouselRef.current.style.transition = 'none';
        const offset = -(currentIndex * itemWidth);
        carouselRef.current.style.transform = `translateX(${offset}px)`;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, itemWidth]);

  if (companies.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p>No companies available</p>
        )}
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <section className="py-8 md:py-12 px-4 md:px-6 lg:px-24 text-center">
      <style jsx>{`
        .reveal-content > div {
          transform: translateY(50px);
          opacity: 0;
          transition: transform 0.5s ease, opacity 0.5s ease;
        }

        .active .reveal-content > div,
        .group:hover .reveal-content > div {
          transform: translateY(0);
          opacity: 1;
        }

        .reveal-content > div:nth-child(1) {
          transition-delay: 0.1s;
        }

        .reveal-content > div:nth-child(2) {
          transition-delay: 0.2s;
        }

        .reveal-content > div:nth-child(3) {
          transition-delay: 0.3s;
        }

        .inactive .reveal-content > div {
          transform: translateY(-50px);
          opacity: 0;
          transition: transform 0.5s ease, opacity 0.5s ease;
        }

        .inactive .reveal-content > div:nth-child(1) {
          transition-delay: 0.3s;
        }

        .inactive .reveal-content > div:nth-child(2) {
          transition-delay: 0.2s;
        }

        .inactive .reveal-content > div:nth-child(3) {
          transition-delay: 0.1s;
        }

        .carousel-container {
          position: relative;
          max-width: 100%;
          overflow: hidden;
          margin: 0 auto;
        }

        .carousel-track {
          display: flex;
          transition: transform 0.5s ease;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="container mx-auto">
        <h3 className="text-[#006452] text-base md:text-lg font-semibold">Popular Companies</h3>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2 mb-8">Our Most Rated Interior Design Companies</h2>

        {/* Desktop View - Infinite Carousel */}
        <div className="hidden sm:block relative">
          <div className="carousel-container">
            <div
              ref={carouselRef}
              className="carousel-track"
              style={{
                display: 'flex',
                gap: '16px',
                padding: '0 16px',
                width: 'fit-content',
                willChange: 'transform'
              }}
            >
              {getCarouselItems().map((company, index) => (
                <div
                  key={`${company._id}-${index}`}
                  className={`relative group overflow-hidden h-64 sm:h-72 md:h-80 md:w-55 sm:w-72 flex-shrink-0 cursor-pointer rounded-md shadow-sm hover:shadow-md transition-all duration-300 ${activeIndex === index % companies.length ? 'active' : ''}`}
                  onClick={() => setActiveIndex(index % companies.length)}
                  onMouseLeave={() => setActiveIndex(prev => prev === index % companies.length ? null : prev)}
                >
                  <img
                    src={company.backgroundImage}
                    alt={company.name}
                    className={`mt-1 w-full h-full object-cover transition-all duration-500 ${activeIndex === index % companies.length ? 'blur-md' : 'group-hover:blur-md'}`}
                  />
                  <div className={`absolute inset-x-0 bottom-0 bg-white/80 py-3 md:py-4 flex justify-center transition-all duration-500 ${activeIndex === index % companies.length ? 'bottom-[calc(100%-73px)]' : 'group-hover:bottom-[calc(100%-73px)]'}`}>
                    <img
                      src={company.logo} // Use company logo from database
                      alt={`${company.name} logo`}
                      className="w-24 h-12 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/company-placeholder.png'; // Add a placeholder image
                      }}
                    />
                  </div>
                  <div className={`absolute inset-0 flex items-center justify-center px-4 transition-opacity duration-300 delay-150 overflow-hidden ${activeIndex === index % companies.length ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="text-gray-950 w-full p-4 flex flex-col gap-3 reveal-content">
                      <div className="flex flex-col text-center">
                        <p className="text-lg font-bold">
                          {company.projects}+
                        </p>
                        <p className="text-xs">
                          Projects Completed
                        </p>
                      </div>
                      <div className="flex-col text-center">
                        <p className="text-lg font-bold">
                          {company.experience}+
                        </p>
                        <p className="text-xs">
                          Years Experience
                        </p>
                      </div>
                      <div className="flex-col text-center">
                        <p className="text-lg font-bold">
                          {company.branches}+
                        </p>
                        <p className="text-xs">
                          Branches
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => moveCarousel('prev')}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow-md z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-[#006452]" />
            </button>

            <button
              onClick={() => moveCarousel('next')}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow-md z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-[#006452]" />
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {companies.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex % companies.length ? 'bg-[#006452] w-4' : 'bg-gray-300'
                }`}
                onClick={() => {
                  if (!isAnimating) {
                    setCurrentIndex(index);
                  }
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden">
          <div className="overflow-x-auto pb-6 scrollbar-hide">
            <div className="flex gap-4 min-w-max px-2">
              {companies.map((company, index) => (
                <div
                  key={index}
                  className={`mt-1 relative group overflow-hidden h-80 w-64 rounded-lg shadow-md transition-all duration-300 ${activeIndex === index ? 'active ring-2 ring-[#006452]' : activeIndex === null ? '' : 'inactive'}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <img
                    src={company.backgroundImage}
                    alt={company.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${activeIndex === index ? 'blur-sm' : ''}`}
                  />
                  <div className={`absolute inset-x-0 bottom-0 bg-white/80 py-3 flex justify-center transition-all duration-700 ${activeIndex === index ? 'bottom-[calc(100%-73px)]' : ''}`}>
                    <img
                      src={company.logo} // Use company logo from database
                      alt={`${company.name} logo`}
                      className="w-24 h-12 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/company-placeholder.png'; // Add a placeholder image
                      }}
                    />
                  </div>
                  <div className={`absolute inset-0 flex items-center justify-center px-2 pt-10 transition-opacity duration-300 ${activeIndex === index ? "opacity-100" : "opacity-0"}`}>
                    <div className="text-gray-950 w-[95%] p-3 flex flex-col gap-2 reveal-content">
                      <div className="flex flex-col text-center">
                        <p className="text-base font-bold">{company.projects}+</p>
                        <p className="text-[10px]">Projects Completed</p>
                      </div>
                      <div className="flex-col text-center">
                        <p className="text-base font-bold">{company.experience}+</p>
                        <p className="text-[10px]">Years Experience</p>
                      </div>
                      <div className="flex-col text-center">
                        <p className="text-base font-bold">{company.branches}+</p>
                        <p className="text-[10px]">Branches</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {companies.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${activeIndex === index ? 'bg-[#006452]' : 'bg-gray-300'}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Designers;