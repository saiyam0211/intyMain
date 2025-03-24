// src/pages/Admin/AdminLogin.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { signIn } = useClerk();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        if (!isLoaded || !isSignedIn) return;

        const token = await getToken();
        console.log('Got Clerk token:', token);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Admin verification response:', response.status);
        
        if (response.ok) {
          console.log('Admin verified, redirecting to dashboard');
          // Store the token in localStorage for backward compatibility with pages 
          // that use localStorage.getItem("adminToken")
          localStorage.setItem("adminToken", token);
          navigate('/admin/home');
        } else {
          console.error('Admin verification failed:', await response.text());
          localStorage.removeItem("adminToken");
          navigate('/');
        }
      } catch (error) {
        console.error('Error verifying admin:', error);
        localStorage.removeItem("adminToken");
        navigate('/');
      }
    };

    verifyAdmin();
  }, [isSignedIn, isLoaded, navigate, getToken]);

  if (!isLoaded) {
    return <div>Loading...</div>;
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
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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