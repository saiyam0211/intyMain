import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';

const API_URL = "https://inty-backend.onrender.com/api";

const AdminBlogEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isAddMode = !id;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    imageUrl: '' // Store the Cloudinary URL separately for edit mode
  });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Fetch blog data if in edit mode
    if (!isAddMode) {
      fetchBlog();
    }
  }, [navigate, isAddMode, id]);

  const fetchBlog = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get(`${API_URL}/blogs/${id}`);
      const blogData = response.data;
      
      setFormData({
        title: blogData.title || '',
        description: blogData.description || '',
        image: null,
        imageUrl: blogData.image || ''
      });
      
      // Set image preview if there's a valid URL
      if (blogData.image) {
        setImagePreview(blogData.image);
      }
    } catch (err) {
      console.error('Error fetching blog:', err);
      setError('Failed to load blog data. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File validation
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Size validation (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file is too large. Maximum size is 10MB.');
        return;
      }
      
      // Update form data with the image file
      setFormData({
        ...formData,
        image: file,
        imageUrl: '' // Clear previous imageUrl when a new file is selected
      });
      
      // Create file preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Form validation
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      
      // Check if we have either a new image or an existing imageUrl (for edit mode)
      if (!formData.image && !formData.imageUrl && isAddMode) {
        throw new Error('Please select an image');
      }
      
      const token = localStorage.getItem("adminToken");
      const headers = {
        'Authorization': token ? `Bearer ${token}` : ''
      };
      
      // For both add and edit mode, use FormData
      const blogFormData = new FormData();
      blogFormData.append('title', formData.title.trim());
      blogFormData.append('description', formData.description.trim());
      
      // If there's a new image file, add it to the form data
      if (formData.image) {
        blogFormData.append('image', formData.image);
      } else if (formData.imageUrl && !isAddMode) {
        // If editing and using existing image, pass the URL
        // Note: Your backend should handle this special case
        blogFormData.append('existingImage', formData.imageUrl);
      }
      
      let response;
      if (isAddMode) {
        // Create new blog post
        response = await axios.post(`${API_URL}/blogs`, blogFormData, { 
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccessMessage('Blog post created successfully!');
      } else {
        // Update existing blog post
        response = await axios.put(`${API_URL}/blogs/${id}`, blogFormData, { 
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccessMessage('Blog post updated successfully!');
      }
      
      console.log("Blog saved successfully:", response.data);
      
      // Show success message briefly then redirect
      setTimeout(() => {
        navigate('/admin/blogs');
      }, 2000);
    } catch (err) {
      console.error('Error saving blog post:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save blog post. Please try again.');
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
            {isAddMode ? 'Add New Blog Post' : 'Edit Blog Post'}
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

          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            {/* Blog Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                placeholder="Enter blog post title"
              />
            </div>
            
            {/* Blog Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                placeholder="Enter blog post content"
              ></textarea>
            </div>
            
            {/* Blog Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image {(!isAddMode && formData.imageUrl) ? '' : <span className="text-red-500">*</span>}
              </label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="mb-3">
                      <img 
                        src={imagePreview} 
                        alt="Blog preview" 
                        className="mx-auto h-48 w-auto object-contain rounded-md"
                      />
                      <p className="text-xs text-gray-500 mt-1">Current image</p>
                    </div>
                  ) : (
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
                  )}
                  
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#006452] hover:text-[#004d3b] focus-within:outline-none"
                    >
                      <span>{imagePreview ? 'Change image' : 'Upload an image'}</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/blogs')}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#006452] text-white rounded-md hover:bg-[#004d3b] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {isAddMode ? 'Creating...' : 'Updating...'}
                  </div>
                ) : (
                  isAddMode ? 'Create Blog Post' : 'Update Blog Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogEdit;