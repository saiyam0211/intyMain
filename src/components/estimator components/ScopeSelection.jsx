import React from 'react';

const ScopeSelection = ({ formData, setFormData }) => {
  const handleScopeChange = (event) => {
    setFormData({ ...formData, scope: event.target.value });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
        Select Scope of Work
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => handleScopeChange({ target: { value: 'Renovate' } })}
          className={`p-3 sm:p-4 rounded-lg transition-colors duration-200 text-sm sm:text-base ${
            formData.scope === 'Renovate'
              ? 'bg-[#006452] text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Renovate Existing Home
        </button>
        <button
          onClick={() => handleScopeChange({ target: { value: 'New Design' } })}
          className={`p-3 sm:p-4 rounded-lg transition-colors duration-200 text-sm sm:text-base ${
            formData.scope === 'New Design'
              ? 'bg-[#006452] text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Design New Home
        </button>
      </div>
    </div>
  );
};

export default ScopeSelection;
