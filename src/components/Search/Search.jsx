// Search.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Search = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectType, setProjectType] = useState("Project Type");
  const [size, setSize] = useState("Size (sq ft)");
  const [priceRange, setPriceRange] = useState("Price Range");
  const [spaceType, setSpaceType] = useState("Space Type");
  const [assuredOnly, setAssuredOnly] = useState(false);
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
    setAssuredOnly(searchParams.get("assuredOnly") === "true");
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
    if (assuredOnly) params.append("assuredOnly", "true");

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
          assuredOnly: assuredOnly || undefined,
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
        assuredOnly: assuredOnly || undefined,
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
        if (assuredOnly) queryString.append("assuredOnly", "true");
        
        let targetPage = '/residential-space';
        navigate(`${targetPage}?${queryString.toString()}`);
        
        onSearch({
          query: searchQuery,
          projectType: value !== "Project Type" ? value : undefined,
          size: size !== "Size (sq ft)" ? size : undefined,
          priceRange: priceRange !== "Price Range" ? priceRange : undefined,
          spaceType: spaceType !== "Space Type" ? spaceType : undefined,
          assuredOnly: assuredOnly || undefined,
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
        if (assuredOnly) queryString.append("assuredOnly", "true");
        
        let targetPage = '/residential-space';
        navigate(`${targetPage}?${queryString.toString()}`);
        
        onSearch({
          query: searchQuery,
          projectType: projectType !== "Project Type" ? projectType : undefined,
          size: value !== "Size (sq ft)" ? value : undefined,
          priceRange: priceRange !== "Price Range" ? priceRange : undefined,
          spaceType: spaceType !== "Space Type" ? spaceType : undefined,
          assuredOnly: assuredOnly || undefined,
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
        if (assuredOnly) queryString.append("assuredOnly", "true");
        
        let targetPage = '/residential-space';
        navigate(`${targetPage}?${queryString.toString()}`);
        
        onSearch({
          query: searchQuery,
          projectType: projectType !== "Project Type" ? projectType : undefined,
          size: size !== "Size (sq ft)" ? size : undefined,
          priceRange: value !== "Price Range" ? value : undefined,
          spaceType: spaceType !== "Space Type" ? spaceType : undefined,
          assuredOnly: assuredOnly || undefined,
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
        if (assuredOnly) queryString.append("assuredOnly", "true");
        
        let targetPage = '/residential-space';
        navigate(`${targetPage}?${queryString.toString()}`);
        
        onSearch({
          query: searchQuery,
          projectType: projectType !== "Project Type" ? projectType : undefined,
          size: size !== "Size (sq ft)" ? size : undefined,
          priceRange: priceRange !== "Price Range" ? priceRange : undefined,
          spaceType: value !== "Space Type" ? value : undefined,
          assuredOnly: assuredOnly || undefined,
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
    <section className="w-full flex justify-center items-center">
      <div className="w-full max-w-6xl">
        <div className="search-container bg-white p-4 shadow-sm rounded-lg">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="What you are Looking for..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyPress}
              className={`w-full p-2 pl-3 border rounded-lg bg-[#006452] text-white placeholder-white focus:outline-none focus:ring-1 ${
                showValidationError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'focus:ring-white'
              }`}
              style={{ 
                background: "linear-gradient(91.13deg, #006452 0%, #008069 100%)",
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button type="button" onClick={handleGoClick}>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer"
                >
                  <path 
                    d="M21.7099 20.2899L17.9999 16.6099C19.44 14.8143 20.1374 12.5352 19.9487 10.2412C19.76 7.94721 18.6996 5.81269 16.9854 4.27655C15.2713 2.74041 13.0337 1.91941 10.7328 1.98237C8.43194 2.04534 6.24263 2.98747 4.61505 4.61505C2.98747 6.24263 2.04534 8.43194 1.98237 10.7328C1.91941 13.0337 2.74041 15.2713 4.27655 16.9854C5.81269 18.6996 7.94721 19.76 10.2412 19.9487C12.5352 20.1374 14.8143 19.44 16.6099 17.9999L20.2899 21.6799C20.3829 21.7736 20.4935 21.848 20.6153 21.8988C20.7372 21.9496 20.8679 21.9757 20.9999 21.9757C21.1319 21.9757 21.2626 21.9496 21.3845 21.8988C21.5063 21.848 21.6169 21.7736 21.7099 21.6799C21.8036 21.5869 21.8781 21.4762 21.9288 21.3544C21.9796 21.2325 22.0057 21.1019 22.0057 20.9699C22.0057 20.8379 21.9796 20.7072 21.9288 20.5854C21.8781 20.4635 21.8036 20.3529 21.7099 20.2599V20.2899ZM3.99992 10.9999C3.99992 9.61544 4.41054 8.26206 5.17969 7.11091C5.94885 5.95977 7.04235 5.06234 8.32116 4.53275C9.59996 4.00316 11.0077 3.86431 12.3656 4.13441C13.7235 4.4045 14.9708 5.07119 15.9497 6.05015C16.9287 7.02912 17.5954 8.27637 17.8655 9.6343C18.1356 10.9922 17.9967 12.3999 17.4671 13.6787C16.9375 14.9575 16.0401 16.051 14.889 16.8202C13.7378 17.5893 12.3844 17.9999 10.9999 17.9999C9.14339 17.9999 7.36298 17.2624 6.05015 15.9497C4.73731 14.637 3.99992 12.8565 3.99992 10.9999Z" 
                    fill="white"
                  />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Validation Error Message */}
          <div className={`text-red-500 text-xs my-1 ${showValidationError ? 'block' : 'hidden'}`}>
            <span className="text-red-500">*</span> Please fill in at least one field before searching
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4 mt-2">
            <div>
              <label className={`block text-sm sm:text-base font-semibold ${showValidationError ? 'text-red-500' : 'text-gray-700'} text-left mb-1`}>
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
                <option className="text-xs sm:text-sm">Space Type</option>
                <option className="text-xs sm:text-sm">Residential</option>
                <option className="text-xs sm:text-sm">Commercial</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm sm:text-base font-semibold ${showValidationError ? 'text-red-500' : 'text-gray-700'} text-left mb-1`}>
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
                <option className="text-xs sm:text-sm">Project Type</option>
                <option className="text-xs sm:text-sm">Studio</option>
                <option className="text-xs sm:text-sm">1 BHK</option>
                <option className="text-xs sm:text-sm">2 BHK</option>
                <option className="text-xs sm:text-sm">3 BHK</option>
                <option className="text-xs sm:text-sm">4 BHK</option>
                <option className="text-xs sm:text-sm">5 BHK</option>
                <option className="text-xs sm:text-sm">Duplex</option>
                <option className="text-xs sm:text-sm">Penthouse</option>
                <option className="text-xs sm:text-sm">Villa</option>
                <option className="text-xs sm:text-sm">Commercial</option>
                <option className="text-xs sm:text-sm">Kitchen</option>
                <option className="text-xs sm:text-sm">Bedroom</option>
                <option className="text-xs sm:text-sm">Bathroom</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm sm:text-base font-semibold ${showValidationError ? 'text-red-500' : 'text-gray-700'} text-left mb-1`}>
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
                <option className="text-xs sm:text-sm">Size (sq ft)</option>
                <option className="text-xs sm:text-sm">400 to 600</option>
                <option className="text-xs sm:text-sm">600 - 800</option>
                <option className="text-xs sm:text-sm">800 - 1000</option>
                <option className="text-xs sm:text-sm">1000 - 1200</option>
                <option className="text-xs sm:text-sm">1200 - 1400</option>
                <option className="text-xs sm:text-sm">1400 - 1600</option>
                <option className="text-xs sm:text-sm">1600 - 1800</option>
                <option className="text-xs sm:text-sm">1800 - 2000</option>
                <option className="text-xs sm:text-sm">2000 - 2400</option>
                <option className="text-xs sm:text-sm">2400 - 2800</option>
                <option className="text-xs sm:text-sm">2800 - 3200</option>
                <option className="text-xs sm:text-sm">3200 - 4000</option>
                <option className="text-xs sm:text-sm">4000 - 5000</option>
                <option className="text-xs sm:text-sm">5000+</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm sm:text-base font-semibold ${showValidationError ? 'text-red-500' : 'text-gray-700'} text-left mb-1`}>
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
                <option className="text-xs sm:text-sm">Price Range</option>
                <option className="text-xs sm:text-sm">All</option>
                <option className="text-xs sm:text-sm">1Lakh to 3Lakh</option>
                <option className="text-xs sm:text-sm">3Lakh to 6Lakh</option>
                <option className="text-xs sm:text-sm">6Lakh to 10Lakh</option>
                <option className="text-xs sm:text-sm">10Lakh to 15Lakh</option>
                <option className="text-xs sm:text-sm">15Lakh to 20Lakh</option>
                <option className="text-xs sm:text-sm">20Lakh to 25Lakh</option>
                <option className="text-xs sm:text-sm">25Lakh to 30Lakh</option>
                <option className="text-xs sm:text-sm">30Lakh to 40Lakh</option>
                <option className="text-xs sm:text-sm">40Lakh+</option>
              </select>
            </div>

            {/* Inty Assured checkbox */}
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 pb-2">
                <input
                  type="checkbox"
                  checked={assuredOnly}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAssuredOnly(checked);
                    const queryString = new URLSearchParams();
                    if (searchQuery) queryString.append('query', searchQuery);
                    if (projectType !== 'Project Type') queryString.append('projectType', projectType);
                    if (size !== 'Size (sq ft)') queryString.append('size', size);
                    if (priceRange !== 'Price Range') queryString.append('priceRange', priceRange);
                    if (spaceType !== 'Space Type') queryString.append('spaceType', spaceType);
                    if (checked) queryString.append('assuredOnly', 'true');
                    let targetPage = '/residential-space';
                    navigate(`${targetPage}?${queryString.toString()}`);
                    if (onSearch) {
                      onSearch({
                        query: searchQuery,
                        projectType: projectType !== 'Project Type' ? projectType : undefined,
                        size: size !== 'Size (sq ft)' ? size : undefined,
                        priceRange: priceRange !== 'Price Range' ? priceRange : undefined,
                        spaceType: spaceType !== 'Space Type' ? spaceType : undefined,
                        assuredOnly: checked || undefined,
                        search: searchQuery
                      });
                    }
                  }}
                  className="h-4 w-4"
                />
                <span className="text-sm sm:text-base font-semibold text-gray-700 mb-1">Inty Assured only</span>
              </label>
            </div>
          </div>

          {/* Go Button */}
          <div className="mt-4 md:mt-6 text-center">
            <button
              onClick={handleGoClick}
              className={`bg-[#006452] hover:bg-[#005345] text-white font-medium py-2 px-8 md:px-12 rounded-full transition-colors duration-300 shadow-md inline-block ${isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Go'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Search;