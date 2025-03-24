// Search.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Search = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectType, setProjectType] = useState("Project Type");
  const [size, setSize] = useState("Size (sq ft)");
  const [priceRange, setPriceRange] = useState("Price Range");
  const [spaceType, setSpaceType] = useState("Space Type");
  const [isSearching, setIsSearching] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Use URL parameters to set initial state if they exist
    setSearchQuery(searchParams.get("query") || "");
    setProjectType(searchParams.get("projectType") || "Project Type");
    setSize(searchParams.get("size") || "Size (sq ft)");
    setPriceRange(searchParams.get("priceRange") || "Price Range");
    setSpaceType(searchParams.get("spaceType") || "Space Type");
  }, [searchParams]);

  // Debounce function to delay search execution
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const buildSearchUrl = () => {
    const params = new URLSearchParams();

    if (searchQuery) params.append("query", searchQuery);
    if (projectType !== "Project Type") params.append("projectType", projectType);
    if (size !== "Size (sq ft)") params.append("size", size);
    if (priceRange !== "Price Range") params.append("priceRange", priceRange);
    if (spaceType !== "Space Type") params.append("spaceType", spaceType);

    return params.toString(); // Return only the query string
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (onSearch) {
        setIsSearching(true);
        onSearch({
          query: query,
          projectType: projectType !== "Project Type" ? projectType : undefined,
          size: size !== "Size (sq ft)" ? size : undefined,
          priceRange: priceRange !== "Price Range" ? priceRange : undefined,
          spaceType: spaceType !== "Space Type" ? spaceType : undefined,
          search: query // Add search parameter explicitly
        });
        setIsSearching(false);
      }
    }, 500), // 500ms delay
    [projectType, size, priceRange, spaceType, onSearch]
  );

  const handleGoClick = () => {
    // Validate that at least one field is filled
    if (
      searchQuery === "" && 
      projectType === "Project Type" && 
      size === "Size (sq ft)" && 
      priceRange === "Price Range" && 
      spaceType === "Space Type"
    ) {
      // Show alert and set validation error state
      alert("Please fill in at least one field before searching");
      setShowValidationError(true);
      return;
    }
    
    // Clear validation error state if validation passes
    setShowValidationError(false);
    const queryString = buildSearchUrl();
    
    // Determine which page to navigate to based on space type
    let targetPage = '/residential-space'; // Default to residential
    
    if (spaceType === "Commercial") {
      targetPage = '/residential-space'; // Still use residential-space but with spaceType=Commercial
      // Make sure spaceType is in the query params
      const params = new URLSearchParams(queryString);
      params.set('spaceType', 'Commercial');
      navigate(`${targetPage}?${params.toString()}`);
    } else if (spaceType === "Residential") {
      const params = new URLSearchParams(queryString);
      params.set('spaceType', 'Residential');
      navigate(`${targetPage}?${params.toString()}`);
    } else {
      // If no space type selected, just use the query string as is
      navigate(`${targetPage}${queryString ? `?${queryString}` : ''}`);
    }
    
    // If an onSearch prop is provided, call it with the current filters
    if (onSearch) {
      onSearch({
        query: searchQuery,
        projectType: projectType !== "Project Type" ? projectType : undefined,
        size: size !== "Size (sq ft)" ? size : undefined,
        priceRange: priceRange !== "Price Range" ? priceRange : undefined,
        spaceType: spaceType !== "Space Type" ? spaceType : undefined,
        search: searchQuery // Add search parameter explicitly
      });
    }
  };
  
  // Modify existing handler functions to clear validation error when a field is filled
  const handleProjectTypeChange = (e) => {
    const value = e.target.value;
    setProjectType(value);
    
    // Clear validation error if an option is selected
    if (value !== "Project Type") {
      setShowValidationError(false);
    }
    
    // Apply filter immediately if onSearch is provided
    if (onSearch && value !== projectType) {
      setTimeout(() => {
        // Validate that at least one field is filled (including this new value)
        if (
          searchQuery === "" && 
          value === "Project Type" && 
          size === "Size (sq ft)" && 
          priceRange === "Price Range" && 
          spaceType === "Space Type"
        ) {
          // Just update the state but don't navigate if no valid filters
          return;
        }
        
        const queryString = new URLSearchParams();
        if (searchQuery) queryString.append("query", searchQuery);
        if (value !== "Project Type") queryString.append("projectType", value);
        if (size !== "Size (sq ft)") queryString.append("size", size);
        if (priceRange !== "Price Range") queryString.append("priceRange", priceRange);
        if (spaceType !== "Space Type") queryString.append("spaceType", spaceType);
        
        let targetPage = '/residential-space';
        navigate(`${targetPage}?${queryString.toString()}`);
        
        onSearch({
          query: searchQuery,
          projectType: value !== "Project Type" ? value : undefined,
          size: size !== "Size (sq ft)" ? size : undefined,
          priceRange: priceRange !== "Price Range" ? priceRange : undefined,
          spaceType: spaceType !== "Space Type" ? spaceType : undefined,
          search: searchQuery // Add search parameter explicitly
        });
      }, 100);
    }
  };
  
  const handleSizeChange = (e) => {
    const value = e.target.value;
    setSize(value);
    
    // Clear validation error if an option is selected
    if (value !== "Size (sq ft)") {
      setShowValidationError(false);
    }
    
    // Apply filter immediately if onSearch is provided
    if (onSearch && value !== size) {
      setTimeout(() => {
        // Validate that at least one field is filled (including this new value)
        if (
          searchQuery === "" && 
          projectType === "Project Type" && 
          value === "Size (sq ft)" && 
          priceRange === "Price Range" && 
          spaceType === "Space Type"
        ) {
          // Just update the state but don't navigate if no valid filters
          return;
        }
        
        const queryString = new URLSearchParams();
        if (searchQuery) queryString.append("query", searchQuery);
        if (projectType !== "Project Type") queryString.append("projectType", projectType);
        if (value !== "Size (sq ft)") queryString.append("size", value);
        if (priceRange !== "Price Range") queryString.append("priceRange", priceRange);
        if (spaceType !== "Space Type") queryString.append("spaceType", spaceType);
        
        let targetPage = '/residential-space';
        navigate(`${targetPage}?${queryString.toString()}`);
        
        onSearch({
          query: searchQuery,
          projectType: projectType !== "Project Type" ? projectType : undefined,
          size: value !== "Size (sq ft)" ? value : undefined,
          priceRange: priceRange !== "Price Range" ? priceRange : undefined,
          spaceType: spaceType !== "Space Type" ? spaceType : undefined,
          search: searchQuery // Add search parameter explicitly
        });
      }, 100);
    }
  };
  
  const handlePriceRangeChange = (e) => {
    const value = e.target.value;
    setPriceRange(value);
    
    // Clear validation error if an option is selected
    if (value !== "Price Range") {
      setShowValidationError(false);
    }
    
    // Apply filter immediately if onSearch is provided
    if (onSearch && value !== priceRange) {
      setTimeout(() => {
        // Validate that at least one field is filled (including this new value)
        if (
          searchQuery === "" && 
          projectType === "Project Type" && 
          size === "Size (sq ft)" && 
          value === "Price Range" && 
          spaceType === "Space Type"
        ) {
          // Just update the state but don't navigate if no valid filters
          return;
        }
        
        const queryString = new URLSearchParams();
        if (searchQuery) queryString.append("query", searchQuery);
        if (projectType !== "Project Type") queryString.append("projectType", projectType);
        if (size !== "Size (sq ft)") queryString.append("size", size);
        if (value !== "Price Range") queryString.append("priceRange", value);
        if (spaceType !== "Space Type") queryString.append("spaceType", spaceType);
        
        let targetPage = '/residential-space';
        navigate(`${targetPage}?${queryString.toString()}`);
        
        onSearch({
          query: searchQuery,
          projectType: projectType !== "Project Type" ? projectType : undefined,
          size: size !== "Size (sq ft)" ? size : undefined,
          priceRange: value !== "Price Range" ? value : undefined,
          spaceType: spaceType !== "Space Type" ? spaceType : undefined,
          search: searchQuery // Add search parameter explicitly
        });
      }, 100);
    }
  };

  // Add handler for space type change
  const handleSpaceTypeChange = (e) => {
    const value = e.target.value;
    setSpaceType(value);
    
    // Clear validation error if an option is selected
    if (value !== "Space Type") {
      setShowValidationError(false);
    }
    
    // Apply filter immediately if onSearch is provided
    if (onSearch && value !== spaceType) {
      setTimeout(() => {
        // Validate that at least one field is filled (including this new value)
        if (
          searchQuery === "" && 
          projectType === "Project Type" && 
          size === "Size (sq ft)" && 
          priceRange === "Price Range" && 
          value === "Space Type"
        ) {
          // Just update the state but don't navigate if no valid filters
          return;
        }
        
        const queryString = new URLSearchParams();
        if (searchQuery) queryString.append("query", searchQuery);
        if (projectType !== "Project Type") queryString.append("projectType", projectType);
        if (size !== "Size (sq ft)") queryString.append("size", size);
        if (priceRange !== "Price Range") queryString.append("priceRange", priceRange);
        if (value !== "Space Type") queryString.append("spaceType", value);
        
        let targetPage = '/residential-space';
        navigate(`${targetPage}?${queryString.toString()}`);
        
        onSearch({
          query: searchQuery,
          projectType: projectType !== "Project Type" ? projectType : undefined,
          size: size !== "Size (sq ft)" ? size : undefined,
          priceRange: priceRange !== "Price Range" ? priceRange : undefined,
          spaceType: value !== "Space Type" ? value : undefined,
          search: searchQuery // Add search parameter explicitly
        });
      }, 100);
    }
  };

  // Handle search input change with debouncing
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear validation error if text is entered
    if (value !== "") {
      setShowValidationError(false);
    }
    
    debouncedSearch(value);
  };

  // Handle Enter key press in the search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGoClick();
    }
  };

  return (
    <section className="py-5 mt-10 px-6 md:px-12 lg:px-24 text-center flex justify-center items-center mb-15">
      <div className="w-full max-w-6xl px-4 text-center" data-aos="fade-up">
        <h2 className="text-lg md:text-xl font-semibold text-[#006452] mb-4">
          We help you find and compare the best interior companies, designers and carpenters
        </h2>
        <div className={`relative bg-[#006452] text-white rounded-full flex items-center p-3 md:p-3 shadow-lg ${showValidationError ? 'ring-2 ring-red-500' : ''}`}>
          <input
            type="text"
            placeholder="What you are Looking for..."
            className="flex-1 bg-transparent outline-none placeholder-white px-4"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleKeyPress}
          />
          <button 
            className={`p-2 ${isSearching ? 'opacity-50' : ''}`} 
            onClick={handleGoClick}
            disabled={isSearching}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        
        {/* Helper text for required fields - show in red when validation error occurs */}
        <div className={`text-sm ${showValidationError ? 'text-red-500 font-medium' : 'text-gray-500'} mb-2 mt-2`}>
          <span className="text-red-500">*</span> Please fill in at least one field before searching
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          <div>
            <label className={`block text-sm font-medium ${showValidationError ? 'text-red-500' : 'text-gray-700'} text-left mb-1`}>
              Space Type <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-1 ${
                showValidationError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'focus:ring-[#006452]'
              }`}
              value={spaceType}
              onChange={handleSpaceTypeChange}
            >
              <option className="text-sm">Space Type</option>
              <option className="text-sm">Residential</option>
              <option className="text-sm">Commercial</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${showValidationError ? 'text-red-500' : 'text-gray-700'} text-left mb-1`}>
              Project Type <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-1 ${
                showValidationError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'focus:ring-[#006452]'
              }`}
              value={projectType}
              onChange={handleProjectTypeChange}
            >
              <option className="text-sm">Project Type</option>
              <option className="text-sm">Studio</option>
              <option className="text-sm">1 BHK</option>
              <option className="text-sm">2 BHK</option>
              <option className="text-sm">3 BHK</option>
              <option className="text-sm">4 BHK</option>
              <option className="text-sm">5 BHK</option>
              <option className="text-sm">Duplex</option>
              <option className="text-sm">Penthouse</option>
              <option className="text-sm">Villa</option>
              <option className="text-sm">Commercial</option>
              <option className="text-sm">Kitchen</option>
              <option className="text-sm">Bedroom</option>
              <option className="text-sm">Bathroom</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${showValidationError ? 'text-red-500' : 'text-gray-700'} text-left mb-1`}>
              Size <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-1 ${
                showValidationError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'focus:ring-[#006452]'
              }`}
              value={size}
              onChange={handleSizeChange}
            >
              <option className="text-sm">Size (sq ft)</option>
              <option className="text-sm">400 to 600</option>
              <option className="text-sm">600 - 800</option>
              <option className="text-sm">800 - 1000</option>
              <option className="text-sm">1000 - 1200</option>
              <option className="text-sm">1200 - 1400</option>
              <option className="text-sm">1400 - 1600</option>
              <option className="text-sm">1600 - 1800</option>
              <option className="text-sm">1800 - 2000</option>
              <option className="text-sm">2000 - 2400</option>
              <option className="text-sm">2400 - 2800</option>
              <option className="text-sm">2800 - 3200</option>
              <option className="text-sm">3200 - 4000</option>
              <option className="text-sm">4000 - 5000</option>
              <option className="text-sm">5000+</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${showValidationError ? 'text-red-500' : 'text-gray-700'} text-left mb-1`}>
              Price Range <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-1 ${
                showValidationError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'focus:ring-[#006452]'
              }`}
              value={priceRange}
              onChange={handlePriceRangeChange}
            >
              <option className="text-sm">Price Range</option>
              <option className="text-sm">1Lakh to 3Lakh</option>
              <option className="text-sm">3Lakh to 6Lakh</option>
              <option className="text-sm">6Lakh to 10Lakh</option>
              <option className="text-sm">10Lakh to 15Lakh</option>
              <option className="text-sm">15Lakh to 20Lakh</option>
              <option className="text-sm">20Lakh to 25Lakh</option>
              <option className="text-sm">25Lakh to 30Lakh</option>
              <option className="text-sm">30Lakh to 40Lakh</option>
              <option className="text-sm">40Lakh+</option>
            </select>
          </div>
        </div>

        {/* Go Button */}
        <div className="mt-6">
          <button
            onClick={handleGoClick}
            className={`bg-[#006452] hover:bg-[#005345] text-white font-medium py-2 px-12 rounded-full transition-colors duration-300 shadow-md inline-block ${isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Go'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Search;