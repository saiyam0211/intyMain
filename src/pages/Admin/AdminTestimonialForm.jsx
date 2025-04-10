import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft, FaImage } from 'react-icons/fa';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://inty-backend.onrender.com/api';

const AdminTestimonialForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken, isSignedIn, isLoaded } = useAuth();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        position: '',
        quote: '',
        image: '',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        if (!isLoaded) return;
        
        if (!isSignedIn) {
            navigate('/admin/login');
            return;
        }

        // If editing, fetch the testimonial data
        if (isEditMode) {
            fetchTestimonial();
        }
    }, [id, isEditMode, navigate, isSignedIn, isLoaded]);

    const fetchTestimonial = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            
            if (!token) {
                toast.error('Authentication error. Please login again.');
                navigate('/admin/login');
                return;
            }
            
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get(`${API_URL}/testimonials/${id}`, config);
            setFormData({
                name: data.name,
                position: data.position,
                quote: data.quote,
                image: data.image,
                order: data.order,
                isActive: data.isActive
            });
            setImagePreview(data.image);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching testimonial:', error);
            toast.error('Failed to load testimonial data');
            setLoading(false);
            navigate('/admin/testimonials');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);

            // Create a preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // AdminTestimonialForm.jsx - modified uploadImage function
    const uploadImage = async () => {
        if (!imageFile) return null;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', imageFile); // Use 'file' instead of 'testimonialImage'
        formData.append('fileCategory', 'testimonials-images'); // Set category for proper folder routing

        try {
            const token = await getToken();
            
            if (!token) {
                toast.error('Authentication error. Please login again.');
                setIsUploading(false);
                navigate('/admin/login');
                return null;
            }
            
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            };

            // Use the general upload endpoint that's already working
            const response = await axios.post(`${API_URL}/upload`, formData, config);
            setIsUploading(false);
            return response.data.secure_url; // Use the secure_url from your response
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
            setIsUploading(false);
            
            if (error.response && error.response.status === 401) {
                navigate('/admin/login');
            }
            
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.position || !formData.quote) {
            toast.error('Please fill all required fields');
            return;
        }

        // If adding a new testimonial, image is required
        if (!isEditMode && !imageFile && !formData.image) {
            toast.error('Please upload an image');
            return;
        }

        setLoading(true);

        try {
            // Upload image if a new one is selected
            let imageUrl = formData.image;
            if (imageFile) {
                const uploadedImageUrl = await uploadImage();
                if (!uploadedImageUrl) {
                    setLoading(false);
                    return; // Stop if image upload failed
                }
                imageUrl = uploadedImageUrl;
            }

            const token = await getToken();
            
            if (!token) {
                toast.error('Authentication error. Please login again.');
                setLoading(false);
                navigate('/admin/login');
                return;
            }
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const dataToSubmit = {
                ...formData,
                image: imageUrl,
            };

            if (isEditMode) {
                await axios.put(`${API_URL}/testimonials/${id}`, dataToSubmit, config);
                toast.success('Testimonial updated successfully');
            } else {
                await axios.post(`${API_URL}/testimonials`, dataToSubmit, config);
                toast.success('Testimonial created successfully');
            }

            setLoading(false);
            navigate('/admin/testimonials');
        } catch (error) {
            console.error('Error saving testimonial:', error);
            toast.error(isEditMode ? 'Failed to update testimonial' : 'Failed to create testimonial');
            setLoading(false);
            
            if (error.response && error.response.status === 401) {
                navigate('/admin/login');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-xl text-gray-600">
                    {isEditMode ? 'Loading testimonial data...' : 'Creating new testimonial...'}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="absolute top-0 left-0 w-full bg-transparent z-50">
                <Navbar isResidentialPage={false} />
            </div>

            <div className="pt-24 pb-12 px-4 md:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">
                            {isEditMode ? 'Edit Testimonial' : 'Add New Testimonial'}
                        </h1>
                        <button
                            onClick={() => navigate('/admin/testimonials')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                        >
                            <FaArrowLeft /> Back to List
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                                        Name*
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="position">
                                        Position*
                                    </label>
                                    <input
                                        type="text"
                                        id="position"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="quote">
                                    Testimonial Quote*
                                </label>
                                <textarea
                                    id="quote"
                                    name="quote"
                                    value={formData.quote}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="order">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        id="order"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Lower numbers appear first
                                    </p>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                    />
                                    <label className="ml-2 block text-gray-700 font-medium" htmlFor="isActive">
                                        Display on website
                                    </label>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Client Photo*
                                </label>

                                <div className="flex items-start space-x-6">
                                    {/* Image preview */}
                                    <div className="w-32 h-32 border border-gray-300 rounded-md overflow-hidden flex justify-center items-center bg-gray-50">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FaImage className="text-gray-400 text-4xl" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            id="image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="image"
                                            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md cursor-pointer transition-colors"
                                        >
                                            {imagePreview ? 'Change Image' : 'Upload Image'}
                                        </label>

                                        {!isEditMode && !imagePreview && (
                                            <p className="text-red-500 text-sm mt-2">
                                                Image is required for new testimonials
                                            </p>
                                        )}

                                        <p className="text-sm text-gray-500 mt-2">
                                            Recommended size: 300x300px. Max file size: 2MB.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-md transition-colors flex items-center gap-2"
                                    disabled={loading || isUploading || (!isEditMode && !imagePreview)}
                                >
                                    <FaSave /> {isEditMode ? 'Update Testimonial' : 'Save Testimonial'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTestimonialForm;