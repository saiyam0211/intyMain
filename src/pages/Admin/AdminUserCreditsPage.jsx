import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '@clerk/clerk-react';
import ResponsiveAdminContainer from '../../components/Admin/ResponsiveAdminContainer';

const AdminUserCreditsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [welcomeCredits, setWelcomeCredits] = useState({
    designer: 3,
    craftsman: 3
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditsToAdd, setCreditsToAdd] = useState({
    designerCredits: 0,
    craftsmanCredits: 0
  });
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

  // Fetch users with credits on component mount
  useEffect(() => {
    fetchUsers();
    fetchWelcomeCreditsSettings();
  }, []);

  // Fetch all users with their credits
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/credits`, { headers });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch welcome credits settings
  const fetchWelcomeCreditsSettings = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/welcome-credits-settings`, { headers });
      setWelcomeCredits(response.data.welcomeCredits);
    } catch (error) {
      console.error('Error fetching welcome credits settings:', error);
      toast.error('Failed to fetch welcome credits settings');
    }
  };

  // Update welcome credits settings
  const updateWelcomeCreditsSettings = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/welcome-credits-settings`, 
        welcomeCredits,
        { headers }
      );
      toast.success('Welcome credits settings updated successfully');
    } catch (error) {
      console.error('Error updating welcome credits settings:', error);
      toast.error('Failed to update welcome credits settings');
    }
  };

  // Add credits to a specific user
  const addCreditsToUser = async () => {
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    if (creditsToAdd.designerCredits <= 0 && creditsToAdd.craftsmanCredits <= 0) {
      toast.error('Please enter a positive number of credits');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/credits`,
        {
          userId: selectedUser.userId,
          designerCredits: parseInt(creditsToAdd.designerCredits) || 0,
          craftsmanCredits: parseInt(creditsToAdd.craftsmanCredits) || 0
        },
        { headers }
      );

      toast.success('Credits added successfully');
      // Refresh users list
      fetchUsers();
      // Reset form
      setSelectedUser(null);
      setCreditsToAdd({
        designerCredits: 0,
        craftsmanCredits: 0
      });
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits');
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ResponsiveAdminContainer backTo="/admin/home" pageTitle="User Credits Management">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Welcome Credits Settings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Welcome Credits Settings</h2>
            <p className="text-gray-600 mb-4">
              Set the number of free credits new users receive upon registration.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designer Credits for New Users
                </label>
                <input
                  type="number"
                  value={welcomeCredits.designer}
                  onChange={(e) => setWelcomeCredits({
                    ...welcomeCredits,
                    designer: parseInt(e.target.value)
                  })}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Craftsman Credits for New Users
                </label>
                <input
                  type="number"
                  value={welcomeCredits.craftsman}
                  onChange={(e) => setWelcomeCredits({
                    ...welcomeCredits,
                    craftsman: parseInt(e.target.value)
                  })}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <button
                onClick={updateWelcomeCreditsSettings}
                className="w-full bg-[#006452] text-white py-2 px-4 rounded-md hover:bg-[#005443]"
              >
                Update Welcome Credits
              </button>
            </div>
          </div>
          
          {/* Add Credits to User */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Add Credits to User</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select User
                </label>
                <select
                  value={selectedUser ? selectedUser.userId : ""}
                  onChange={(e) => {
                    const user = users.find(u => u.userId === e.target.value);
                    setSelectedUser(user || null);
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.userId.substring(0, 8)}... ({user.designerCredits}/{user.craftsmanCredits} credits)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designer Credits to Add
                </label>
                <input
                  type="number"
                  value={creditsToAdd.designerCredits}
                  onChange={(e) => setCreditsToAdd({
                    ...creditsToAdd,
                    designerCredits: parseInt(e.target.value)
                  })}
                  min="0"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Craftsman Credits to Add
                </label>
                <input
                  type="number"
                  value={creditsToAdd.craftsmanCredits}
                  onChange={(e) => setCreditsToAdd({
                    ...creditsToAdd,
                    craftsmanCredits: parseInt(e.target.value)
                  })}
                  min="0"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <button
                onClick={addCreditsToUser}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Add Credits
              </button>
            </div>
          </div>
          
          {/* Selected User Details */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">User Details</h2>
            
            {selectedUser ? (
              <div className="space-y-2">
                <p><span className="font-medium">User ID:</span> {selectedUser.userId}</p>
                <p><span className="font-medium">Designer Credits:</span> {selectedUser.designerCredits}</p>
                <p><span className="font-medium">Craftsman Credits:</span> {selectedUser.craftsmanCredits}</p>
                <p><span className="font-medium">Received Welcome Credits:</span> {selectedUser.receivedWelcomeCredits ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">Created:</span> {formatDate(selectedUser.createdAt)}</p>
                <p><span className="font-medium">Last Updated:</span> {formatDate(selectedUser.updatedAt)}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">Select a user to view details</p>
            )}
          </div>
        </div>
        
        {/* Users Table */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold mb-4">All Users ({users.length})</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006452]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designer Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Craftsman Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Welcome Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.userId.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.designerCredits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.craftsmanCredits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.receivedWelcomeCredits ? 
                          <span className="text-green-600">Received</span> : 
                          <span className="text-red-600">Not Received</span>
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-[#006452] hover:text-[#005443]"
                        >
                          Select
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
    </ResponsiveAdminContainer>
  );
};

export default AdminUserCreditsPage;
