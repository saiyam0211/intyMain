import React from 'react';

/**
 * Component to display when user's pricing expectations are unreasonable
 * This is shown when the user enters a price range that's significantly lower
 * than what companies offer
 */
const UnreasonablePriceAlert = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Price Range Alert</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="text-gray-700">
          <p className="mb-3">
            Sorry, there are no companies operating in the price range you selected.
          </p>
          <p className="mb-3">
            Interior design and renovation projects typically require a higher budget than what you've specified.
          </p>
          <p className="mb-3">
            If you're willing to increase your budget, you'll find more options that match your requirements.
          </p>
          <p className="mb-3">
            We've displayed some companies below that might be a good starting point, though they may exceed your original budget.
          </p>
        </div>
        
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#006452] hover:bg-[#005443] text-white px-4 py-2 rounded-md text-sm"
          >
            View Companies
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnreasonablePriceAlert; 