import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '@clerk/clerk-react';

const AdminSubscriptionPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    designerSubscriptions: 0,
    craftsmanSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    uniqueUsers: 0,
    recentPurchases: 0,
    recentPayments: []
  });
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    contactsCount: '',
    type: 'designer'
  });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const { getToken } = useAuth();

  // Get auth headers with Clerk token
  const getAuthHeaders = async () => {
    try {
      const token = await getToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Error getting auth token:', error);
      return {};
    }
  };

  // Fetch subscriptions and stats on component mount
  useEffect(() => {
    fetchSubscriptions();
    fetchSubscriptionStats();
  }, []);

  // Fetch subscription statistics
  const fetchSubscriptionStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const headers = await getAuthHeaders();
      const response = await axios.get(`${apiUrl}/subscriptions/stats/dashboard`, { headers });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      // Calculate some basic stats from the subscription list as fallback
      if (subscriptions.length > 0) {
        const activeCount = subscriptions.filter(sub => sub.isActive).length;
        const designerCount = subscriptions.filter(sub => sub.type === 'designer').length;
        const craftsmanCount = subscriptions.filter(sub => sub.type === 'craftsman').length;
        
        setStats({
          totalSubscriptions: subscriptions.length,
          activeSubscriptions: activeCount,
          designerSubscriptions: designerCount,
          craftsmanSubscriptions: craftsmanCount,
          totalRevenue: 0,
          monthlyRevenue: 0,
          uniqueUsers: 0,
          recentPurchases: 0,
          recentPayments: []
        });
      }
    }
  };

  // Fetch all subscriptions
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const headers = await getAuthHeaders();
      const response = await axios.get(`${apiUrl}/subscriptions`, { headers });
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' || name === 'contactsCount' ? Number(value) : value
    });
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Input validation
    if (!formData.name || !formData.amount || !formData.contactsCount) {
      toast.error('All fields are required');
      return;
    }
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const headers = await getAuthHeaders();
      
      if (editMode) {
        // Update existing subscription
        await axios.put(`${apiUrl}/subscriptions/${currentId}`, formData, { headers });
        toast.success('Subscription updated successfully');
      } else {
        // Create new subscription
        await axios.post(`${apiUrl}/subscriptions`, formData, { headers });
        toast.success('Subscription created successfully');
      }
      
      // Reset form and refresh list
      resetForm();
      fetchSubscriptions();
      fetchSubscriptionStats();
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast.error(`Failed to ${editMode ? 'update' : 'create'} subscription: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  // Reset form to default state
  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      contactsCount: '',
      type: 'designer'
    });
    setEditMode(false);
    setCurrentId(null);
  };

  // Populate form for editing
  const handleEdit = (subscription) => {
    setFormData({
      name: subscription.name,
      amount: subscription.amount,
      contactsCount: subscription.contactsCount,
      type: subscription.type
    });
    setEditMode(true);
    setCurrentId(subscription._id);
  };

  // Delete a subscription
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const headers = await getAuthHeaders();
        await axios.delete(`${apiUrl}/subscriptions/${id}`, { headers });
        toast.success('Subscription deleted successfully');
        fetchSubscriptions();
        fetchSubscriptionStats();
      } catch (error) {
        console.error('Error deleting subscription:', error);
        toast.error('Failed to delete subscription');
      }
    }
  };

  // Toggle subscription active status
  const toggleActive = async (subscription) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const headers = await getAuthHeaders();
      await axios.put(`${apiUrl}/subscriptions/${subscription._id}`, {
        isActive: !subscription.isActive
      }, { headers });
      toast.success(`Subscription ${subscription.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchSubscriptions();
      fetchSubscriptionStats();
    } catch (error) {
      console.error('Error toggling subscription status:', error);
      toast.error('Failed to update subscription status');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
      
      {/* Stats Dashboard */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Subscription Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 flex flex-col">
            <span className="text-sm opacity-80">Total Subscriptions</span>
            <span className="text-3xl font-bold mt-1">{stats.totalSubscriptions || 0}</span>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 flex flex-col">
            <span className="text-sm opacity-80">Active Subscriptions</span>
            <span className="text-3xl font-bold mt-1">{stats.activeSubscriptions || 0}</span>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 flex flex-col">
            <span className="text-sm opacity-80">Total Revenue</span>
            <span className="text-3xl font-bold mt-1">₹{stats.totalRevenue?.toLocaleString() || 0}</span>
          </div>
          
          <div className="bg-gradient-to-br from-[#006452] to-[#004d3b] text-white rounded-lg p-4 flex flex-col">
            <span className="text-sm opacity-80">Designer Subscriptions</span>
            <span className="text-3xl font-bold mt-1">{stats.designerSubscriptions || 0}</span>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg p-4 flex flex-col">
            <span className="text-sm opacity-80">Craftsman Subscriptions</span>
            <span className="text-3xl font-bold mt-1">{stats.craftsmanSubscriptions || 0}</span>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 flex flex-col">
            <span className="text-sm opacity-80">Monthly Revenue</span>
            <span className="text-3xl font-bold mt-1">₹{stats.monthlyRevenue?.toLocaleString() || 0}</span>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg p-4 flex flex-col">
            <span className="text-sm opacity-80">Unique Users</span>
            <span className="text-3xl font-bold mt-1">{stats.uniqueUsers || 0}</span>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg p-4 flex flex-col">
            <span className="text-sm opacity-80">Recent Purchases (30d)</span>
            <span className="text-3xl font-bold mt-1">{stats.recentPurchases || 0}</span>
          </div>
        </div>
        
        {/* Recent Payments Section */}
        {stats.recentPayments && stats.recentPayments.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Recent Purchases</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.userId.substring(0, 10)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.subscriptionName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ₹{payment.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Subscription Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Subscription' : 'Create New Subscription'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. Basic Plan"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (INR)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. 500"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contacts Count</label>
              <input
                type="number"
                name="contactsCount"
                value={formData.contactsCount}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. 5"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="designer">Interior Designer</option>
                <option value="craftsman">Craftsman</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              {editMode ? 'Update' : 'Create'}
            </button>
            
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Subscriptions List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">All Subscriptions</h2>
        
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <p className="text-gray-500 text-center p-4">No subscriptions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((subscription) => (
                  <tr key={subscription._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{subscription.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{subscription.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{subscription.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{subscription.contactsCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subscription.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {subscription.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(subscription)}
                        className={`${subscription.isActive ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'} mr-3`}
                      >
                        {subscription.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(subscription._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptionPage; 