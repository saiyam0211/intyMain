import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
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
  FaSignOutAlt 
} from 'react-icons/fa';

const AdminHomePage = () => {
    const navigate = useNavigate();

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
                        Welcome to the Inty admin panel. Manage your website content, view customer inquiries, and more.
                    </p>
                </div>

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