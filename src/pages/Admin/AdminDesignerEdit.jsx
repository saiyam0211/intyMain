import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';

const API_URL = "http://localhost:3000/api";

const AdminDesignerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isAddMode = !id;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
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
  });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Fetch designer data if in edit mode
    if (!isAddMode) {
      fetchDesigner();
    }
  }, [navigate, isAddMode, id]);

  const fetchDesigner = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get(`${API_URL}/designers/${id}`);
      const designerData = response.data;
      
      setFormData({
        name: designerData.name || '',
        rate: designerData.rate || '',
        location: designerData.location || '',
        experience: designerData.experience || '',
        projectsCompleted: designerData.projectsCompleted || '',
        phoneNumber: designerData.phoneNumber || '',
        email: designerData.email || '',
        portfolio: designerData.portfolio || [],
        googleReviews: designerData.googleReviews || '',
        rating: designerData.rating || '5',
      });
    } catch (err) {
      console.error('Error fetching designer:', err);
      setError('Failed to load designer data. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  };

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

  // Handle file uploads
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setError(null);
    
    try {
      if (files.length === 1) {
        // Single file upload
        const uploadData = new FormData();
        uploadData.append('file', files[0]);
        uploadData.append('fileCategory', 'designer-portfolios');
        
        const response = await axios.post(`${API_URL}/upload`, uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Add the new image URL to the portfolio array
        setFormData(prevData => ({
          ...prevData,
          portfolio: [...prevData.portfolio, response.data.secure_url]
        }));
      } else {
        // Multiple file upload
        const uploadData = new FormData();
        files.forEach(file => {
          uploadData.append('files', file);
        });
        uploadData.append('fileCategory', 'designer-portfolios');
        
        const response = await axios.post(`${API_URL}/upload/multiple`, uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Add all new image URLs to the portfolio array
        const uploadedUrls = response.data.map(item => item.secure_url);
        setFormData(prevData => ({
          ...prevData,
          portfolio: [...prevData.portfolio, ...uploadedUrls]
        }));
      }
      
      setSuccessMessage('Images uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload images. Please try again.');
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.portfolio.length < 5) {
      setError('At least 5 portfolio images are required');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        Authorization: token ? `Bearer ${token}` : '',
      };
      
      let response;
      
      if (isAddMode) {
        // Create new designer
        response = await axios.post(`${API_URL}/designers`, formData, { headers });
        setSuccessMessage('Designer created successfully!');
      } else {
        // Update existing designer
        response = await axios.put(`${API_URL}/designers/${id}`, formData, { headers });
        setSuccessMessage('Designer updated successfully!');
      }
      
      // Show success message briefly then redirect
      setTimeout(() => {
        navigate('/admin/designers');
      }, 2000);
    } catch (err) {
      console.error('Error saving designer:', err);
      setError(err.response?.data?.message || 'Failed to save designer information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006452]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative top-0 left-0 w-full bg-transparent z-50">
        <Navbar isResidentialPage={false} />
      </div>

      <div className="container mx-auto pt-24 px-4 pb-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-[#006452] mb-6">
            {isAddMode ? 'Add New Designer' : 'Edit Designer'}
          </h1>

          {/* Success message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {successMessage}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                  placeholder="10-digit number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            
            {/* Portfolio Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio Images * <span className="text-red-500">(minimum 5 required)</span>
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
                  <div className="flex text-sm text-gray-600 justify-center">
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
                        disabled={uploadingImages}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  
                  {/* Upload Progress */}
                  {uploadingImages && (
                    <div className="mt-2 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-[#006452] animate-pulse mr-2"></div>
                      <span className="text-sm text-[#006452]">Uploading images...</span>
                    </div>
                  )}
                  
                  {/* Image Count */}
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
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/designers')}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || uploadingImages || formData.portfolio.length < 5}
                className="px-6 py-3 bg-[#006452] text-white rounded-md hover:bg-[#004d3b] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (isAddMode ? 'Creating...' : 'Updating...') : (isAddMode ? 'Create Designer' : 'Update Designer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDesignerEdit;