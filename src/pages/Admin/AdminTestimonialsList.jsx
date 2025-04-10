import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaPlus, FaArrowUp, FaArrowDown, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://inty-backend.onrender.com/api';

const AdminTestimonialsList = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const { getToken, isSignedIn, isLoaded } = useAuth();

    useEffect(() => {
        if (!isLoaded) return;
        
        if (!isSignedIn) {
            navigate('/admin/login');
            return;
        }
        
        fetchTestimonials();
    }, [navigate, isSignedIn, isLoaded]);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Debug the API URL
            console.log('Current API URL:', API_URL);
            
            // Get token from Clerk
            let token;
            try {
                token = await getToken();
                console.log('Clerk token obtained:', token ? `Found (length: ${token.length})` : 'Not found');
            } catch (e) {
                console.error('Error getting token:', e.message);
            }
            
            // Fallback to localStorage if Clerk token isn't available
            if (!token) {
                token = localStorage.getItem('adminToken');
                console.log('Using localStorage token as fallback:', token ? `Found (length: ${token.length})` : 'Not found');
            }
            
            if (!token) {
                console.error('No authentication token available from any source');
                toast.error('Authentication error. Please login again.');
                setError('Authentication error. Please login again.');
                setLoading(false);
                navigate('/admin/login');
                return;
            }
            
            // Log token format for debugging
            if (token) {
                console.log('Token format check:', 
                    token.startsWith('ey') ? 'JWT format' : 
                    (token.length > 100 ? 'Long token' : 'Unknown format'),
                    `First 10 chars: ${token.substring(0, 10)}...`
                );
            }
            
            // First verify if the user is an admin using the verify-token endpoint
            try {
                console.log('Validating token with /admin/verify-token endpoint first');
                const validationConfig = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                
                const validationResponse = await axios.get(`${API_URL}/admin/verify-token`, validationConfig);
                console.log('Token validation response:', validationResponse.status);
                
                // Store this valid token in localStorage
                localStorage.setItem('adminToken', token);
                
                // If we successfully verified the admin status, we'll fetch testimonials 
                // without requiring authentication since that endpoint has issues
                console.log('User verified as admin, fetching testimonials directly...');
                try {
                    // Fetch with authentication
                    console.log('Fetching testimonials with admin authentication...');
                    
                    // Use REST API with proper authentication
                    const response = await axios.get(`${API_URL}/testimonials`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    console.log('Testimonials fetch successful:', response.status);
                    setTestimonials(response.data);
                    setLoading(false);
                } catch (directError) {
                    console.error('Error fetching testimonials directly:', directError);
                    
                    // Try fetching active testimonials as a fallback
                    try {
                        console.log('Trying to fetch active testimonials as fallback...');
                        const activeResponse = await axios.get(`${API_URL}/testimonials/active`);
                        console.log('Active testimonials fetch successful:', activeResponse.status);
                        setTestimonials(activeResponse.data);
                        setLoading(false);
                        
                        // Show warning that only active testimonials are displayed
                        toast.warning('Only showing active testimonials. Full admin functionality may be limited.');
                    } catch (activeError) {
                        console.error('Error fetching active testimonials:', activeError);
                        setError('Unable to load testimonials. Please contact the developer.');
                        toast.error('Unable to load testimonials. Please contact the developer.');
                        setLoading(false);
                    }
                }
            } catch (validationError) {
                console.error('Token validation failed:', validationError.message);
                
                if (validationError.response && validationError.response.status === 401) {
                    // Token is invalid, redirect to login
                    localStorage.removeItem('adminToken');
                    toast.error('Your session has expired. Please login again.');
                    setError('Your session has expired. Please login again.');
                    setLoading(false);
                    setTimeout(() => navigate('/admin/login'), 1000);
                    return;
                }
                
                // If there's another error with validation, try a direct fetch
                console.warn('Validation error but continuing with testimonials fetch');
                try {
                    // Fetch active testimonials
                    const activeResponse = await axios.get(`${API_URL}/testimonials/active`);
                    console.log('Active testimonials fetch successful:', activeResponse.status);
                    setTestimonials(activeResponse.data);
                    setLoading(false);
                    
                    // Show warning that only active testimonials are displayed
                    toast.warning('Only showing active testimonials. Full admin functionality may be limited.');
                } catch (activeError) {
                    console.error('Error fetching testimonials:', activeError);
                    setError('Unable to load testimonials. Please contact the developer.');
                    toast.error('Unable to load testimonials. Please contact the developer.');
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Unexpected error in fetchTestimonials:', error);
            setError('An unexpected error occurred. Please try again.');
            toast.error('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            // Get token from Clerk
            let token;
            try {
                token = await getToken();
                console.log('Got token for toggle status:', token ? 'Yes' : 'No');
            } catch (err) {
                console.error('Error getting token for toggle status:', err.message);
            }
            
            // Fallback to localStorage if needed
            if (!token) {
                token = localStorage.getItem('adminToken');
                console.log('Using localStorage token for toggle status:', token ? 'Yes' : 'No');
            }
            
            if (!token) {
                toast.error('Authentication error. Please login again.');
                navigate('/admin/login');
                return;
            }
            
            // First try with the authentication header
            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                };
                
                console.log(`Toggling testimonial ${id} status from ${currentStatus} to ${!currentStatus}`);
                const response = await axios.patch(
                    `${API_URL}/testimonials/${id}/status`,
                    { isActive: !currentStatus },
                    config
                );
                console.log('Toggle status response:', response.status);
                
                // Update local state
                setTestimonials(testimonials.map(item => 
                    item._id === id ? { ...item, isActive: !item.isActive } : item
                ));
                
                toast.success(`Testimonial ${currentStatus ? 'hidden' : 'visible'} successfully`);
            } catch (error) {
                // If authentication fails, try alternative approach
                if (error.response && error.response.status === 401) {
                    console.log('Authentication error when toggling status. Refreshing data instead.');
                    toast.error('Unable to toggle status directly. Refreshing testimonials data.');
                    fetchTestimonials(); // Refresh the list instead
                } else {
                    console.error('Error toggling testimonial status:', error);
                    
                    // Log detailed error information
                    if (error.response) {
                        console.log('Error status:', error.response.status);
                        console.log('Error data:', error.response.data);
                    }
                    
                    toast.error('Failed to update testimonial status.');
                }
            }
        } catch (error) {
            console.error('Unexpected error when toggling status:', error);
            toast.error('An unexpected error occurred. Please try again.');
        }
    };

    const deleteTestimonial = async (id) => {
        if (!window.confirm('Are you sure you want to delete this testimonial?')) {
            return;
        }
        
        try {
            // Get token from Clerk
            let token;
            try {
                token = await getToken();
                console.log('Got token for delete:', token ? 'Yes' : 'No');
            } catch (err) {
                console.error('Error getting token for delete:', err.message);
            }
            
            // Fallback to localStorage if needed
            if (!token) {
                token = localStorage.getItem('adminToken');
                console.log('Using localStorage token for delete:', token ? 'Yes' : 'No');
            }
            
            if (!token) {
                toast.error('Authentication error. Please login again.');
                navigate('/admin/login');
                return;
            }
            
            // Try with authentication first
            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                };
                
                console.log(`Deleting testimonial ${id}`);
                const response = await axios.delete(`${API_URL}/testimonials/${id}`, config);
                console.log('Delete response:', response.status);
                
                // Update local state
                setTestimonials(testimonials.filter(item => item._id !== id));
                toast.success('Testimonial deleted successfully');
            } catch (error) {
                // If authentication fails, try alternative approach
                if (error.response && error.response.status === 401) {
                    console.log('Authentication error when deleting. Refreshing data instead.');
                    toast.error('Unable to delete testimonial directly. Please contact the developer.');
                    fetchTestimonials(); // Refresh the list instead
                } else {
                    console.error('Error deleting testimonial:', error);
                    
                    // Log detailed error information
                    if (error.response) {
                        console.log('Error status:', error.response.status);
                        console.log('Error data:', error.response.data);
                    }
                    
                    toast.error('Failed to delete testimonial.');
                }
            }
        } catch (error) {
            console.error('Unexpected error when deleting:', error);
            toast.error('An unexpected error occurred. Please try again.');
        }
    };

    const updateOrder = async (id, newOrder) => {
        try {
            // Get token from Clerk
            let token;
            try {
                token = await getToken();
                console.log('Got token for updateOrder:', token ? 'Yes' : 'No');
            } catch (err) {
                console.error('Error getting token for updateOrder:', err.message);
            }
            
            // Fallback to localStorage if needed
            if (!token) {
                token = localStorage.getItem('adminToken');
                console.log('Using localStorage token for updateOrder:', token ? 'Yes' : 'No');
            }
            
            if (!token) {
                toast.error('Authentication error. Please login again.');
                navigate('/admin/login');
                return;
            }
            
            // Try with authentication first
            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                };
                
                // Find the testimonial to update
                const testimonial = testimonials.find(t => t._id === id);
                console.log(`Updating testimonial ${id} order to ${newOrder}`);
                
                const response = await axios.put(
                    `${API_URL}/testimonials/${id}`,
                    { ...testimonial, order: newOrder },
                    config
                );
                console.log('Update order response:', response.status);
                
                // Refresh the list
                fetchTestimonials();
                toast.success('Testimonial order updated');
            } catch (error) {
                // If authentication fails, try alternative approach
                if (error.response && error.response.status === 401) {
                    console.log('Authentication error when updating order. Refreshing data instead.');
                    toast.error('Unable to update order directly. Please contact the developer.');
                    fetchTestimonials(); // Refresh the list instead
                } else {
                    console.error('Error updating testimonial order:', error);
                    
                    // Log detailed error information
                    if (error.response) {
                        console.log('Error status:', error.response.status);
                        console.log('Error data:', error.response.data);
                    }
                    
                    toast.error('Failed to update testimonial order.');
                }
            }
        } catch (error) {
            console.error('Unexpected error when updating order:', error);
            toast.error('An unexpected error occurred. Please try again.');
        }
    };

    const handleMoveUp = (index) => {
        if (index > 0) {
            const currentItem = testimonials[index];
            const prevItem = testimonials[index - 1];
            updateOrder(currentItem._id, prevItem.order - 1);
        }
    };

    const handleMoveDown = (index) => {
        if (index < testimonials.length - 1) {
            const currentItem = testimonials[index];
            const nextItem = testimonials[index + 1];
            updateOrder(currentItem._id, nextItem.order + 1);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
            <div className="flex flex-col items-center justify-center gap-4">
                <FaSpinner className="animate-spin text-amber-500 text-4xl" />
                <div className="text-xl text-gray-600">Loading testimonials...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
            <div className="text-xl text-red-600">{error}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="absolute top-0 left-0 w-full bg-transparent z-50">
                <Navbar isResidentialPage={false} />
            </div>
            
            <div className="w-full pt-24 pb-4 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Manage Testimonials</h1>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/admin/home')}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/admin/testimonials/add')}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                            >
                                <FaPlus /> Add New Testimonial
                            </button>
                        </div>
                    </div>
                    
                    {testimonials.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <p className="text-xl text-gray-600">No testimonials found.</p>
                            <button
                                onClick={() => navigate('/admin/testimonials/add')}
                                className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-md transition-colors"
                            >
                                Add Your First Testimonial
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {testimonials.map((testimonial, index) => (
                                            <tr key={testimonial._id} className={testimonial.isActive ? '' : 'bg-gray-50'}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="text-gray-900 mr-3">{testimonial.order}</span>
                                                        <div className="flex flex-col">
                                                            <button 
                                                                onClick={() => handleMoveUp(index)}
                                                                disabled={index === 0}
                                                                className={`text-gray-500 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-700'}`}
                                                            >
                                                                <FaArrowUp />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleMoveDown(index)}
                                                                disabled={index === testimonials.length - 1}
                                                                className={`text-gray-500 ${index === testimonials.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-700'}`}
                                                            >
                                                                <FaArrowDown />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="h-16 w-16 rounded overflow-hidden">
                                                        <img 
                                                            src={testimonial.image} 
                                                            alt={testimonial.name} 
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = '/images/placeholder.png';
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{testimonial.position}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        testimonial.isActive 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {testimonial.isActive ? 'Active' : 'Hidden'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-3">
                                                        <button 
                                                            onClick={() => navigate(`/admin/testimonials/edit/${testimonial._id}`)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Edit"
                                                        >
                                                            <FaEdit size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => toggleStatus(testimonial._id, testimonial.isActive)}
                                                            className={`${testimonial.isActive ? 'text-amber-500 hover:text-amber-700' : 'text-green-500 hover:text-green-700'}`}
                                                            title={testimonial.isActive ? 'Hide' : 'Show'}
                                                        >
                                                            {testimonial.isActive ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteTestimonial(testimonial._id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete"
                                                        >
                                                            <FaTrash size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTestimonialsList;