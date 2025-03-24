// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const ProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        if (!isLoaded || !isSignedIn) {
          setIsLoading(false);
          return;
        }

        const token = await getToken();
        console.log('Verifying admin access with token');

        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/verify-token`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Admin verification response:', response.status);
        const isAdminUser = response.ok;
        setIsAdmin(isAdminUser);
        
        // Store or remove token from localStorage based on admin verification
        if (isAdminUser) {
          localStorage.setItem("adminToken", token);
        } else {
          localStorage.removeItem("adminToken");
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error verifying admin access:', error);
        setIsAdmin(false);
        localStorage.removeItem("adminToken");
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, [isSignedIn, isLoaded, getToken]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;