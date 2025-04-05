import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://inty-backend.onrender.com/api';

const AdminTestimonialsList = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        
        fetchTestimonials();
    }, [navigate]);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            
            const { data } = await axios.get(`${API_URL}/testimonials`, config);
            setTestimonials(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            setError('Failed to load testimonials. Please try again.');
            setLoading(false);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            
            await axios.patch(
                `${API_URL}/testimonials/${id}/status`,
                { isActive: !currentStatus },
                config
            );
            
            // Update local state
            setTestimonials(testimonials.map(item => 
                item._id === id ? { ...item, isActive: !item.isActive } : item
            ));
            
            toast.success(`Testimonial ${currentStatus ? 'hidden' : 'visible'} successfully`);
        } catch (error) {
            console.error('Error toggling testimonial status:', error);
            toast.error('Failed to update testimonial status');
        }
    };

    const deleteTestimonial = async (id) => {
        if (!window.confirm('Are you sure you want to delete this testimonial?')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('adminToken');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            
            await axios.delete(`${API_URL}/testimonials/${id}`, config);
            
            // Update local state
            setTestimonials(testimonials.filter(item => item._id !== id));
            toast.success('Testimonial deleted successfully');
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            toast.error('Failed to delete testimonial');
        }
    };

    const updateOrder = async (id, newOrder) => {
        try {
            const token = localStorage.getItem('adminToken');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            
            const testimonial = testimonials.find(t => t._id === id);
            
            await axios.put(
                `${API_URL}/testimonials/${id}`,
                { ...testimonial, order: newOrder },
                config
            );
            
            fetchTestimonials(); // Refresh the list
            toast.success('Testimonial order updated');
        } catch (error) {
            console.error('Error updating testimonial order:', error);
            toast.error('Failed to update testimonial order');
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
            <div className="text-xl text-gray-600">Loading testimonials...</div>
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
            
            <div className="pt-24 pb-12 px-4 md:px-8">
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