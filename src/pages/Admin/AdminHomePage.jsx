import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaBuilding, 
  FaPaintBrush, 
  FaTools, 
  FaBlog, 
  FaQuoteRight, 
  FaEnvelope, 
  FaAddressBook, 
  FaFileExport, 
  FaFileImport, 
  FaSignOutAlt,
  FaCreditCard,
  FaCoins,
  FaCheckCircle,
  FaExclamationCircle,
  FaFilter
} from 'react-icons/fa';

const AdminHomePage = () => {
    const navigate = useNavigate();
    const [pendingReviews, setPendingReviews] = useState({
        designers: 0,
        craftsmen: 0,
        companies: 0,
        loading: true,
        error: null
    });

    // Fetch pending reviews count on component mount
    useEffect(() => {
        const fetchPendingReviews = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                if (!token) {
                    navigate("/admin/login");
                    return;
                }

                // Fetch designers that need approval (isListed = false)
                const designersResponse = await axios.get('https://inty-backend.onrender.com/api/designers?showAll=true', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Fetch craftsmen that need approval (isListed = false)
                const craftsmenResponse = await axios.get('https://inty-backend.onrender.com/api/craftsmen?showAll=true', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const pendingDesigners = designersResponse.data && designersResponse.data.designers ? 
                    designersResponse.data.designers.filter(d => !d.isListed).length : 0;
                
                const pendingCraftsmen = craftsmenResponse.data && craftsmenResponse.data.craftsmen ? 
                    craftsmenResponse.data.craftsmen.filter(c => !c.isListed).length : 0;

                setPendingReviews({
                    designers: pendingDesigners,
                    craftsmen: pendingCraftsmen,
                    companies: 0,
                    loading: false
                });
            } catch (error) {
                console.error('Error fetching pending reviews:', error);
                setPendingReviews(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to fetch pending reviews'
                }));
            }
        };

        fetchPendingReviews();
    }, [navigate]);

    // Admin menu items with icons and descriptions
    const menuItems = [
        {
            title: 'Manage Companies',
            description: 'Add, edit, or remove companies',
            icon: <FaBuilding className="text-3xl sm:text-4xl mb-3" />,
            path: '/admin/showCompanies',
            color: 'bg-gradient-to-br from-red-500 to-red-600'
        },
        {
            title: 'Manage Interior Designers',
            description: 'Add, edit, or remove designers',
            icon: <FaPaintBrush className="text-3xl sm:text-4xl mb-3" />,
            path: '/admin/designers',
            color: 'bg-gradient-to-br from-[#006452] to-[#004d3b]'
        },
        {
            title: 'Manage Craftsmen',
            description: 'Add, edit, or remove craftsmen',
            icon: <FaTools className="text-3xl sm:text-4xl mb-3" />,
            path: '/admin/craftsmen',
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
        },
        {
            title: 'Manage Blog Posts',
            description: 'Create and edit blog content',
            icon: <FaBlog className="text-3xl sm:text-4xl mb-3" />,
            path: '/admin/blogs',
            color: 'bg-gradient-to-br from-purple-500 to-purple-600'
        },
        {
            title: 'Manage Subscriptions',
            description: 'Create and manage subscription plans',
            icon: <FaCreditCard className="text-3xl sm:text-4xl mb-3" />,
            path: '/admin/subscriptions',
            color: 'bg-gradient-to-br from-green-500 to-green-600'
        },
        {
            title: 'User Credits',
            description: 'Manage user credits and welcome bonuses',
            icon: <FaCoins className="text-3xl sm:text-4xl mb-3" />,
            path: '/admin/user-credits',
            color: 'bg-gradient-to-br from-yellow-500 to-yellow-600'
        },
        {
            title: 'Manage Testimonials',
            description: 'Add or edit customer testimonials',
            icon: <FaQuoteRight className="text-3xl sm:text-4xl mb-3" />,
            path: '/admin/testimonials',
            color: 'bg-gradient-to-br from-amber-500 to-amber-600'
        },
        {
            title: 'View Enquiries',
            description: 'Check customer enquiries',
            icon: <FaEnvelope className="text-3xl sm:text-4xl mb-3" />,
            path: '/admin/enquiries',
            color: 'bg-gradient-to-br from-green-500 to-green-600'
        },
        {
            title: 'View Contacts',
            description: 'Check contact form submissions',
            icon: <FaAddressBook className="text-3xl sm:text-4xl mb-3" />,
            path: '/admin/contacts',
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
        },
        {
            title: 'User Filters & Search',
            description: 'View user search behavior and filter usage',
            icon: <FaFilter className="text-3xl sm:text-4xl mb-3" />,
            path: '/admin/user-filters',
            color: 'bg-gradient-to-br from-pink-500 to-pink-600'
        },
        {
            title: 'Export Database Data',
            description: 'Download data as CSV or JSON',
            icon: <FaFileExport className="text-3xl sm:text-4xl mb-3" />,
            path: '/admin/export-data',
            color: 'bg-gradient-to-br from-teal-500 to-teal-600'
        },
        {
            title: 'Import Database Data',
            description: 'Upload data from CSV or JSON',
            icon: <FaFileImport className="text-3xl sm:text-4xl mb-3" />,
            path: '/admin/import-data',
            color: 'bg-gradient-to-br from-orange-500 to-orange-600'
        }
    ];

    return (
        <div className='bg-gray-50 min-h-screen'>
            <div className="absolute top-0 left-0 w-full bg-transparent z-50">
                <Navbar isResidentialPage={false} />
            </div>
            
            <div className='w-full pt-24 pb-16 px-4 sm:px-6 md:px-8'>
                {/* Header with welcome message */}
                <div className="max-w-6xl mx-auto mb-10 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Welcome to the inty admin panel. Manage your website content, view customer inquiries, and more.
                    </p>
                </div>

                {/* Pending Reviews Section */}
                {/* <div className="max-w-6xl mx-auto mb-10">
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                            <FaExclamationCircle className="text-amber-500 mr-2" />
                            Pending Reviews
                        </h2>
                        
                        {pendingReviews.loading ? (
                            <div className="flex justify-center p-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                            </div>
                        ) : pendingReviews.error ? (
                            <div className="bg-red-50 p-4 rounded-lg text-red-700 text-sm">
                                {pendingReviews.error}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <FaPaintBrush className="text-yellow-500 text-xl mr-2" />
                                            <span className="font-medium">Designers</span>
                                        </div>
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                                            {pendingReviews.designers}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Awaiting approval</p>
                                </div>
                                
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <FaTools className="text-yellow-500 text-xl mr-2" />
                                            <span className="font-medium">Craftsmen</span>
                                        </div>
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                                            {pendingReviews.craftsmen}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Awaiting approval</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div> */}

                {/* Admin menu grid */}
                <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            className={`${item.color} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer`}
                            onClick={() => navigate(item.path)}
                        >
                            <div className="h-full p-6 flex flex-col items-center justify-center text-white text-center">
                                {item.icon}
                                <h2 className='text-lg sm:text-xl font-bold mb-2'>{item.title}</h2>
                                <p className="text-sm text-white/80">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logout button */}
                <div className="w-full flex justify-center mt-10">
                    <button
                        onClick={() => {
                            localStorage.removeItem("adminToken");
                            navigate("/admin/login");
                        }}
                        className="flex items-center bg-gray-700 hover:bg-gray-800 text-white px-5 py-3 rounded-lg transition-colors shadow-md"
                    >
                        <FaSignOutAlt className="mr-2" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminHomePage;