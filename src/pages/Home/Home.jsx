import React, { useState } from "react";
import Hero from "../../components/Hero/Hero";
import Services from "../../components/Services/Services";
import Testimonials from "../../components/Testimonials/Testimonials";
import OurPartners from "../../components/OurPartners/OurPartners";
import Designers from "../../components/Designers/Designers";
import Navbar from "../../components/Navbar/Navbar";
import Features from "../../components/Features/Features";
import Footer from "../../components/Footer/Footer";
import Search from "../../components/Search/Search";
import TestimonialCarousel from "../../components/TestimonialCarousel/TestimonialCarousel";
import InteriorPlatform from "../../components/InteriorPlatform/InteriorPlatform";
import LocationPopup from "../../components/LocationPopup/LocationPopup";
import { useUser } from "@clerk/clerk-react";
import { storeUserFilter } from "../../services/filterStorageService";

const Home = () => {
  const [userLocation, setUserLocation] = useState(localStorage.getItem('userLocation') || '');
  const { user } = useUser();

  const handleLocationSelect = (location, coordinates = null, address = null) => {
    setUserLocation(location);
    
    if (location) {
      localStorage.setItem('userLocation', location);
      
      // If coordinates and address are provided, store them for future use
      if (coordinates && address) {
        console.log("Selected location with coordinates:", coordinates, "and address:", address);
      }
    } else {
      // If location is null or empty, it means the user chose not to use location
      console.log("User chose not to use location as a constraint");
      localStorage.removeItem('userLocation');
      localStorage.removeItem('userLiveLocation');
    }
  };

  const handleHomeSearch = async (filters) => {
    try {
      // Store the filter data for analytics
      await storeUserFilter({
        userId: user?.id || 'anonymous',
        userEmail: user?.emailAddresses?.[0]?.emailAddress || '',
        searchTerm: filters.search || '',
        filters: {
          location: userLocation || '',
          type: filters.spaceType || 'residential', // Default to residential if not specified
          roomType: filters.projectType !== "Project Type" ? filters.projectType : '',
          bhkSize: filters.size !== "Size (sq ft)" ? filters.size : '',
          budget: filters.priceRange !== "Price Range" ? filters.priceRange : '',
          assuredOnly: filters.assuredOnly || false
        },
        pageType: filters.spaceType === 'Commercial' ? 'commercial' : 'residential'
      });
    } catch (error) {
      console.error('Error storing filter data from home page:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <LocationPopup onLocationSelect={handleLocationSelect} />
      <InteriorPlatform />
      <Search onSearch={handleHomeSearch} />
      <Hero />
      <Features />
      <Designers />
      {/* <OurPartners /> */}
      <TestimonialCarousel />
      <Footer />
    </div>
  );
};

export default Home;