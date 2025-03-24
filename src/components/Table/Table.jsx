import React, { useState } from "react";
import intera from "../assets/interra.png";
import architect from "../assets/architect.png";
import banner from "../assets/banner.png";
import chair from "../assets/chair.png";
import TableCorousel from "./TableCorousel";

export default function ComparisonTable() {
  const [visibleCompanies, setVisibleCompanies] = useState([0, 1, 2]);
  const [activeTab, setActiveTab] = useState(0);

  const removeCompany = (index) => {
    setVisibleCompanies(prev => prev.filter(i => i !== index));
  };

  // Each company's data
  const data = [
    {
      image: intera,
      headerColor: "bg-teal-400",
      columnColor: "bg-teal-200",
      textColor: "text-red-500",
      team: "Yes",
      deliveryTimelines: "3 Months",
      completedProjects: "234",
      reviews: 4,
      companyAge: "10 years",
      price: "5 - 6 L",
      chairImages: [chair, chair, chair]
    },
    {
      image: architect,
      headerColor: "bg-orange-400",
      columnColor: "bg-orange-200",
      textColor: "text-orange-600",
      team: "Yes",
      deliveryTimelines: "2 Months",
      completedProjects: "45",
      reviews: 2,
      companyAge: "2 years",
      price: "8 to 10 L",
      chairImages: [chair, chair, chair]
    },
    {
      image: banner,
      headerColor: "bg-blue-400",
      columnColor: "bg-blue-200",
      textColor: "text-blue-600",
      team: "No",
      deliveryTimelines: "2.5 months",
      completedProjects: "356",
      reviews: 5,
      companyAge: "15 years",
      price: "12 - 15 L",
      chairImages: [chair, chair, chair]
    },
  ];

  const details = [
    { label: "Delivery timelines", key: "deliveryTimelines" },
    { label: "Number of completed projects", key: "completedProjects" },
    { label: "Reviews", key: "reviews" },
    { label: "Age of company", key: "companyAge" },
    { label: "Price", key: "price" },
    { label: "Images", key: "chair", isCarousel: true },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Mobile View */}
      <div className="md:hidden">
        {/* Mobile Tabs */}
        <div className="flex  gap-2 mb-4">
          {data.map((item, idx) => (
            visibleCompanies.includes(idx) && (
              <button
                key={idx}
                className={`flex-shrink-0 p-2 rounded-t-lg ${
                  activeTab === idx ? item.headerColor : 'bg-gray-200'
                } relative`}
                onClick={() => setActiveTab(idx)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCompany(idx);
                    if (activeTab === idx && visibleCompanies.length > 1) {
                      setActiveTab(visibleCompanies.filter(i => i !== idx)[0]);
                    }
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shadow-lg z-10"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3 w-3 text-white" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
                <img src={item.image} alt="Company Logo" className="h-8 w-auto" />
              </button>
            )
          ))}
        </div>

        {/* Mobile Content */}
        {visibleCompanies.includes(activeTab) && (
          <div className={`p-4 rounded-lg ${data[activeTab].columnColor}`}>
            {details.map((detail, idx) => (
              <div key={idx} className="mb-4">
                <div className="font-bold mb-2">{detail.label}</div>
                <div className="flex items-center justify-center">
                  {detail.isCarousel ? (
                    <TableCorousel images={data[activeTab].chairImages} />
                  ) : detail.key === "reviews" ? (
                    <div className="text-lg font-semibold">
                      {data[activeTab].reviews}
                    </div>
                  ) : (
                    data[activeTab][detail.key]
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop View - Your existing code */}
      <div className="hidden md:block">
        {/* Desktop and Mobile View */}
        <div className="pb-4"> {/* Add horizontal scroll for mobile */}
          <div className="min-w-[768px]"> {/* Minimum width to prevent squishing */}
            <div className="grid grid-cols-4 text-center gap-[19px]">
              <div className="p-4 bg-white font-bold"></div>
              {data.map((item, idx) => (
                visibleCompanies.includes(idx) && (
                  <div
                    key={idx}
                    className={`p-2 sm:p-4 ${item.headerColor} flex items-center justify-center h-16 sm:h-20 rounded-md relative`}
                  >
                    <button
                      onClick={() => removeCompany(idx)}
                      className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shadow-lg"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-3 w-3 sm:h-4 sm:w-4 text-white" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </button>
                    <img src={item.image} alt="Company Logo" className="h-12 sm:h-16 w-auto" />
                  </div>
                )
              ))}
            </div>
            
            {details.map((row, rowIndex) => (
              <div 
                key={rowIndex} 
                className="grid grid-cols-4 gap-[19px] relative"
              >
                <div className="p-2 sm:p-4 bg-white font-bold flex items-center justify-start text-sm sm:text-base">
                  {row.label}
                </div>
                {/* Add horizontal line as a pseudo-element that adapts to visible columns */}
                {rowIndex !== 0 && (
                  <div 
                    className="absolute top-0 left-0"
                    style={{
                      height: '2px',
                      background: '#115e59', 
                      width: visibleCompanies.length === 3 ? '100%' : `calc(100% - ${(3 - visibleCompanies.length) * 25}%)`,
                      transition: 'width 0.3s ease'
                    }}
                  />
                )}
                {data.map((item, idx) => (
                  visibleCompanies.includes(idx) && (
                    <div
                      key={idx}
                      className={`p-2 sm:p-4 ${item.columnColor} flex items-center justify-center font-semibold text-sm sm:text-base`}
                    >
                      {row.isCarousel ? (
                        <TableCorousel images={item.chairImages} />
                      ) : row.key === "reviews" ? (
                        <div className="text-lg font-semibold">
                          {item.reviews}
                        </div>
                      ) : (
                        item[row.key]
                      )}
                    </div>
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}