import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from "framer-motion";
import Header from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import backgroundImage from "../../assets/background.png";

// Set the base URL for API requests
const API_URL = "http://localhost:3000"; // Update with your actual server URL
axios.defaults.baseURL = API_URL;

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/blogs/${id}`);
        console.log('API Response:', response.data);
        setBlog(response.data);
      } catch (err) {
        console.error('Error fetching blog details:', err);
        setError(err.message || "Failed to fetch blog details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="absolute top-0 left-0 w-full bg-transparent z-50">
          <Header />
        </div>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006452]"></div>
          <p className="ml-3">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white">
        <div className="absolute top-0 left-0 w-full bg-transparent z-50">
          <Header />
        </div>
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mb-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error || "Blog post not found"}</span>
          </div>
          <button 
            onClick={() => navigate('/blog')}
            className="bg-[#006452] text-white px-4 py-2 rounded hover:bg-[#005443]"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="absolute top-0 left-0 w-full bg-transparent z-50">
        <Header />
      </div>

      {/* Add padding for header */}
      <div className="pt-20"></div>

      {/* Hero Section with Blog Image */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[500px] bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${blog.image || backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="z-50 font-inter font-bold text-3xl md:text-5xl text-white mb-2"
          >
            {blog.title}
          </motion.h2>
          <p className="text-white text-sm md:text-base opacity-80">
            {new Date(blog.timestamp).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </motion.section>

      <section className="py-8 md:py-12 px-4 md:px-6 lg:px-0">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            {/* Back button */}
            <button 
              onClick={() => navigate('/blog')}
              className="flex items-center text-[#006452] hover:text-[#005443] mb-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to all blogs
            </button>
            
            {/* Blog content */}
            <div className="prose max-w-none">
              <h1 className="text-3xl font-bold text-gray-800 mb-4 hidden md:block">{blog.title}</h1>
              
              <div className="my-8">
                {blog.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {/* Author section if available */}
              {blog.author && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-600">
                    <span className="font-medium">Author:</span> {blog.author}
                  </p>
                </div>
              )}
              
              {/* Tags section if available */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer space */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <button 
                onClick={() => navigate('/blog')}
                className="bg-[#006452] text-white px-4 py-2 rounded hover:bg-[#005443] transition duration-300"
              >
                Back to all blogs
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogDetail;