import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const API_URL = "https://inty-backend.onrender.com/api/craftsmen";

const AdminCraftsmenList = () => {
  const navigate = useNavigate();
  const [craftsmen, setCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // For tracking loading states (delete, list, unlist)
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingCraftsmen, setPendingCraftsmen] = useState([]);
  const [listedCraftsmen, setListedCraftsmen] = useState([]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchCraftsmen();
  }, [navigate]);

  const fetchCraftsmen = async () => {
    try {
      setLoading(true);
      // Add showAll=true to make sure we get all craftsmen including unlisted ones
      const response = await axios.get(`${API_URL}?showAll=true`);
      console.log("Fetched craftsmen response:", response.data);
      
      let allCraftsmen = [];
      if (response.data && Array.isArray(response.data)) {
        allCraftsmen = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        allCraftsmen = response.data.data;
      } else {
        throw new Error('Unexpected data format');
      }
      
      // Sort craftsmen by order to ensure correct display
      const sortedCraftsmen = allCraftsmen.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Split into pending and listed craftsmen
      const pending = sortedCraftsmen.filter(craftsman => 
        craftsman.isListed === false || craftsman.show === false
      );
      
      const listed = sortedCraftsmen.filter(craftsman => 
        craftsman.isListed !== false && craftsman.show !== false
      );
      
      setCraftsmen(sortedCraftsmen);
      setPendingCraftsmen(pending);
      setListedCraftsmen(listed);
    } catch (err) {
      console.error('Error fetching craftsmen:', err);
      setError('Failed to load craftsmen. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/craftsmen/edit/${id}`);
  };

  const handleAdd = () => {
    navigate('/admin/craftsmen/add');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the craftsman "${name}"?`)) {
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
      
      setSuccessMessage(`Craftsman "${name}" deleted successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh the list
      fetchCraftsmen();
    } catch (err) {
      console.error('Error deleting craftsman:', err);
      setError(err.response?.data?.message || 'Failed to delete craftsman. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle listing/unlisting a craftsman - using the standard update endpoint
  const handleListingToggle = async (id, name, currentStatus) => {
    const action = currentStatus ? 'unlist' : 'list';
    const actionText = currentStatus ? 'unlisted' : 'listed';
    
    try {
      setActionLoading(`status-${id}`);
      const token = localStorage.getItem("adminToken");
      
      // Use the standard update endpoint instead of toggle-status
      await axios.put(`${API_URL}/${id}`, 
        { 
          show: !currentStatus, // Toggle the current status
          isListed: !currentStatus // Also update the isListed field
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
      
      setSuccessMessage(`Craftsman "${name}" ${actionText} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh the list
      fetchCraftsmen();
    } catch (err) {
      console.error(`Error ${action}ing craftsman:`, err);
      setError(err.response?.data?.message || `Failed to ${action} craftsman. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  // Order management functions
  const handleMoveUp = (index) => {
    if (index > 0) {
      const currentItem = craftsmen[index];
      const prevItem = craftsmen[index - 1];
      updateOrder(currentItem._id, prevItem.order - 0);
    }
  };

  const handleMoveDown = (index) => {
    if (index < craftsmen.length - 1) {
      const currentItem = craftsmen[index];
      const nextItem = craftsmen[index + 1];
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
      fetchCraftsmen();
      
      // Optional: Add a success message
      setSuccessMessage('Craftsman order updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating craftsman order:', err);
      setError(err.response?.data?.message || 'Failed to update craftsman order. Please try again.');
    }
  };

  const renderCraftsmanTable = (craftsmenList, isPending = false) => {
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={`${isPending ? 'bg-amber-50' : 'bg-gray-50'}`}>
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
              Category
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
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className={`${isPending ? 'bg-amber-50/30' : 'bg-white'} divide-y divide-gray-200`}>
          {craftsmenList.map((craftsman, index) => (
            <tr key={craftsman._id} className={`${isPending ? 'hover:bg-amber-50/50' : 'hover:bg-gray-50'} ${isPending && 'animate-pulse-slow'}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-gray-900 mr-3">{craftsman.order || '0'}</span>
                  <div className="flex flex-col">
                    <button 
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || isPending}
                      className={`text-gray-500 ${index === 0 || isPending ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-700'}`}
                    >
                      <FaArrowUp />
                    </button>
                    <button 
                      onClick={() => handleMoveDown(index)}
                      disabled={index === craftsmenList.length - 1 || isPending}
                      className={`text-gray-500 ${index === craftsmenList.length - 1 || isPending ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-700'}`}
                    >
                      <FaArrowDown />
                    </button>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{craftsman.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{craftsman.location}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{craftsman.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{craftsman.rate}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{craftsman.rating} ★</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                  isPending ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {isPending ? 'Pending Approval' : 'Listed'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleEdit(craftsman._id)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleListingToggle(craftsman._id, craftsman.name, !isPending)}
                  className={`mr-4 ${isPending ? 'text-green-600 hover:text-green-800' : 'text-yellow-600 hover:text-yellow-800'}`}
                  disabled={actionLoading === `status-${craftsman._id}`}
                >
                  {actionLoading === `status-${craftsman._id}` ? 'Processing...' : 
                    (isPending ? 'Approve & List' : 'Unlist')}
                </button>
                <button
                  onClick={() => handleDelete(craftsman._id, craftsman.name)}
                  className="text-red-600 hover:text-red-900"
                  disabled={actionLoading === `delete-${craftsman._id}`}
                >
                  {actionLoading === `delete-${craftsman._id}` ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative top-0 left-0 w-full bg-transparent z-50">
        <Navbar isResidentialPage={false} />
      </div>

      <div className="container mx-auto pt-24 px-4 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Craftsmen</h1>
          <button 
            onClick={handleAdd}
            className="bg-[#006452] hover:bg-[#004d3b] text-white px-4 py-2 rounded-md transition-colors"
          >
            Add New Craftsman
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
        ) : craftsmen.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No craftsmen found. Click "Add New Craftsman" to create one.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Craftsmen */}
            {pendingCraftsmen.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-amber-700 mb-4 flex items-center">
                  <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                  Pending Approval ({pendingCraftsmen.length})
                </h2>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-amber-500">
                  {renderCraftsmanTable(pendingCraftsmen, true)}
                </div>
              </div>
            )}

            {/* Listed Craftsmen */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Listed Craftsmen ({listedCraftsmen.length})
              </h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {renderCraftsmanTable(listedCraftsmen, false)}
              </div>
            </div>
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

export default AdminCraftsmenList;