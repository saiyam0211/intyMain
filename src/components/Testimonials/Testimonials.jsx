import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'https://inty-backend.onrender.com/api';

export default function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/testimonials/active`);
        
        // Sort by order field
        const sortedData = data.sort((a, b) => a.order - b.order);
        setTestimonials(sortedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
        setLoading(false);
      }
    };
    
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [index, testimonials.length]);

  const nextSlide = () => {
    if (testimonials.length <= 1) return;
    setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    if (testimonials.length <= 1) return;
    setIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <section className="py-12 px-6 md:px-12 lg:px-24 text-center">
        <h3 className="text-[#006452] text-lg font-semibold">Testimonials</h3>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">What Our Clients Say</h2>
        <div className="h-64 flex justify-center items-center">
          <p className="text-gray-500">Loading testimonials...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 px-6 md:px-12 lg:px-24 text-center">
        <h3 className="text-[#006452] text-lg font-semibold">Testimonials</h3>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">What Our Clients Say</h2>
        <div className="h-64 flex justify-center items-center">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  // Don't show the section if there are no testimonials
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-6 md:px-12 lg:px-24 text-center">
      <h3 className="text-[#006452] text-lg font-semibold">Testimonials</h3>
      <h2 className="text-3xl md:text-4xl font-bold mt-2">What Our Clients Say</h2>
     
      <div className="relative w-full mx-auto mt-10 overflow-hidden">
        <div className="flex justify-center items-center space-x-4">
          {/* Previous Testimonial */}
          {testimonials.length > 1 && (
            <motion.div
              key={`prev-${index}`}
              className="w-2/3 p-4 rounded-2xl shadow-lg opacity-30 transition-all duration-500 hidden md:block"
              initial={{ opacity: 0.3, x: -50 }}
              animate={{ opacity: 0.3, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TestimonialCard data={testimonials[(index - 1 + testimonials.length) % testimonials.length]} />
            </motion.div>
          )}

          {/* Active Testimonial */}
          <motion.div
            key={testimonials[index]?._id}
            className="w-full md:w-2/3 bg-white p-6 rounded-2xl shadow-xl transition-all"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <TestimonialCard data={testimonials[index]} />
          </motion.div>

          {/* Next Testimonial */}
          {testimonials.length > 1 && (
            <motion.div
              key={`next-${index}`}
              className="w-2/3 p-4 rounded-2xl shadow-lg opacity-30 transition-all duration-500 hidden md:block"
              initial={{ opacity: 0.3, x: 50 }}
              animate={{ opacity: 0.3, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TestimonialCard data={testimonials[(index + 1) % testimonials.length]} />
            </motion.div>
          )}
        </div>

        {/* Navigation Buttons */}
        {testimonials.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-200 p-3 rounded-full shadow-md hover:bg-gray-300"
            >
              <FaChevronLeft className="text-gray-700" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-200 p-3 rounded-full shadow-md hover:bg-gray-300"
            >
              <FaChevronRight className="text-gray-700" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

// Testimonial Card Component
const TestimonialCard = ({ data }) => (
  <div className="flex items-center space-x-6">
    <img 
      src={data.image} 
      alt={data.name} 
      className="w-20 h-20 rounded-lg object-cover" 
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '/images/placeholder.png';
      }}
    />
    <div className="flex-1">
      <p className="text-gray-700 text-sm">{data.quote}</p>
      <h3 className="text-gray-900 font-bold mt-3">{data.name}</h3>
      <p className="text-gray-500 text-sm">{data.position}</p>
    </div>
    <FaQuoteLeft className="text-teal-500 text-3xl font-bold" />
  </div>
);