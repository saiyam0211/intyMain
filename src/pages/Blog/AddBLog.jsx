import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import Header from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import backgroundImage from "../../assets/background.png";
import axios from 'axios'; 

// Set the base URL for API requests
const API_URL = "https://inty-backend.onrender.com"; // Update this with your actual server URL

export default function AddBlogPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      
      setFormData({
        ...formData,
        image: file,
      });
      
      // Create a preview URL for the selected image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
      
      // Clear any previous errors
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    if (!formData.title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }
    
    if (!formData.description.trim()) {
      setError("Description is required");
      setLoading(false);
      return;
    }
    
    if (!formData.image) {
      setError("Image is required");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting blog post...");
      
      // Send a direct multipart form-data request with the file
      const formDataForUpload = new FormData();
      formDataForUpload.append("title", formData.title.trim());
      formDataForUpload.append("description", formData.description.trim());
      formDataForUpload.append("image", formData.image);

      const response = await axios.post(`${API_URL}/api/blogs`, formDataForUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000 // 30 second timeout for larger images
      });

      console.log("Blog post created:", response.data);
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        image: null,
      });
      setPreviewUrl(null);

      // Redirect after a delay
      setTimeout(() => {
        setSuccess(false);
        navigate("/blog");
      }, 2000);
    } catch (err) {
      console.error("Error creating blog post:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Failed to create blog post. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
          Add New Blog Post
        </motion.h2>
      </motion.section>

      <div className="max-w-4xl mx-auto py-16 px-4">
        {/* Success and Error messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Blog post created. Redirecting...</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </motion.div>
        )}

        {/* Add Blog Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white shadow-md rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create a Blog Post</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">
                Image <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: JPEG, PNG, GIF. Max size: 5MB.
              </p>
              
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full max-h-40 object-contain border rounded"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                type="submit"
                disabled={loading}
                className={`${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                } bg-[#006452] hover:bg-[#005443] text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  "Create"
                )}
              </Button>
              
              <button
                type="button"
                onClick={() => navigate('/blog')}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}