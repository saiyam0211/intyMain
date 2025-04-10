import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Popup component that prompts users to provide search inputs
 * for better company recommendations
 */
const SearchPromptPopup = ({ isLoggedIn, onClose, onStartSearch }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#006452] to-[#00836b] p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Find Your Perfect Match</h3>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="text-gray-700 mb-6">
            {isLoggedIn ? (
              <>
                <p className="mb-3">
                  Welcome back! To help you find the best interior designers for your project, please provide a few details about what you're looking for.
                </p>
                <p className="mb-3">
                  Our advanced matching algorithm can find companies that perfectly match your requirements when you tell us:
                </p>
                <ul className="list-disc ml-5 mb-3 space-y-1">
                  <li>Your project type (Residential or Commercial)</li>
                  <li>Space requirements (1BHK, 2BHK, Kitchen, etc.)</li>
                  <li>Area size (in sq ft)</li>
                  <li>Budget range</li>
                </ul>
              </>
            ) : (
              <>
                <p className="mb-3">
                  Welcome to Inty! We're showing you our top companies, but we can help you find the perfect match for your interior design needs.
                </p>
                <p className="mb-3">
                  For personalized recommendations and to see all available companies:
                </p>
                <ul className="list-disc ml-5 mb-3 space-y-1">
                  <li>Create a free account</li>
                  <li>Tell us about your project details</li>
                  <li>Get matched with the perfect designers</li>
                </ul>
              </>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={onStartSearch}
                  className="bg-[#006452] hover:bg-[#005443] text-white px-4 py-2 rounded-md text-sm flex-1"
                >
                  Start Searching
                </button>
                <button
                  onClick={onClose}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm flex-1"
                >
                  I'll Browse First
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-[#006452] hover:bg-[#005443] text-white px-4 py-2 rounded-md text-sm flex-1"
                >
                  Create Account
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm flex-1"
                >
                  Log In
                </button>
                <button
                  onClick={onClose}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm flex-shrink-0"
                >
                  Browse
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPromptPopup; 