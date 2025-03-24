// components/DesignerForm/DesignerForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DesignerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL if in edit mode
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    location: '',
    experience: '',
    projectsCompleted: '',
    phoneNumber: '',
    email: '',
    portfolio: [],
    googleReviews: '',
    rating: '5', // Default value
    description: '' // Added description field
  });

  // Initialize AOS for animations
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  // Fetch designer data if in edit mode
  useEffect(() => {
    const fetchDesigner = async () => {
      if (!isEditMode) return;
      
      try {
        setFetchLoading(true);
        const res = await axios.get(`http://localhost:3000/api/designers/${id}`);
        
        // Format the data for the form
        const designer = res.data;
        setFormData({
          name: designer.name || '',
          rate: designer.rate || '',
          location: designer.location || '',
          experience: designer.experience || '',
          projectsCompleted: designer.projectsCompleted || '',
          phoneNumber: designer.phoneNumber || '',
          email: designer.email || '',
          portfolio: designer.portfolio || [],
          googleReviews: designer.googleReviews || '',
          rating: designer.rating || '5',
          description: designer.description || ''
        });
      } catch (err) {
        console.error('Error fetching designer:', err);
        setMessage({
          type: 'error',
          text: 'Failed to load designer data.. Please try again or create a new profile.'
        });
        toast.error('Failed to load designer data.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchDesigner();
  }, [id, isEditMode]);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for rate to ensure proper format
    if (name === 'rate') {
      // Strip non-numeric characters except for the first occurrence of '₹'
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [name]: `₹ ${numericValue}/hr` });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Improved file upload handling
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check file size and type
    const invalidFiles = files.filter(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum file size is 10MB.`);
        return true;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not a valid image type. Please upload JPEG, PNG, or GIF.`);
        return true;
      }
      
      return false;
    });

    // If any files are invalid, stop upload
    if (invalidFiles.length > 0) return;

    setUploadingImages(true);
    setMessage({ type: 'info', text: 'Uploading images to Cloudinary...' });
    
    try {
      // Prepare upload data
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileCategory', 'designer-portfolios');
        
        const response = await axios.post('http://localhost:3000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return response.data.secure_url;
      });

      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Add new image URLs to portfolio
      setFormData(prevData => ({
        ...prevData,
        portfolio: [...prevData.portfolio, ...uploadedUrls]
      }));
      
      setMessage({ type: 'success', text: 'Images uploaded successfully!' });
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload images. Please try again.' 
      });
      toast.error(error.response?.data?.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove an uploaded image
  const removeImage = (indexToRemove) => {
    setFormData({
      ...formData,
      portfolio: formData.portfolio.filter((_, index) => index !== indexToRemove)
    });
  };

  // Validate the form
  const validateForm = () => {
    const requiredFields = [
      { field: 'name', label: 'Designer Name' },
      { field: 'rate', label: 'Rate' },
      { field: 'location', label: 'Location' },
      { field: 'experience', label: 'Experience' },
      { field: 'projectsCompleted', label: 'Projects Completed' },
      { field: 'phoneNumber', label: 'Phone Number' },
      { field: 'email', label: 'Email Address' },
      { field: 'googleReviews', label: 'Google Reviews Count' },
      { field: 'description', label: 'Professional Description' }
    ];

    // Check each required field
    for (const { field, label } of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        toast.error(`${label} is required.`);
        return false;
      }
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }

    // Check phone number format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number.');
      return false;
    }

    // Check portfolio images
    if (formData.portfolio.length < 5) {
      toast.error('At least 5 portfolio images are required.');
      return false;
    }

    return true;
  };

  // Handle form submission with image validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage({ type: 'info', text: `${isEditMode ? 'Updating' : 'Creating'} designer profile...` });

    try {
      let response;
      
      // Prepare form data for submission
      const submissionData = {
        ...formData,
        // Ensure rateNumeric is calculated for backend filtering
        rateNumeric: parseInt(formData.rate.replace(/[^\d]/g, ''), 10)
      };
      
      if (isEditMode) {
        // Update existing designer
        response = await axios.put(`http://localhost:3000/api/designers/${id}`, submissionData);
      } else {
        // Create new designer
        response = await axios.post('http://localhost:3000/api/designers', submissionData);
      }
      
      setMessage({ 
        type: 'success', 
        text: `Designer profile ${isEditMode ? 'updated' : 'created'} successfully!` 
      });
      
      toast.success(`Designer profile ${isEditMode ? 'updated' : 'created'} successfully!`);
      
      // Redirect to designers list after successful submission
      setTimeout(() => {
        navigate('/interiordesigner');
      }, 2000);
      
    } catch (error) {
      console.error('Submission error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'save'} profile. Please try again.` 
      });
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'save'} profile. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching data in edit mode
  if (isEditMode && fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006452]"></div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto my-8"
      data-aos="fade-up"
    >
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <h2 className="text-2xl font-bold text-[#006452] mb-6">
        {isEditMode ? 'Edit Designer Profile' : 'Add New Interior Designer'}
      </h2>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 
          message.type === 'success' ? 'bg-green-100 text-green-700' : 
          'bg-blue-100 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designer Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              placeholder="Full Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate (₹/hr) *
            </label>
            <input
              type="text"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              placeholder="₹ 250/hr"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              placeholder="Area/Neighborhood"
            />
          </div>
          
          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              placeholder="Tell us about your design expertise and style..."
            />
          </div>
          
          {/* Google Reviews Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Reviews Count *
            </label>
            <input
              type="number"
              name="googleReviews"
              value={formData.googleReviews}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              placeholder="Number of Google reviews"
            />
          </div>
          
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating (out of 5) *
            </label>
            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
            >
              <option value="5">5 Stars</option>
              <option value="4.5">4.5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3.5">3.5 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2.5">2.5 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1.5">1.5 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience (years) *
            </label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              placeholder="e.g. 5+"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projects Completed *
            </label>
            <input
              type="text"
              name="projectsCompleted"
              value={formData.projectsCompleted}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              placeholder="e.g. 100+"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              placeholder="10-digit number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              placeholder="email@example.com"
            />
          </div>
        </div>
        
        {/* Portfolio Images Upload - requiring at least 5 images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Portfolio Images * <span className="text-red-500">(minimum 5 images required)</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-[#006452] hover:text-[#004d3b] focus-within:outline-none"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileUpload}
                    disabled={uploadingImages || loading}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
              
              {/* Upload Progress Indicator */}
              {uploadingImages && (
                <div className="mt-2">
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[#006452] animate-pulse mr-2"></div>
                    <span className="text-sm text-[#006452]">Uploading to Cloudinary...</span>
                  </div>
                </div>
              )}
              
              {/* Image Count Indicator */}
              <div className="mt-2">
                <span className={`text-sm ${formData.portfolio.length >= 5 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                  {formData.portfolio.length} of 5 required images uploaded
                </span>
              </div>
            </div>
          </div>
          
          {/* Display uploaded images */}
          {formData.portfolio.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {formData.portfolio.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={image} 
                    alt={`Portfolio ${index + 1}`} 
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                  >
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate('/interiordesigner')}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="px-6 py-3 bg-[#006452] text-white rounded-md hover:bg-[#004d3b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006452] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? `${isEditMode ? 'Updating...' : 'Saving...'}` : `${isEditMode ? 'Update' : 'Save'} Designer Profile`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DesignerForm;