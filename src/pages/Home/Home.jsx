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

const Home = () => {
  const [userLocation, setUserLocation] = useState(localStorage.getItem('userLocation') || '');

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

  return (
    <div>
      <Navbar />
      <LocationPopup onLocationSelect={handleLocationSelect} />
      <InteriorPlatform />
      <Search />
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