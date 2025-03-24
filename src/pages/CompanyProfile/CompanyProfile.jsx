import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/CompanyProfile/Header";
import Description from "../../components/CompanyProfile/Description";
import RollingGallery from "../../components/CompanyProfile/RollingGallery/RollingGallery";
import TestimonialCarousel from "../../components/TestimonialCarousel/TestimonialCarousel";
import CompanyTestimonials from "../../components/TestimonialCarousel/CompanyTestimonials";
import Footer from "../../components/Footer/Footer";
import CardCrousal from "../../components/CardCrousal/CardCrousal";
import banner from "../../assets/banner.png";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

// const API_URL = "https://inty-backend-6wzp.onrender.com/api/companies";
// const API_URL = "https://inty-backend-2.onrender.com/api/companies";
const API_URL = "http://localhost:3000/api/companies";


const CompanyProfile = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [company, setCompany] = useState(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const getCompanyById = async () => {
    try {
      setLoading(true);
      const { data: { companyDetails } } = await axios.get(`${API_URL}/getCompany/${id}`);
      setCompany(companyDetails);
      console.log("Company Details: ", companyDetails);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch company. Please try again later."
      );
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    getCompanyById();
  }, [id]);

  const images = [banner, banner, banner, banner];

  if (loading) return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div className="flex justify-center items-center my-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#006452]"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center my-4 p-4 bg-red-50 rounded">
      {error || "No Such Company Exists !!"}
    </div>
  );

  // Check if the company has its own testimonials
  const hasCompanyTestimonials = company && 
                               company.testimonials && 
                               company.testimonials.length > 0;

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 w-full bg-transparent z-50">
        <Navbar isResidentialPage={true} />
      </div>
      <Header company={company} isEnquiryOpen={isEnquiryOpen} setIsEnquiryOpen={setIsEnquiryOpen} />
      <Description company={company} />
      <RollingGallery company={company} autoplay={true} pauseOnHover={true} />
      
      {/* Display company-specific testimonials if available */}
      {hasCompanyTestimonials && (
        <CompanyTestimonials testimonials={company.testimonials} />
      )}
      <CardCrousal images={images} />
      <Footer />

      {/* Floating Enquire Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsEnquiryOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-[#006452] text-white rounded-full p-4 shadow-lg flex items-center gap-2 hover:bg-[#004d3b] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span>Enquire Now</span>
      </motion.button>
    </div>
  );
};

export default CompanyProfile;