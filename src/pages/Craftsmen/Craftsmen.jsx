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

  // Fetch craftsmen from API
  useEffect(() => {
    const fetchCraftsmen = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/craftsmen`);

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

    fetchCraftsmen();
  }, []);

  // Filter craftsmen based on selected category
  const filteredCraftsmen = Array.isArray(craftsmen) ? craftsmen.filter(craftsman => {
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
          Craftsman
        </motion.h2>
      </motion.section>

      {/* Focus Links (Pass the setSelectedCategory function) */}
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
      {!loading && filteredCraftsmen.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-3">No craftsmen found in the {selectedCategory} category.</p>
        </div>
      )}

      {/* Carousel & Filtered Craftsman Cards */}
      <div className="flex flex-col items-center space-y-8 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        {!loading && filteredCraftsmen.length > 0 && filteredCraftsmen.map(craftsman => (
          <div
            key={craftsman._id || craftsman.id}
            className="w-full flex flex-col md:flex-row items-center justify-center gap-8"
          >
            <div className='w-full md:w-1/2 max-w-[600px]'>
              {/* Improved Portfolio Image Handling */}
              {craftsman.portfolio && Array.isArray(craftsman.portfolio) && craftsman.portfolio.length > 0 ? (
                <div className="carousel-wrapper rounded-lg overflow-hidden shadow-lg">
                  <Carousel customImages={craftsman.portfolio} />
                </div>
              ) : (
                // Default carousel if no portfolio images
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <Carousel />
                </div>
              )}
            </div>
            <div className='w-full md:w-1/2 max-w-[500px]'>
              <CraftsmanProfileCard
                id={craftsman._id || craftsman.id}
                name={craftsman.name}
                rate={craftsman.rate}
                location={<><FontAwesomeIcon icon={faLocationDot} /> {craftsman.location}</>}
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
      </div>

      {/* Logo Grid Section */}
      {/* <div>
        <CardCrousel images={customImages} showOnlyImages={true} largeImage={true} />
      </div> */}
      <DesignersWrapper hideHeadings={true} />

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

export default Craftsmen;