// HomeType.js
import React from 'react';

const HomeType = ({ formData, setFormData }) => {
  const homeTypes = ['1 BHK', '2 BHK', '3 BHK', '4 BHK'];

  const handleHomeTypeChange = (selectedType) => {
    setFormData({ ...formData, homeType: selectedType });
  };

  const handleCarpetAreaChange = (event) => {
    setFormData({ ...formData, carpetArea: event.target.value });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
        Select Home Type & Carpet Area
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {homeTypes.map((type) => (
          <button
            key={type}
            onClick={() => handleHomeTypeChange(type)}
            className={`p-3 sm:p-4 rounded-lg transition-colors duration-200 text-sm sm:text-base ${formData.homeType === type
                ? 'bg-[#006452] text-white'
                : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      <input
        type="number"
        placeholder="Enter carpet area in sq. ft."
        value={formData.carpetArea}
        onChange={handleCarpetAreaChange}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
        required
      />
    </div>
  );
};

export default HomeType;
