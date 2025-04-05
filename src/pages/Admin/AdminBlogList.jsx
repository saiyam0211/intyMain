import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ResponsiveAdminContainer from '../../components/Admin/ResponsiveAdminContainer';

const API_URL = "http://localhost:3000/api/blogs";

const AdminBlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // For tracking loading states
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchBlogs();
  }, [navigate]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      console.log("Fetched blogs response:", response.data);
      
      if (Array.isArray(response.data)) {
        setBlogs(response.data);
        
        // Log the first blog to see its structure
        if (response.data.length > 0) {
          console.log("First blog data:", response.data[0]);
        }
      } else {
        throw new Error('Unexpected data format');
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/blogs/edit/${id}`);
  };

  const handleAdd = () => {
    navigate('/admin/blogs/add');
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the blog post "${title}"?`)) {
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
      
      setSuccessMessage(`Blog post "${title}" deleted successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh the list
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting blog post:', err);
      setError(err.response?.data?.message || 'Failed to delete blog post. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Format date nicely with error handling
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      console.error('Error formatting date:', dateString, err);
      return 'Invalid date';
    }
  };

  // Truncate text for table display
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <ResponsiveAdminContainer title="Blog Posts" showBackButton={true}>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Success message */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {error}
            <button 
              className="ml-2 text-red-500 hover:text-red-700" 
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Add new blog button */}
        <div className="px-4 py-3 sm:px-6 flex justify-between items-center bg-gray-50 border-b">
          <h2 className="text-lg sm:text-xl font-medium text-gray-800">All Blog Posts</h2>
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white text-sm sm:text-base rounded hover:bg-green-700 transition-colors"
          >
            Add New Blog
          </button>
        </div>

        {/* Blog list */}
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading blog posts...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No blog posts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm sm:text-base font-medium text-gray-900">{truncateText(blog.title, 30)}</div>
                      <div className="sm:hidden text-xs text-gray-500">{blog.author}</div>
                      {/* For mobile view, show date from timestamp field */}
                      <div className="sm:hidden text-xs text-gray-500">{formatDate(blog.timestamp)}</div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap">
                      <div className="text-sm sm:text-base text-gray-900">{blog.author}</div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                      {/* Changed from createdAt to timestamp */}
                      <div className="text-sm sm:text-base text-gray-900">{formatDate(blog.timestamp)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(blog._id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id, blog.title)}
                        className="text-red-600 hover:text-red-900"
                        disabled={actionLoading === `delete-${blog._id}`}
                      >
                        {actionLoading === `delete-${blog._id}` ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ResponsiveAdminContainer>
  );
};

export default AdminBlogList;