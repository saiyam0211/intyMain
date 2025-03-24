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

  // Fetch designers from API
  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/designers`);

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

    fetchDesigners();
  }, []);

  // Filter Profiles based on selected focus category
  const filteredDesigners = Array.isArray(designers) ? designers.filter(designer => {
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
      {/* Header Section */}
      <div className="absolute top-0 left-0 w-full bg-transparent z-50">
        <Header />
      </div>

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

      {/* Focus Links */}
      <div className="m-12 px-4">
        <TrueFocus sentence="Basic Standard Premium Luxury" onCategorySelect={setSelectedCategory} />
      </div>

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
      <div className="flex flex-col space-y-8 px-4 md:px-8 lg:px-16">
        {!loading && filteredDesigners.length > 0 && filteredDesigners.map(designer => (
          <div
            key={designer._id || designer.id}
            className="w-full flex flex-col md:flex-row justify-center items-center"
          >
            <div className='w-full max-w-[600px]'>
              {/* Improved Portfolio Image Handling */}
              {designer.portfolio && Array.isArray(designer.portfolio) && designer.portfolio.length > 0 ? (
                <div className="carousel-wrapper">
                  <Carousel customImages={designer.portfolio} />
                </div>
              ) : (
                // Default carousel if no portfolio images
                <Carousel />
              )}
            </div>
            <div className='w-full max-w-[500px]'>
              <ProfileCard
                id={designer._id || designer.id}
                name={designer.name}
                rate={designer.rate}
                location={<><FontAwesomeIcon icon={faLocationDot} /> {designer.location}</>}
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
      </div>
      {/* Logo Grid Section */}
      {/* <div className="mt-12">
        <CardCrousel images={customImages} showOnlyImages={true} largeImage={true} />
      </div> */}
      <DesignersWrapper hideHeadings={true} />

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

export default InteriorDesigner;