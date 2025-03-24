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
    bgColor: "bg-[#2c5a2e]",
    contentBgColor: "bg-[#f0f9e8]"
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
    bgColor: "bg-[#1e40af]",
    contentBgColor: "bg-[#e6f0ff]"
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
    bgColor: "bg-[#713f12]",
    contentBgColor: "bg-[#fef9c3]"
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
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
        Select a Package
      </h2>
      
      {/* Mobile scrollable view */}
      <div className="block mt-20 sm:hidden">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        >
          {packages.map((pkg, index) => (
            <div 
              key={pkg.name}
              className="flex-shrink-0 w-[90vw] max-w-sm mx-2 snap-start"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div 
                className={`flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden shadow-lg ${
                  selectedPackage === pkg.name ? 'ring-2 ring-gray-800' : ''
                }`}
                onClick={() => handlePackageSelect(pkg)}
              >
                <div className={`${pkg.bgColor} text-white p-3 flex items-center justify-between relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-full h-full">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0 0 L100 100 L100 0 Z" fill="white" fillOpacity="0.1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium relative z-10">{pkg.name}</h3>
                  <div className="text-white w-5 h-5 relative z-10">{pkg.icon}</div>
                </div>
                <div className={`${pkg.contentBgColor} p-3 flex-grow flex flex-col`}>
                  <ul className="space-y-2 mb-4 flex-grow">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto relative pb-2">
                    <button
                      className={`w-24 py-1.5 px-3 border border-gray-800 rounded-full text-gray-800 hover:bg-gray-800 hover:text-white transition-colors duration-200 flex items-center justify-between text-sm ${
                        selectedPackage === pkg.name ? 'bg-gray-800 text-white' : ''
                      }`}
                    >
                      <span>Select</span>
                      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Desktop grid view */}
      <div className="hidden sm:block sm:mt-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-0 relative">
          {packages.map((pkg, index) => (
            <div 
              key={pkg.name}
              className={`flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:transform hover:scale-102 cursor-pointer border-t sm:border-t-0 ${
                index === 0 ? 'sm:rounded-l-lg overflow-hidden sm:border-r' : 
                index === packages.length - 1 ? 'sm:rounded-r-lg overflow-hidden' : 
                'sm:border-r'
              } border-gray-200 relative z-10 ${
                selectedPackage === pkg.name ? 'sm:bg-gray-50' : ''
              }`}
              onClick={() => handlePackageSelect(pkg)}
            >
              <div className={`${pkg.bgColor} text-white p-4 flex items-center justify-between relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-full h-full">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 0 L100 100 L100 0 Z" fill="white" fillOpacity="0.1" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium relative z-10">{pkg.name}</h3>
                <div className="text-white w-6 h-6 relative z-10">{pkg.icon}</div>
              </div>
              <div className={`${pkg.contentBgColor} p-4 flex-grow flex flex-col`}>
                <ul className="space-y-4 mb-6 flex-grow">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto relative pb-2">
                  <button
                    className={`w-32 py-2 px-4 border border-gray-800 rounded-full text-gray-800 hover:bg-gray-800 hover:text-white transition-colors duration-200 flex items-center justify-between text-base ${
                      selectedPackage === pkg.name ? 'bg-gray-800 text-white' : ''
                    }`}
                  >
                    <span>Select</span>
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* CSS for hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default PackageSelection;