import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import backgroundImage from "../../assets/background.png";

// Set the base URL for API requests
const API_URL = "https://inty-backend.onrender.com"; // Update this with your actual server URL
axios.defaults.baseURL = API_URL;

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get('/api/blogs');
        console.log('API Response:', response.data);

        if (Array.isArray(response.data)) {
          setBlogs(response.data);
        } else {
          console.error("API returned non-array:", response.data);
          setError("Invalid data format from API.");
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError(error.message || "Failed to fetch blogs.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="absolute top-0 left-0 w-full bg-transparent z-50">
          <Header />
        </div>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006452]"></div>
          <p className="ml-3">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="absolute top-0 left-0 w-full bg-transparent z-50">
          <Header />
        </div>
        <div className="flex justify-center items-center h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
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
          Our Blog
        </motion.h2>
      </motion.section>

      <section className="py-8 md:py-12 px-4 md:px-6 lg:px-24">
        <div className="container mx-auto">
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No blog posts available yet.</p>
              <a 
                href="/add-blog" 
                className="mt-4 inline-block px-6 py-2 bg-[#006452] text-white rounded-lg shadow-md hover:bg-[#005443]"
              >
                Add Your First Blog Post
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <div 
                  key={blog._id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                  onClick={() => handleBlogClick(blog._id)}
                >
                  <div className="relative">
                    <img
                      src={blog.image} // Cloudinary URL
                      alt={blog.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/placeholder.jpg"; // Fallback image
                      }}
                    />
                    <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-[#006452]">{blog.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{blog.description}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-500 text-xs">
                        {new Date(blog.timestamp).toLocaleDateString()}
                      </p>
                      <span className="text-[#006452] text-sm font-medium">Read more →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPage;