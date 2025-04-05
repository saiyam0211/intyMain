import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';

const AdminEnquiriesPage = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    
    const navigate = useNavigate();

    // Fetch enquiries on component mount
    useEffect(() => {
        const fetchEnquiries = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                
                if (!token) {
                    navigate('/admin/login');
                    return;
                }
                
                // Get the base URL based on environment
                const baseURL = process.env.NODE_ENV === 'production' 
                    ? 'https://inty-backend.onrender.com' 
                    : 'https://inty-backend.onrender.com';
                
                const response = await axios.get(`${baseURL}/api/contact/enquiries`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setEnquiries(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching enquiries:', error);
                setError('Failed to load enquiries. Please try again later.');
                setLoading(false);
                
                if (error.response && error.response.status === 401) {
                    // Unauthorized, redirect to login
                    localStorage.removeItem('adminToken');
                    navigate('/admin/login');
                }
            }
        };
        
        fetchEnquiries();
    }, [navigate]);

    // Handle status update
    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                navigate('/admin/login');
                return;
            }
            
            // Get the base URL based on environment
            const baseURL = process.env.NODE_ENV === 'production' 
                ? 'https://inty-backend.onrender.com' 
                : 'https://inty-backend.onrender.com';
            
            await axios.patch(
                `${baseURL}/api/contact/enquiry/${id}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            // Update local state
            setEnquiries(enquiries.map(enquiry => 
                enquiry._id === id ? { ...enquiry, status: newStatus } : enquiry
            ));
            
            // Update selected enquiry if open in modal
            if (selectedEnquiry && selectedEnquiry._id === id) {
                setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    // Mark as read
    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                navigate('/admin/login');
                return;
            }
            
            // Get the base URL based on environment
            const baseURL = process.env.NODE_ENV === 'production' 
                ? 'https://inty-backend.onrender.com' 
                : 'https://inty-backend.onrender.com';
            
            await axios.patch(
                `${baseURL}/api/contact/enquiry/${id}/read`, 
                {},
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            // Update local state
            setEnquiries(enquiries.map(enquiry => 
                enquiry._id === id ? { ...enquiry, isRead: true } : enquiry
            ));
            
            // Update selected enquiry if open in modal
            if (selectedEnquiry && selectedEnquiry._id === id) {
                setSelectedEnquiry({ ...selectedEnquiry, isRead: true });
            }
        } catch (error) {
            console.error('Error marking as read:', error);
            alert('Failed to mark as read. Please try again.');
        }
    };

    // Delete enquiry
    const deleteEnquiry = async (id) => {
        if (!window.confirm('Are you sure you want to delete this enquiry?')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                navigate('/admin/login');
                return;
            }
            
            // Get the base URL based on environment
            const baseURL = process.env.NODE_ENV === 'production' 
                ? 'https://inty-backend.onrender.com' 
                : 'https://inty-backend.onrender.com';
            
            await axios.delete(
                `${baseURL}/api/contact/enquiry/${id}`, 
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            // Update local state
            setEnquiries(enquiries.filter(enquiry => enquiry._id !== id));
            
            // Close modal if the deleted enquiry was selected
            if (selectedEnquiry && selectedEnquiry._id === id) {
                setIsModalOpen(false);
                setSelectedEnquiry(null);
            }
        } catch (error) {
            console.error('Error deleting enquiry:', error);
            alert('Failed to delete enquiry. Please try again.');
        }
    };

    // Open modal with selected enquiry
    const openEnquiryModal = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setIsModalOpen(true);
        
        // Mark as read if not already read
        if (!enquiry.isRead) {
            markAsRead(enquiry._id);
        }
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEnquiry(null);
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Filter enquiries based on status
    const filteredEnquiries = filterStatus === 'all' 
        ? enquiries 
        : enquiries.filter(enquiry => enquiry.status === filterStatus);

    // Get status badge color
    const getStatusColor = (status) => {
        switch(status) {
            case 'new':
                return 'bg-blue-100 text-blue-800';
            case 'in-progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Count unread enquiries
    const unreadCount = enquiries.filter(enquiry => !enquiry.isRead).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="absolute top-0 left-0 w-full bg-transparent z-50">
                <Navbar isResidentialPage={false} />
            </div>
            
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Enquiries Management</h1>
                    <button 
                        onClick={() => navigate('/admin')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white shadow rounded-lg mb-6">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">All Enquiries</h2>
                                        <p className="text-sm text-gray-500">
                                            Total: {enquiries.length} | Unread: {unreadCount}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <span className="mr-2 text-sm text-gray-600">Filter:</span>
                                        <select 
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="new">New</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredEnquiries.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No enquiries found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredEnquiries.map((enquiry) => (
                                                <tr 
                                                    key={enquiry._id} 
                                                    className={!enquiry.isRead ? 'bg-green-50' : ''}
                                                    onClick={() => openEnquiryModal(enquiry)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="ml-0">
                                                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                                                    {enquiry.name}
                                                                    {!enquiry.isRead && (
                                                                        <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-500">{enquiry.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{enquiry.companyName}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">{formatDate(enquiry.createdAt)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(enquiry.status)}`}>
                                                            {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEnquiryModal(enquiry);
                                                            }}
                                                            className="text-green-600 hover:text-green-900 mr-3"
                                                        >
                                                            View
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteEnquiry(enquiry._id);
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            {/* Enquiry Details Modal */}
            {isModalOpen && selectedEnquiry && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                                            Enquiry Details
                                        </h3>
                                        
                                        <div className="mt-4 bg-gray-50 p-4 rounded-md">
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-500">From</p>
                                                <p className="text-base">{selectedEnquiry.name}</p>
                                                <p className="text-sm text-gray-600">{selectedEnquiry.email}</p>
                                                <p className="text-sm text-gray-600">{selectedEnquiry.mobile}</p>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-500">Company</p>
                                                <p className="text-base">{selectedEnquiry.companyName}</p>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-500">Sent on</p>
                                                <p className="text-sm">{formatDate(selectedEnquiry.createdAt)}</p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-2">Message</p>
                                                <div className="bg-white p-3 rounded border border-gray-200">
                                                    <p className="text-sm whitespace-pre-wrap">{selectedEnquiry.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Update Status
                                            </label>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => updateStatus(selectedEnquiry._id, 'new')}
                                                    className={`px-3 py-1 text-xs rounded-full ${selectedEnquiry.status === 'new' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
                                                >
                                                    New
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(selectedEnquiry._id, 'in-progress')}
                                                    className={`px-3 py-1 text-xs rounded-full ${selectedEnquiry.status === 'in-progress' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800'}`}
                                                >
                                                    In Progress
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(selectedEnquiry._id, 'completed')}
                                                    className={`px-3 py-1 text-xs rounded-full ${selectedEnquiry.status === 'completed' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
                                                >
                                                    Completed
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(selectedEnquiry._id, 'rejected')}
                                                    className={`px-3 py-1 text-xs rounded-full ${selectedEnquiry.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'}`}
                                                >
                                                    Rejected
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteEnquiry(selectedEnquiry._id)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEnquiriesPage;