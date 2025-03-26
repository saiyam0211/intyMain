import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const packages = [
  { 
    name: "Basic", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
    features: [
      "Core material- HDF-HMR",
      "Finish- Laminate",
      "Functional designs",
      "Necessary furnishings",
      "Premium Emulsion paint"
    ],
    bgColor: "bg-gradient-to-r from-emerald-600 to-green-500",
    contentBgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconBg: "bg-emerald-400"
  },
  { 
    name: "Premium", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M6,2L2,8L12,22L22,8L18,2H6M16,8L12,18L8,8H16M3.88,2H20.12L17.5,5.5L14.5,2H9.5L6.5,5.5L3.88,2Z" />
      </svg>
    ),
    features: [
      "Core material- HDF-HMR/BWR",
      "Finish- PU/Laminate/Acrylic",
      "Functional and stylish designs",
      "Wide range of furnishings",
      "Royale Shyne/Royale Emulsion paint"
    ],
    bgColor: "bg-gradient-to-r from-blue-600 to-indigo-500",
    contentBgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-400"
  },
  { 
    name: "Luxury", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
      </svg>
    ),
    features: [
      "Core material- HDF-HMR/BWP/BWR",
      "Finish- Designer PU/Glass/Fabric/Leatherette",
      "High-end designs",
      "Extensive array of furnishings",
      "Royale Glitz/Royale Shyne paint"
    ],
    bgColor: "bg-gradient-to-r from-amber-600 to-yellow-500",
    contentBgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconBg: "bg-amber-400"
  }
];

const PackageSelection = ({ formData, setFormData }) => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(formData?.package || "");
  const scrollContainerRef = useRef(null);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg.name);
    setFormData((prev) => ({ ...prev, package: pkg.name, estimatedCost: getPackagePrice(pkg.name) }));
  };

  const getPackagePrice = (packageName) => {
    switch(packageName) {
      case "Basic": return 500;
      case "Premium": return 1000;
      case "Luxury": return 2000;
      default: return 0;
    }
  };

  const handleNext = () => {
    if (selectedPackage) {
      navigate("/user-details");
    } else {
      alert("Please select a package");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-24 sm:mb-32">
      <h2 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-800">
        Select a Package
      </h2>
      
      {/* Mobile vertical layout */}
      <div className="block sm:hidden mt-8 overflow-y-auto max-h-[85vh] pb-4">
        <div className="flex flex-col space-y-6">
          {packages.map((pkg, index) => (
            <div 
              key={pkg.name}
              className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${pkg.borderColor} ${
                selectedPackage === pkg.name 
                  ? 'ring-2 ring-offset-2 ring-gray-800 transform scale-[1.02]' 
                  : 'border'
              }`}
              onClick={() => handlePackageSelect(pkg)}
            >
              <div className={`${pkg.bgColor} text-white p-5 flex items-center justify-between relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-full h-full opacity-30">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 0 L100 100 L100 0 Z" fill="white" />
                  </svg>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`${pkg.iconBg} bg-opacity-90 rounded-full p-2.5 shadow-md`}>
                    <div className="text-white w-5 h-5">{pkg.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold relative z-10">{pkg.name}</h3>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                  selectedPackage === pkg.name ? 'bg-white' : 'border-2 border-white'
                }`}>
                  {selectedPackage === pkg.name && (
                    <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className={`${pkg.contentBgColor} p-5`}>
                <ul className="space-y-3">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="h-5 w-5 text-green-600 mr-2.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-center">
                  <button
                    className={`py-2.5 px-8 rounded-full text-sm font-medium transition-all duration-300 shadow-md ${
                      selectedPackage === pkg.name 
                        ? 'bg-gray-800 text-white transform scale-105' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {selectedPackage === pkg.name ? 'Selected' : 'Select Package'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Desktop grid view */}
      <div className="hidden sm:block sm:mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          {packages.map((pkg, index) => (
            <div 
              key={pkg.name}
              className={`flex flex-col h-full transition-all duration-300 hover:shadow-xl rounded-xl overflow-hidden ${pkg.borderColor} cursor-pointer ${
                selectedPackage === pkg.name 
                  ? 'ring-2 ring-offset-2 ring-gray-800 transform scale-[1.02] shadow-lg border-0' 
                  : 'border shadow-md hover:transform hover:scale-[1.01]'
              }`}
              onClick={() => handlePackageSelect(pkg)}
            >
              <div className={`${pkg.bgColor} text-white p-5 flex items-center justify-between relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-full h-full opacity-30">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 0 L100 100 L100 0 Z" fill="white" />
                  </svg>
                </div>
                <div className="flex items-center">
                  <div className={`${pkg.iconBg} bg-opacity-90 rounded-full p-2.5 mr-3 shadow-md`}>
                    <div className="text-white w-6 h-6">{pkg.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold relative z-10">{pkg.name}</h3>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                  selectedPackage === pkg.name ? 'bg-white' : 'border-2 border-white'
                }`}>
                  {selectedPackage === pkg.name && (
                    <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className={`${pkg.contentBgColor} p-6 flex-grow flex flex-col`}>
                <ul className="space-y-4 mb-6 flex-grow">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-600 mr-2.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pb-2 text-center">
                  <button
                    className={`w-full py-2.5 px-4 rounded-full font-medium transition-all duration-300 text-sm ${
                      selectedPackage === pkg.name 
                        ? 'bg-gray-800 text-white transform scale-105 shadow-md' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {selectedPackage === pkg.name ? 'Selected' : 'Select Package'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Next button */}
      <div className="mt-10 mb-16 sm:mb-8 text-center">
        <button 
          onClick={handleNext}
          className="mt-4 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 text-white font-medium py-3 px-10 sm:px-14 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105"
        >
          Continue to Next Step
        </button>
      </div>
    </div>
  );
};

export default PackageSelection;
