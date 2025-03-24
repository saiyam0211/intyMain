import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminResponsive.css';

/**
 * A responsive container component for admin pages
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to display
 * @param {string} props.title - The page title
 * @param {boolean} props.showBackButton - Whether to show a back button
 * @param {string} props.backTo - The path to navigate to when back button is clicked
 * @param {boolean} props.fullWidth - Whether the container should take full width
 */
const ResponsiveAdminContainer = ({ 
  children, 
  title, 
  showBackButton = false, 
  backTo = '/admin/home',
  fullWidth = false
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white shadow-md mb-6">
        <div className="admin-container py-4 sm:py-6">
          <div className="admin-flex admin-items-center admin-justify-between">
            <div className="flex items-center">
              {showBackButton && (
                <button
                  onClick={() => navigate(backTo)}
                  className="mr-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <h1 className="admin-heading text-gray-800">{title}</h1>
            </div>
            <button
              onClick={() => navigate('/admin/home')}
              className="admin-btn bg-blue-600 text-white hover:bg-blue-700"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${fullWidth ? 'w-full' : 'admin-container'}`}>
        {children}
      </div>
    </div>
  );
};

export default ResponsiveAdminContainer; 