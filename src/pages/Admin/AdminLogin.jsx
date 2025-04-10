// src/pages/Admin/AdminLogin.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { signIn } = useClerk();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        if (!isLoaded || !isSignedIn) return;

        console.log('Admin login - attempting verification');

        // Get token without template (the template doesn't exist in Clerk)
        let token;
        try {
          token = await getToken();
          console.log('Got Clerk token:', token ? 'Yes (length: ' + token.length + ')' : 'No');
        } catch (err) {
          console.error('Error getting token:', err.message);
        }

        if (!token) {
          console.error('Failed to get any token from Clerk');
          toast.error('Authentication failed. Please sign in again.');
          return;
        }

        // Log token format for debugging (first 20 chars)
        console.log('Token format check:', token.substring(0, 20) + '...');

        const apiUrl = import.meta.env.VITE_API_URL || 'https://inty-backend.onrender.com/api';
        console.log('Using API URL:', apiUrl);
        
        const response = await fetch(`${apiUrl}/admin/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Admin verification response status:', response.status);
        
        if (response.ok) {
          console.log('Admin verification successful');
          
          // Store token in localStorage for future use
          localStorage.setItem('adminToken', token);
          
          // Get the last visited admin path or use the "from" state from the location
          const lastAdminPath = localStorage.getItem('lastAdminPath');
          const fromPath = location.state?.from?.pathname;
          
          // Navigate to last visited admin page, referrer page, or default to admin home
          if (lastAdminPath && lastAdminPath.startsWith('/admin/')) {
            console.log('Redirecting to last admin path:', lastAdminPath);
            navigate(lastAdminPath);
          } else if (fromPath && fromPath.startsWith('/admin/')) {
            console.log('Redirecting to referrer path:', fromPath);
            navigate(fromPath);
          } else {
            console.log('Redirecting to admin home');
            navigate('/admin/home');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Admin verification failed:', errorData.message || response.statusText);
          toast.error(errorData.message || 'Verification failed. You may not have admin privileges.');
          localStorage.removeItem("adminToken");
          localStorage.removeItem('lastAdminPath');
        }
      } catch (error) {
        console.error('Error verifying admin:', error);
        toast.error('Error during verification. Please try again.');
        localStorage.removeItem("adminToken");
        localStorage.removeItem('lastAdminPath');
      }
    };

    verifyAdmin();
  }, [isSignedIn, isLoaded, navigate, getToken, location.state]);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Admin Login</h2>
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            Please sign in with your admin account
          </p>
          {!isSignedIn && (
            <button
              onClick={() => signIn.authenticateWithRedirect({
                redirectUrl: window.location.href,
              })}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Sign in with Clerk
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;