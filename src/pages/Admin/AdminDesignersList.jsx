import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const API_URL = "http://localhost:3000/api/designers";

const AdminDesignersList = () => {
  const navigate = useNavigate();
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // For tracking loading states (delete, list, unlist)
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchDesigners();
  }, [navigate]);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      // Add showAll=true to make sure we get all designers including unlisted ones
      const response = await axios.get(`${API_URL}?showAll=true`);
      console.log("Fetched designers response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Sort designers by order to ensure correct display
        const sortedDesigners = response.data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setDesigners(sortedDesigners);
      } else if (response.data && Array.isArray(response.data.data)) {
        const sortedDesigners = response.data.data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setDesigners(sortedDesigners);
      } else {
        throw new Error('Unexpected data format');
      }
    } catch (err) {
      console.error('Error fetching designers:', err);
      setError('Failed to load designers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/designers/edit/${id}`);
  };

  const handleAdd = () => {
    navigate('/admin/designers/add');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the designer "${name}"?`)) {
      return;
    }

    try {
      setActionLoading(`delete-${id}`);
      const token = localStorage.getItem("adminToken");
      
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      
      setSuccessMessage(`Designer "${name}" deleted successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh the list
      fetchDesigners();
    } catch (err) {
      console.error('Error deleting designer:', err);
      setError(err.response?.data?.message || 'Failed to delete designer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle listing/unlisting a designer - using the standard update endpoint
  const handleListingToggle = async (id, name, currentStatus) => {
    const action = currentStatus ? 'unlist' : 'list';
    const actionText = currentStatus ? 'unlisted' : 'listed';
    
    try {
      setActionLoading(`status-${id}`);
      const token = localStorage.getItem("adminToken");
      
      // Use the standard update endpoint instead of toggle-status
      await axios.put(`${API_URL}/${id}`, 
        { 
          show: !currentStatus // Toggle the current status
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
      
      setSuccessMessage(`Designer "${name}" ${actionText} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh the list
      fetchDesigners();
    } catch (err) {
      console.error(`Error ${action}ing designer:`, err);
      setError(err.response?.data?.message || `Failed to ${action} designer. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  // Order management functions
  const handleMoveUp = (index) => {
    if (index > 0) {
      const currentItem = designers[index];
      const prevItem = designers[index - 1];
      updateOrder(currentItem._id, prevItem.order - 0);
    }
  };

  const handleMoveDown = (index) => {
    if (index < designers.length - 0) {
      const currentItem = designers[index];
      const nextItem = designers[index + 1];
      updateOrder(currentItem._id, nextItem.order + 0);
    }
  };

  const updateOrder = async (id, newOrder) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      await axios.put(`${API_URL}/${id}`, 
        { 
          order: newOrder
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
      
      // Refresh the list
      fetchDesigners();
      
      // Optional: Add a success message
      setSuccessMessage('Designer order updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating designer order:', err);
      setError(err.response?.data?.message || 'Failed to update designer order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative top-0 left-0 w-full bg-transparent z-50">
        <Navbar isResidentialPage={false} />
      </div>

      <div className="container mx-auto pt-24 px-4 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Interior Designers</h1>
          <button 
            onClick={handleAdd}
            className="bg-[#006452] hover:bg-[#004d3b] text-white px-4 py-2 rounded-md transition-colors"
          >
            Add New Designer
          </button>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006452]"></div>
          </div>
        ) : designers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No designers found. Click "Add New Designer" to create one.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Portfolio
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {designers.map((designer, index) => (
                  <tr key={designer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-gray-900 mr-3">{designer.order || '0'}</span>
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
                            disabled={index === designers.length - 1}
                            className={`text-gray-500 ${index === designers.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-700'}`}
                          >
                            <FaArrowDown />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{designer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{designer.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{designer.rate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{designer.rating} ★</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                        designer.show !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {designer.show !== false ? 'Listed' : 'Unlisted'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {Array.isArray(designer.portfolio) ? `${designer.portfolio.length} images` : '0 images'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(designer._id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleListingToggle(designer._id, designer.name, designer.show !== false)}
                        className={`mr-4 ${designer.show !== false ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                        disabled={actionLoading === `status-${designer._id}`}
                      >
                        {actionLoading === `status-${designer._id}` ? 'Processing...' : 
                          (designer.show !== false ? 'Unlist' : 'List')}
                      </button>
                      <button
                        onClick={() => handleDelete(designer._id, designer.name)}
                        className="text-red-600 hover:text-red-900"
                        disabled={actionLoading === `delete-${designer._id}`}
                      >
                        {actionLoading === `delete-${designer._id}` ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => navigate('/admin/home')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors"
          >
            Back to Admin Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDesignersList;