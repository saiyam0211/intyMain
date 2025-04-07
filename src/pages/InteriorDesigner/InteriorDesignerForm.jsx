// components/DesignerForm/DesignerForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import citiesOptions from "../../data/cities";

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
    projectType: '',
    location: '',
    availableCities: [],
    experience: '',
    projectsCompleted: '',
    phoneNumber: '',
    email: '',
    portfolio: [],
    googleReviews: '',
    rating: '5', // Default value
    description: '', // Added description field
    isListed: false, // By default, set to unlisted
  });
  const [errors, setErrors] = useState({});

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
        const res = await axios.get(`https://inty-backend.onrender.com/api/designers/${id}`);
        
        // Format the data for the form
        const designer = res.data;
        setFormData({
          name: designer.name || '',
          rate: designer.rate || '',
          projectType: designer.projectType || '',
          location: designer.location || '',
          availableCities: designer.availableCities || [],
          experience: designer.experience || '',
          projectsCompleted: designer.projectsCompleted || '',
          phoneNumber: designer.phoneNumber || '',
          email: designer.email || '',
          portfolio: designer.portfolio || [],
          googleReviews: designer.googleReviews || '',
          rating: designer.rating || '5',
          description: designer.description || '',
          isListed: designer.isListed || false
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
        
        const response = await axios.post('https://inty-backend.onrender.com/api/upload', formData, {
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
    const validationErrors = {};

    // Required string fields validation
    const requiredFields = {
      name: "Designer Name",
      rate: "Rate",
      experience: "Experience",
      projectsCompleted: "Projects Completed",
      phoneNumber: "Phone Number",
      email: "Email",
    };

    // Check required string fields
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field] || formData[field].trim() === "") {
        validationErrors[field] = `${label} is required`;
      }
    });

    // Check availableCities
    if (!formData.availableCities || formData.availableCities.length === 0) {
      validationErrors.availableCities = "At least one city is required";
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = "Invalid email format";
    }

    // Phone number validation
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
      validationErrors.phoneNumber = "Phone number must be 10 digits";
    }

    // Check if at least 5 portfolio images are provided
    if (formData.portfolio.length < 5) {
      validationErrors.portfolio = "Please upload at least 5 portfolio images";
    }

    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors).join('\n');
      setMessage({ type: 'error', text: errorMessages });
      return false;
    }
    return true;
  };

  // Handle form submission with image validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    // Ensure location is set for backward compatibility
    let submissionData = { ...formData };
    if (!submissionData.location && submissionData.availableCities.length > 0) {
      submissionData.location = submissionData.availableCities[0];
    }

    // Calculate rateNumeric for backend filtering
    const rateNumeric = parseInt(submissionData.rate.replace(/\D/g, ""));
    submissionData.rateNumeric = isNaN(rateNumeric) ? 0 : rateNumeric;

    try {
      setLoading(true);
      let response;

      if (isEditMode && id) {
        response = await axios.put(
          `https://inty-backend.onrender.com/api/designers/${id}`,
          submissionData
        );
        toast.success("Designer updated successfully!");
      } else {
        response = await axios.post(
          'https://inty-backend.onrender.com/api/designers',
          submissionData
        );
        toast.success("Designer created successfully!");
      }

      // Redirect to designers list
      setTimeout(() => {
        navigate('/interiordesigner');
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to add a city to availableCities and update location
  const handleAddCity = (city) => {
    if (!formData.availableCities.includes(city)) {
      // Add city to availableCities if not already present
      setFormData((prevData) => ({
        ...prevData,
        availableCities: [...prevData.availableCities, city],
        // Set location to the first city for backward compatibility if it's empty
        location: prevData.location === "" ? city : prevData.location,
      }));
    }
  };

  // Function to remove a city from availableCities and update location
  const handleRemoveCity = (index) => {
    setFormData((prevData) => {
      const updatedCities = [...prevData.availableCities];
      updatedCities.splice(index, 1);
      
      // Update location field for backward compatibility
      let updatedLocation = prevData.location;
      // If the removed city was the location, and there are other cities, set location to the first available city
      if (prevData.location === prevData.availableCities[index] && updatedCities.length > 0) {
        updatedLocation = updatedCities[0];
      } else if (updatedCities.length === 0) {
        // If no cities remain, clear the location
        updatedLocation = "";
      }
      
      return {
        ...prevData,
        availableCities: updatedCities,
        location: updatedLocation,
      };
    });
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
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg" data-aos="fade-up">
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
                  className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]`}
                  placeholder="Full Name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
              
              {/* Location Information */}
              <div className="md:col-span-2">
                
                <div className="relative mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Cities/Locations *
                  </label>
                  <input
                    type="text"
                    placeholder="Search cities..."
                    className="w-full p-2 border rounded"
                    onFocus={(e) => {
                      const cityDropdown = document.getElementById('cityDropdown');
                      if (cityDropdown) {
                        cityDropdown.classList.remove('hidden');
                      }
                    }}
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      const cityDropdown = document.getElementById('cityDropdown');
                      
                      if (searchTerm.length > 0) {
                        cityDropdown.classList.remove('hidden');
                      } else {
                        cityDropdown.classList.add('hidden');
                      }

                      // Filter cities based on search
                      const cityItems = cityDropdown.getElementsByTagName('div');
                      let visibleCount = 0;
                      for (let i = 0; i < cityItems.length; i++) {
                        const cityText = cityItems[i].textContent.toLowerCase();
                        if (cityText.includes(searchTerm)) {
                          cityItems[i].classList.remove('hidden');
                          visibleCount++;
                          // Limit visible items to improve performance
                          if (visibleCount > 50) {
                            cityItems[i].classList.add('hidden');
                          }
                        } else {
                          cityItems[i].classList.add('hidden');
                        }
                      }
                    }}
                  />
                  {formData.availableCities.length === 0 && (
                    <p className="text-red-500 text-sm mt-1">Please select at least one city</p>
                  )}
                  <div
                    id="cityDropdown"
                    className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto hidden"
                  >
                    {citiesOptions.map((city, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          // Use custom handler to maintain location field
                          handleAddCity(city);
                          // Hide dropdown
                          const dropdown = document.getElementById('cityDropdown');
                          if (dropdown) {
                            dropdown.classList.add('hidden');
                          }
                          // Clear the search input
                          const searchInput = document.querySelector('input[placeholder="Search cities..."]');
                          if (searchInput) {
                            searchInput.value = '';
                          }
                        }}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display selected cities as tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.availableCities.map((city, index) => (
                    <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                      {city}
                      <button
                        type="button"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        onClick={() => handleRemoveCity(index)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1 mb-4">All selected cities will be used for filtering. Users will be able to find you when searching in any of these locations.</p>
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
      </div>
    </div>
  );
};

export default DesignerForm;