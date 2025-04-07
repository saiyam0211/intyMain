import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ResponsiveAdminContainer from '../../components/Admin/ResponsiveAdminContainer';

const API_URL = "https://inty-backend.onrender.com/api";

const AdminDesignerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isAddMode = !id;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Cities options based on the screenshots
  const citiesOptions = [
    "Agra", "Ahmedabad", "Ajmer", "Akola", "Aligarh", "Allahabad", "Amravati", "Amritsar",
    "Aurangabad", "Bengaluru", "Bareilly", "Belgaum", "Bhavnagar", "Bhilai", "Bhiwandi",
    "Bhopal", "Bhubaneswar", "Bikaner", "Bilaspur", "Bokaro", "Chandigarh", "Chennai",
    "Coimbatore", "Cuttack", "Dehradun", "Delhi", "Dhanbad", "Durgapur", "Faridabad",
    "Firozabad", "Ghaziabad", "Gorakhpur", "Gulbarga", "Guntur", "Gurgaon", "Guwahati",
    "Gwalior", "Hubli", "Hyderabad", "Indore", "Jabalpur", "Jaipur", "Jalandhar", "Jammu",
    "Jamnagar", "Jamshedpur", "Jhansi", "Jodhpur", "Kanpur", "Kochi", "Kolhapur", "Kolkata",
    "Kota", "Kozhikode", "Kurnool", "Lucknow", "Ludhiana", "Madurai", "Mangalore", "Meerut",
    "Mumbai", "Mysore", "Nagpur", "Nashik", "Navi Mumbai", "Noida", "Patna", "Pondicherry",
    "Pune", "Raipur", "Rajkot", "Ranchi", "Rourkela", "Salem", "Sangli", "Siliguri", "Solapur",
    "Srinagar", "Surat", "Thiruvananthapuram", "Thrissur", "Tiruchirappalli", "Tirunelveli",
    "Tiruppur", "Ujjain", "Vadodara", "Varanasi", "Vijayawada", "Visakhapatnam", "Warangal",
    "Agartala", "Aizawl", "Aligarh", "Alwar", "Ambala", "Ambarnath", "Ambikapur", "Anand", "Anantapur"
  ];

  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    location: '', // Keep for backward compatibility 
    availableCities: [],
    projectType: '',
    experience: '',
    projectsCompleted: '',
    phoneNumber: '',
    email: '',
    portfolio: [],
    googleReviews: '',
    rating: '5', // Default value
    show: true, // Default to listed
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
      
      // Handle existing data and ensure backward compatibility
      const availableCities = designerData.availableCities || [];
      const location = designerData.location || (availableCities.length > 0 ? availableCities[0] : '');
      
      setFormData({
        name: designerData.name || '',
        rate: designerData.rate || '',
        location: location, // Set location field for backward compatibility
        availableCities: availableCities,
        projectType: designerData.projectType || '',
        experience: designerData.experience || '',
        projectsCompleted: designerData.projectsCompleted || '',
        phoneNumber: designerData.phoneNumber || '',
        email: designerData.email || '',
        portfolio: designerData.portfolio || [],
        googleReviews: designerData.googleReviews || '',
        rating: designerData.rating || '5',
        show: designerData.show !== false, // Default to true if not specified
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Function to add a city to availableCities and update location
  const handleAddCity = (city) => {
    if (!formData.availableCities.includes(city)) {
      const newAvailableCities = [...formData.availableCities, city];
      setFormData(prev => ({
        ...prev,
        availableCities: newAvailableCities,
        // Only set location if it's not already set
        location: prev.location || city,
      }));
    }
  };

  // Function to remove a city from availableCities and update location
  const handleRemoveCity = (indexToRemove) => {
    const cityToRemove = formData.availableCities[indexToRemove];
    const newAvailableCities = formData.availableCities.filter((_, i) => i !== indexToRemove);
    
    setFormData(prev => {
      // If we still have cities after removal, ensure location is set to one of them
      let updatedLocation = prev.location;
      
      // If we removed the city that was in the location field and we have other cities,
      // update location to any remaining city for backward compatibility
      if (prev.location === cityToRemove && newAvailableCities.length > 0) {
          updatedLocation = newAvailableCities[0];
      } else if (newAvailableCities.length === 0) {
          // If no cities are left, clear the location field
          updatedLocation = '';
      }
      
      return {
          ...prev,
          availableCities: newAvailableCities,
          location: updatedLocation
      };
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    try {
      setUploadingImages(true);
      
      // Check filesize restrictions
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setError("One or more files exceed the 10MB limit. Please compress your images.");
          setUploadingImages(false);
          return;
        }
      }
      
      const uploadPromises = files.map(async file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
          formData
        );
        
        return response.data.secure_url;
      });
      
      const imageUrls = await Promise.all(uploadPromises);
      
      setFormData(prevData => ({
        ...prevData,
        portfolio: [...prevData.portfolio, ...imageUrls]
      }));
      
      setSuccessMessage("Images uploaded successfully!");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading images:', error);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prevData => ({
      ...prevData,
      portfolio: prevData.portfolio.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form
    if (!formData.name || !formData.rate || formData.availableCities.length === 0  || !formData.experience || !formData.projectsCompleted || !formData.phoneNumber || !formData.email) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      
      // Preserve the existing location field if it exists
      const dataToSubmit = {
        ...formData,
        // Only set location to first city if it's empty but we have cities
        location: formData.location || (formData.availableCities.length > 0 ? formData.availableCities[0] : ''),
      };
      
      const method = isAddMode ? 'post' : 'put';
      const url = isAddMode ? `${API_URL}/designers` : `${API_URL}/designers/${id}`;
      
      await axios({
        method,
        url,
        data: dataToSubmit,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccessMessage(isAddMode ? 'Designer created successfully!' : 'Designer updated successfully!');
      
      // Navigate back to the designers list after a short delay
      setTimeout(() => {
        navigate('/admin/designers');
      }, 1000);
    } catch (err) {
      console.error('Error saving designer:', err);
      setError(err.response?.data?.message || 'Failed to save designer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveAdminContainer 
      title={isAddMode ? "Add Designer" : "Edit Designer"} 
      showBackButton 
      backTo="/admin/designers"
    >
      {fetchLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006452]"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Rate (per hour) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Available Cities/Locations <span className="text-red-500">*</span>
              </label>
              <div className="relative">
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
              <div className="flex flex-wrap gap-2 mt-2">
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
              <p className="text-xs text-gray-500 mt-1">All selected cities will be used for filtering. Users will be able to find this designer when searching in any of these locations.</p>
            </div>
            
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Experience (years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Projects Completed <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="projectsCompleted"
                  value={formData.projectsCompleted}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Google Reviews
              </label>
              <input
                type="text"
                name="googleReviews"
                value={formData.googleReviews}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Rating
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006452]"
              >
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="show"
                  checked={formData.show}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Listed (visible to users)</span>
              </label>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Portfolio Images <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="portfolio-upload"
                  disabled={uploadingImages}
                />
                <label
                  htmlFor="portfolio-upload"
                  className="cursor-pointer block text-center py-2 px-4 bg-[#006452] text-white rounded-md hover:bg-[#00543f] transition duration-300"
                >
                  {uploadingImages ? "Uploading..." : "Upload Images"}
                </label>
                <p className="text-gray-500 text-sm mt-2">Upload designer's portfolio images (max 10MB per image)</p>
                
                {formData.portfolio.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Uploaded Images:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {formData.portfolio.map((image, index) => (
                        <div key={index} className="relative group">
                          <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin/designers')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-4 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#006452] text-white rounded-md hover:bg-[#00543f] transition-colors"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Designer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </ResponsiveAdminContainer>
  );
};

export default AdminDesignerEdit;