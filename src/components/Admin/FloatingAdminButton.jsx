import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { FaUserShield } from 'react-icons/fa';

const FloatingAdminButton = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        if (!isLoaded || !isSignedIn) {
          setIsLoading(false);
          return;
        }

        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/verify-token`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setIsAdmin(response.ok);
        setIsLoading(false);
      } catch (error) {
        console.error('Error verifying admin access:', error);
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, [isSignedIn, isLoaded, getToken]);

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/admin/home')}
      className="fixed bottom-6 left-6 bg-[#006452] hover:bg-[#005443] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
      aria-label="Admin Dashboard"
    >
      <FaUserShield className="w-6 h-6" />
      <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        Admin Dashboard
      </span>
    </button>
  );
};

export default FloatingAdminButton; 