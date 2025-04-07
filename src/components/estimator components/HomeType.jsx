// HomeType.js
import React, { useState, useEffect, useRef } from 'react';

const HomeType = ({ formData, setFormData }) => {
  const homeTypes = ['1 BHK', '2 BHK', '3 BHK', '4 BHK'];
  const [showOthersDropdown, setShowOthersDropdown] = useState(false);
  const otherHomeTypes = ['5 BHK', '6 BHK', 'Villa', 'Duplex', 'Penthouse'];
  const dropdownRef = useRef(null);

  const handleHomeTypeChange = (selectedType) => {
    setFormData({ ...formData, homeType: selectedType });
    setShowOthersDropdown(false);
  };

  const handleCarpetAreaChange = (event) => {
    setFormData({ ...formData, carpetArea: event.target.value });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOthersDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            className={`p-2 sm:p-3 rounded-lg transition-colors duration-200 text-sm ${formData.homeType === type
                ? 'bg-[#006452] text-white'
                : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            {type}
          </button>
        ))}
        
        <div className="relative sm:col-span-2 mt-2" ref={dropdownRef}>
          {showOthersDropdown && (
            <div className="absolute bottom-full left-0 w-full mb-1 bg-white border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
              {otherHomeTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleHomeTypeChange(type)}
                  className="w-full py-2 px-3 text-left hover:bg-gray-100 text-xs sm:text-sm"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
          
          <button
            onClick={() => setShowOthersDropdown(!showOthersDropdown)}
            className={`w-full p-2 sm:p-3 rounded-lg transition-colors duration-200 text-sm ${otherHomeTypes.includes(formData.homeType)
                ? 'bg-[#006452] text-white'
                : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            {otherHomeTypes.includes(formData.homeType) ? formData.homeType : 'Others'}
          </button>
        </div>
      </div>

      <input
        type="number"
        placeholder="Enter carpet area in sq. ft."
        value={formData.carpetArea}
        onChange={handleCarpetAreaChange}
        className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        required
      />
    </div>
  );
};

export default HomeType;
