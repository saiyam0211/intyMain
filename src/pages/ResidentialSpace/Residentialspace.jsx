import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify"; // Import Toast
import "react-toastify/dist/ReactToastify.css"; // Import Toast CSS
import { apiClient } from "../../services/apiService"; // Import apiClient instead of axios
import { Button } from "../../components/ui/Button";
import backgroundImage from "../../assets/background.png";
import lock from "../../assets/lock.png";
import CompanyCard from "../../components/Cards/Cards";
import Header from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Search from "../../components/Search/Search";
import Pagination from "../../components/Pagination/Pagination";
import LocationPopup from "../../components/LocationPopup/LocationPopup";
// Import the search algorithm
import { searchAlgorithm } from "../../services/SearchAlgorithm";
// Import the search prompt popup
import SearchPromptPopup from "../../components/SearchPromptPopup/SearchPromptPopup";

// Updated to just use the endpoint without the domain
const API_ENDPOINT = "companies";
const ITEMS_PER_PAGE = 9;

export default function ResidentialSpace() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, user } = useUser();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [compareCount, setCompareCount] = useState(0);
  const [userLocation, setUserLocation] = useState(localStorage.getItem('userLocation') || '');
  const [showLocationPopup, setShowLocationPopup] = useState(!localStorage.getItem('userLocation'));
  // Add state for search prompt popup
  const [showSearchPrompt, setShowSearchPrompt] = useState(false);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get spaceType from URL params first, then localStorage, then default to "Residential"
  const [spaceType, setSpaceType] = useState(() => {
    const urlSpaceType = searchParams.get("spaceType");
    if (urlSpaceType) return urlSpaceType;

    const savedSpaceType = localStorage.getItem('spaceType');
    return savedSpaceType || "Residential";
  });

  // State for filter values
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [projectType, setProjectType] = useState(searchParams.get("projectType") || "Project Type");
  const [size, setSize] = useState(searchParams.get("size") || "Size (sq ft)");
  const [priceRange, setPriceRange] = useState(searchParams.get("priceRange") || "Price Range");

  // Save spaceType to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('spaceType', spaceType);
  }, [spaceType]);

  useEffect(() => {
    if (user) {
      const compareList = JSON.parse(localStorage.getItem(`compareList_${user.id}`) || '[]');
      setCompareCount(compareList.length);
    }
  }, [user]);

  // Check if user has previously dismissed the search prompt
  useEffect(() => {
    const hasSearchInputs = searchParams.get("query") || 
                           searchParams.get("projectType") || 
                           searchParams.get("size") || 
                           searchParams.get("priceRange");

    const hasSeenPrompt = localStorage.getItem('hasSeenSearchPrompt');
    
    // Show prompt if:
    // 1. User hasn't seen the prompt before OR
    // 2. User is logged in and hasn't provided search inputs
    if (!hasSeenPrompt || (isSignedIn && !hasSearchInputs)) {
      // Small delay to show popup after page loads
      const timer = setTimeout(() => {
        setShowSearchPrompt(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, searchParams]);

  const handleCloseSearchPrompt = () => {
    // Mark that user has seen the prompt
    localStorage.setItem('hasSeenSearchPrompt', 'true');
    setShowSearchPrompt(false);
  };

  const handleStartSearch = () => {
    setShowSearchPrompt(false);
    
    // Focus on the search input
    const searchInput = document.querySelector('input[placeholder="What you are Looking for..."]');
    if (searchInput) {
      searchInput.focus();
      
      // Scroll to search area
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer) {
        searchContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Handle location selection from popup
  const handleLocationSelect = (location, coordinates = null, address = null) => {
    setUserLocation(location);

    if (location) {
      localStorage.setItem('userLocation', location);

      // If coordinates are provided, store them
      if (coordinates) {
        console.log("Received exact coordinates:", coordinates);

        // Store the live location data properly to ensure inty Assured image works
        const liveLocationData = {
          latitude: coordinates.lat || coordinates.latitude,
          longitude: coordinates.lng || coordinates.longitude,
          timestamp: new Date().toISOString()
        };

        // If address is provided, store it
        if (address) {
          console.log("Received address:", address);
          liveLocationData.address = address;
        }

        // Store the complete location data in localStorage
        localStorage.setItem('userLiveLocation', JSON.stringify(liveLocationData));
      } else {
        // If no coordinates but we have a location name, try to get default coordinates for that city
        const cityCoordinates = {
          'Bengaluru': { lat: 12.9716, lng: 77.5946 },
          'Indore': { lat: 22.7196, lng: 75.8577 },
          'Nagpur': { lat: 21.1458, lng: 79.0882 },
          'Mumbai': { lat: 19.0760, lng: 72.8777 },
          'Delhi': { lat: 28.6139, lng: 77.2090 },
          'Chennai': { lat: 13.0827, lng: 80.2707 },
          'Kolkata': { lat: 22.5726, lng: 88.3639 },
          'Hyderabad': { lat: 17.3850, lng: 78.4867 },
          'Pune': { lat: 18.5204, lng: 73.8567 },
          'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
          'Jaipur': { lat: 26.9124, lng: 75.7873 }
        };

        if (cityCoordinates[location]) {
          const liveLocationData = {
            latitude: cityCoordinates[location].lat,
            longitude: cityCoordinates[location].lng,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('userLiveLocation', JSON.stringify(liveLocationData));
        } else {
          // Use center of India as fallback
          const liveLocationData = {
            latitude: 20.5937,
            longitude: 78.9629,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('userLiveLocation', JSON.stringify(liveLocationData));
        }
      }

      // Reset to page 1 when location changes
      setCurrentPage(1);

      // Fetch companies with the selected location
      fetchCompaniesWithLocation(location);
    } else {
      // If no location is selected, clear the location data
      localStorage.removeItem('userLocation');
      localStorage.removeItem('userLiveLocation');

      // Reset to page 1
      setCurrentPage(1);

      // Show location popup
      setShowLocationPopup(true);
    }

    // Hide location popup if a location was selected
    if (location) {
      setShowLocationPopup(false);
    }
  };

  const fetchCompaniesWithLocation = (locationValue) => {
    console.log(`Fetching companies with location: ${locationValue} and type: ${spaceType}`);
    fetchCompanies(1, {
      search: searchQuery || undefined,
      projectType: projectType !== "Project Type" ? projectType : undefined,
      size: size !== "Size (sq ft)" ? size : undefined,
      priceRange: priceRange !== "Price Range" ? priceRange : undefined,
      location: locationValue,
      type: spaceType // Include the space type
    });
  };

  // Extract parameters from URL when it changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newQuery = params.get("query") || "";
    const newProjectType = params.get("projectType") || "Project Type";
    const newSize = params.get("size") || "Size (sq ft)";
    const newPriceRange = params.get("priceRange") || "Price Range";
    const newSpaceType = params.get("spaceType") || localStorage.getItem('spaceType') || "Residential";

    // Check if space type is changing
    const isSpaceTypeChanging = newSpaceType !== spaceType;
    if (isSpaceTypeChanging) {
      console.log(`Space type changing from URL: ${spaceType} -> ${newSpaceType}`);
    }

    // Update local state with URL parameters
    setSearchQuery(newQuery);
    setProjectType(newProjectType);
    setSize(newSize);
    setPriceRange(newPriceRange);

    // Only update spaceType if it's actually changing to avoid unnecessary re-renders
    if (isSpaceTypeChanging) {
      setSpaceType(newSpaceType);
      // Also update localStorage
      localStorage.setItem('spaceType', newSpaceType);
    }

    // Reset to page 1 when filters change
    setCurrentPage(1);

    // Only fetch if we have a location
    if (userLocation) {
      // Fetch companies with the new filters
      fetchCompanies(1, {
        search: newQuery || undefined,
        projectType: newProjectType !== "Project Type" ? newProjectType : undefined,
        size: newSize !== "Size (sq ft)" ? newSize : undefined,
        priceRange: newPriceRange !== "Price Range" ? newPriceRange : undefined,
        location: userLocation,
        type: newSpaceType // Include the space type
      });
    }
  }, [location.search]);

  // Initial data load when component mounts
  useEffect(() => {
    // Check if we have a space type in the URL
    const params = new URLSearchParams(location.search);
    const urlSpaceType = params.get("spaceType");
    const savedSpaceType = localStorage.getItem('spaceType');

    // Determine which space type to use (URL > localStorage > default)
    const effectiveSpaceType = urlSpaceType || savedSpaceType || "Residential";
    
    // If user is not signed in and tries to access Commercial space, redirect to Residential
    if (!isSignedIn && effectiveSpaceType === "Commercial") {
      const newParams = new URLSearchParams(params);
      newParams.set("spaceType", "Residential");
      setSearchParams(newParams);
      
      // Show message explaining the redirect
      setTimeout(() => {
        toast.info("Please sign in to access Commercial space listings", {
          position: "top-center",
          autoClose: 5000,
        });
      }, 500);
      
      // Set space type to Residential
      setSpaceType("Residential");
    } else if (effectiveSpaceType !== spaceType) {
      console.log(`Initial load: setting space type to ${effectiveSpaceType}`);
      setSpaceType(effectiveSpaceType);

      // Update URL if needed
      if (!urlSpaceType && savedSpaceType) {
        const newParams = new URLSearchParams(params);
        newParams.set("spaceType", effectiveSpaceType);
        setSearchParams(newParams);
      }
    }

    // Update document title
    document.title = `${effectiveSpaceType} Space | inty`;

    // Check if we have live location data
    const userLiveLocationStr = localStorage.getItem('userLiveLocation');
    if (userLiveLocationStr) {
      console.log("Found live location data in localStorage");
      try {
        // Parse the live location to verify it's valid
        const userLiveLocation = JSON.parse(userLiveLocationStr);
        if (userLiveLocation.latitude && userLiveLocation.longitude) {
          console.log("Live location data is valid:", userLiveLocation);

          // Display the coordinates in the console for debugging
          console.log(`User's exact coordinates: ${userLiveLocation.latitude}, ${userLiveLocation.longitude}`);
        } else {
          console.log("Live location data is invalid, removing it");
          localStorage.removeItem('userLiveLocation');
        }
      } catch (err) {
        console.error("Error parsing live location data:", err);
        localStorage.removeItem('userLiveLocation');
      }
    } else {
      console.log("No live location data found in localStorage");
    }

    // Only fetch if we have a location, otherwise wait for location popup
    if (userLocation) {
      fetchCompanies(1, {
        search: searchQuery || undefined,
        projectType: projectType !== "Project Type" ? projectType : undefined,
        size: size !== "Size (sq ft)" ? size : undefined,
        priceRange: priceRange !== "Price Range" ? priceRange : undefined,
        location: userLocation,
        type: effectiveSpaceType // Use the effective space type
      });
    } else {
      // Still need to set loading to false if no location yet
      setLoading(false);
    }
  }, [isSignedIn]);

  // Function to ensure each company has coordinates
  const ensureCompanyCoordinates = (company) => {
    // City coordinates mapping
    const cityCoordinates = {
      'Bengaluru': { lat: 12.9716, lng: 77.5946 },
      'Indore': { lat: 22.7196, lng: 75.8577 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 },
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.6139, lng: 77.2090 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Lucknow': { lat: 26.8467, lng: 80.9462 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 }
    };

    // Check if company already has coordinates in any format
    if (company.coordinates) {
      return company; // Already has coordinates
    }

    if (company.latitude && company.longitude) {
      // Add coordinates in the expected format
      return {
        ...company,
        coordinates: {
          latitude: company.latitude,
          longitude: company.longitude
        }
      };
    }

    if (company.lat && company.lng) {
      // Add coordinates in the expected format
      return {
        ...company,
        coordinates: {
          latitude: company.lat,
          longitude: company.lng
        }
      };
    }

    // If company has a location (city), use the city's coordinates
    if (company.location && cityCoordinates[company.location]) {
      const cityCoords = cityCoordinates[company.location];
      console.log(`Adding city-based coordinates for company ${company._id || company.name}`);

      // Add a small random offset to avoid all companies in the same city having identical distances
      // This creates a more realistic distribution of distances
      const latOffset = (Math.random() - 0.5) * 0.05; // +/- 0.025 degrees (about 2.5 km)
      const lngOffset = (Math.random() - 0.5) * 0.05;

      return {
        ...company,
        coordinates: {
          latitude: cityCoords.lat + latOffset,
          longitude: cityCoords.lng + lngOffset
        }
      };
    }

    // If company has no location, use the user's selected location
    if (userLocation && cityCoordinates[userLocation]) {
      const cityCoords = cityCoordinates[userLocation];
      console.log(`Using user location coordinates for company ${company._id || company.name}`);

      // Add a larger random offset for companies with no location data
      const latOffset = (Math.random() - 0.5) * 0.1; // +/- 0.05 degrees (about 5 km)
      const lngOffset = (Math.random() - 0.5) * 0.1;

      return {
        ...company,
        location: userLocation, // Also set the location
        coordinates: {
          latitude: cityCoords.lat + latOffset,
          longitude: cityCoords.lng + lngOffset
        }
      };
    }

    // If all else fails, return the original company
    return company;
  };

  // Function to calculate distance between user and company for sorting
  const calculateDistanceForSorting = (company) => {
    // Skip calculation if location is not a constraint
    if (localStorage.getItem('hideDistanceInCompare') === 'true') {
      return null;
    }
    
    const userLiveLocationStr = localStorage.getItem('userLiveLocation');
    if (!userLiveLocationStr) {
      return null;
    }

    try {
      const userLocation = JSON.parse(userLiveLocationStr);
      
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        return null;
      }
      
      // Check if company has coordinates directly (this is the format we're now using)
      if (company.coordinates) {
        // Handle different coordinate formats
        let companyLat, companyLng;
        
        if (typeof company.coordinates === 'object') {
          // Object format: { latitude, longitude } or { lat, lng }
          companyLat = company.coordinates.latitude || company.coordinates.lat;
          companyLng = company.coordinates.longitude || company.coordinates.lng;
        } else if (typeof company.coordinates === 'string') {
          try {
            const coordParts = company.coordinates.split(',');
            if (coordParts.length === 2) {
              companyLat = parseFloat(coordParts[0].trim());
              companyLng = parseFloat(coordParts[1].trim());
            }
          } catch (e) {
            return null;
          }
        }
        
        if (companyLat && companyLng) {
          return calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            companyLat,
            companyLng
          );
        }
      }
      
      // Check other coordinate formats
      if (company.lat && company.lng) {
        return calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          company.lat,
          company.lng
        );
      }
      
      if (company.latitude && company.longitude) {
        return calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          company.latitude,
          company.longitude
        );
      }
      
      // Fallback to city-based mapping
      const cityCoordinates = {
        'Bengaluru': { lat: 12.9716, lng: 77.5946 },
        'Indore': { lat: 22.7196, lng: 75.8577 },
        'Nagpur': { lat: 21.1458, lng: 79.0882 },
        'Mumbai': { lat: 19.0760, lng: 72.8777 },
        'Delhi': { lat: 28.6139, lng: 77.2090 },
        'Chennai': { lat: 13.0827, lng: 80.2707 },
        'Kolkata': { lat: 22.5726, lng: 88.3639 },
        'Hyderabad': { lat: 17.3850, lng: 78.4867 },
        'Pune': { lat: 18.5204, lng: 73.8567 },
        'Jaipur': { lat: 26.9124, lng: 75.7873 },
        'Lucknow': { lat: 26.8467, lng: 80.9462 },
        'Ahmedabad': { lat: 23.0225, lng: 72.5714 }
      };
      
      const companyCity = company.location;
      if (!companyCity || !cityCoordinates[companyCity]) {
        return null;
      }
      
      return calculateDistance(
        userLocation.latitude, 
        userLocation.longitude, 
        cityCoordinates[companyCity].lat, 
        cityCoordinates[companyCity].lng
      );
    } catch (err) {
      console.error("Error calculating distance for sorting:", err);
      return null;
    }
  };

  // Helper function to calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1)); // Return distance as a number
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const fetchCompanies = async (page = currentPage, filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Ensure we have the latest spaceType
      const currentSpaceType = filters.type || spaceType;

      // Use a consistent limit for all users
      const limit = 50; // Fetch more companies in one request for client-side filtering

      console.log(`Fetching companies with type: ${currentSpaceType}`);

      // Use apiClient instead of direct axios call with properly structured params
      const response = await apiClient.get(API_ENDPOINT, {
        params: {
          limit,
          search: filters.search,
          location: filters.location,
          type: currentSpaceType
        }
      });

      console.log("API Response:", response.data);

      if (response.data && Array.isArray(response.data.companies)) {
        // Process companies to ensure they have coordinates
        const processedCompanies = response.data.companies.map(ensureCompanyCoordinates);
        
        console.log("Received companies:", processedCompanies.length);
        console.log("First company:", processedCompanies[0]);

        // Ensure userLiveLocation is set for proper inty verified image display
        const userLiveLocationStr = localStorage.getItem('userLiveLocation');
        if (!userLiveLocationStr && userLocation) {
          // If we have a location but no live location data, create it
          const cityCoordinates = {
            'Bengaluru': { lat: 12.9716, lng: 77.5946 },
            'Indore': { lat: 22.7196, lng: 75.8577 },
            'Nagpur': { lat: 21.1458, lng: 79.0882 },
            'Mumbai': { lat: 19.0760, lng: 72.8777 },
            'Delhi': { lat: 28.6139, lng: 77.2090 },
            'Chennai': { lat: 13.0827, lng: 80.2707 },
            'Kolkata': { lat: 22.5726, lng: 88.3639 },
            'Hyderabad': { lat: 17.3850, lng: 78.4867 },
            'Pune': { lat: 18.5204, lng: 73.8567 },
            'Jaipur': { lat: 26.9124, lng: 75.7873 },
            'Lucknow': { lat: 26.8467, lng: 80.9462 },
            'Ahmedabad': { lat: 23.0225, lng: 72.5714 }
          };

          if (cityCoordinates[userLocation]) {
            const liveLocationData = {
              latitude: cityCoordinates[userLocation].lat,
              longitude: cityCoordinates[userLocation].lng,
              timestamp: new Date().toISOString()
            };
            localStorage.setItem('userLiveLocation', JSON.stringify(liveLocationData));
            console.log("Created userLiveLocation data for selected city:", userLocation);
          }
        }

        // Apply the search algorithm
        const searchFilters = {
          search: filters.search,
          projectType: filters.projectType !== "Project Type" ? filters.projectType : undefined,
          size: filters.size !== "Size (sq ft)" ? filters.size : undefined,
          priceRange: filters.priceRange !== "Price Range" ? filters.priceRange : undefined,
          spaceType: currentSpaceType
        };
        
        console.log("Applying search algorithm with filters:", searchFilters);
        const algorithmResult = searchAlgorithm(processedCompanies, searchFilters);
        
        let sortedCompanies = algorithmResult.companies;
        
        // Display warning if unreasonable pricing is detected
        if (algorithmResult.unreasonablePricing) {
          toast.warning(
            "Sorry, there are no companies operating in the price range; however if you are willing to increase the budget, you may consider the options below.",
            { position: "top-center", autoClose: 7000 }
          );
        }
        
        // Display message if no companies match the search criteria
        if (algorithmResult.noMatchingCompanies) {
          setError("No companies found matching your search criteria. Try adjusting your filters.");
        }
        
        // Sort companies by distance if location is provided
        if (userLocation && localStorage.getItem('hideDistanceInCompare') !== 'true') {
          console.log("Further sorting companies by distance since location is provided");
          
          // Calculate distance for each company
          const companiesWithDistance = sortedCompanies.map(company => {
            const distance = calculateDistanceForSorting(company);
            return { 
              ...company, 
              calculatedDistance: distance 
            };
          });
          
          // Sort by distance within each group (assured, paid partners, then others)
          const assuredCompanies = companiesWithDistance.filter(c => c.assured === "true");
          const topRatedCompanies = companiesWithDistance.filter(c => c.topRated && c.assured !== "true");
          const otherCompanies = companiesWithDistance.filter(c => !c.topRated && c.assured !== "true");
          
          // Sort each group by distance
          const sortByDistance = companies => companies.sort((a, b) => {
            if (a.calculatedDistance === null && b.calculatedDistance === null) return 0;
            if (a.calculatedDistance === null) return 1;
            if (b.calculatedDistance === null) return -1;
            return a.calculatedDistance - b.calculatedDistance;
          });
          
          const sortedAssured = sortByDistance(assuredCompanies);
          const sortedTopRated = sortByDistance(topRatedCompanies);
          const sortedOthers = sortByDistance(otherCompanies);
          
          // Combine the groups in priority order
          sortedCompanies = [...sortedAssured, ...sortedTopRated, ...sortedOthers];
          
          // Mark the nearest company in each group
          if (sortedAssured.length > 0 && sortedAssured[0].calculatedDistance !== null) {
            sortedAssured[0].isNearest = true;
          }
          
          // Mark first company as first card
          if (sortedCompanies.length > 0) {
            sortedCompanies[0].isFirstCard = true;
          }
        }

        // Store all companies
        setCompanies(sortedCompanies);
        
        // Calculate pagination
        const allCompaniesCount = sortedCompanies.length;
        const calculatedTotalPages = Math.ceil(allCompaniesCount / ITEMS_PER_PAGE) || 1;
        
        console.log(`Pagination: ${allCompaniesCount} companies, ${ITEMS_PER_PAGE} per page = ${calculatedTotalPages} pages`);
        
        setTotalPages(calculatedTotalPages);
        setCurrentPage(page > calculatedTotalPages ? 1 : page);
      } else {
        setCompanies([]);
        setTotalPages(1);
        setError("No companies found");
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("Failed to fetch companies. Please try again later.");
      setCompanies([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (filters.search) params.set("query", filters.search);
    if (filters.projectType && filters.projectType !== "Project Type") params.set("projectType", filters.projectType);
    if (filters.size && filters.size !== "Size (sq ft)") params.set("size", filters.size);
    if (filters.priceRange && filters.priceRange !== "Price Range") params.set("priceRange", filters.priceRange);
    params.set("spaceType", spaceType); // Add space type to URL parameters

    // Update URL without reloading the page
    setSearchParams(params);

    console.log("Search filters applied:", filters);

    // Update local state with the new filters
    setSearchQuery(filters.search || "");
    setProjectType(filters.projectType || "Project Type");
    setSize(filters.size || "Size (sq ft)");
    setPriceRange(filters.priceRange || "Price Range");

    // Reset to page 1 when new search is performed
    setCurrentPage(1);

    // Fetch companies with the new filters
    fetchCompanies(1, {
      ...filters,
      location: userLocation // Include user location in search
    });
  };

  const handleCompareChange = () => {
    if (user) {
      const compareList = JSON.parse(localStorage.getItem(`compareList_${user.id}`) || '[]');
      setCompareCount(compareList.length);
    }
  };

  const handlePageChange = (page) => {
    console.log(`Changing page from ${currentPage} to ${page}, totalPages: ${totalPages}`);
    setCurrentPage(page);
    fetchCompanies(page, {
      search: searchQuery || undefined,
      projectType: projectType !== "Project Type" ? projectType : undefined,
      size: size !== "Size (sq ft)" ? size : undefined,
      priceRange: priceRange !== "Price Range" ? priceRange : undefined,
      location: userLocation,
      type: spaceType
    });
  };

  const handleChangeLocation = () => {
    // Clear location data
    setUserLocation('');
    localStorage.removeItem('userLocation');
    localStorage.removeItem('userLiveLocation');

    // Show location popup
    setShowLocationPopup(true);
  };

  // Function to handle space type change
  const handleSpaceTypeChange = (newSpaceType) => {
    // Prevent non-logged-in users from accessing Commercial space
    if (!isSignedIn && newSpaceType === "Commercial") {
      // Show login prompt
      toast.error("Please sign in to access Commercial space listings", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
      });
      return;
    }

    // Only proceed if the type is actually changing
    if (newSpaceType === spaceType) return;

    console.log(`Changing space type from ${spaceType} to ${newSpaceType}`);

    // Update state
    setSpaceType(newSpaceType);
    
    // Log current space type for debugging
    console.log("Space type after updating state:", newSpaceType);

    // Update URL parameters
    const params = new URLSearchParams(searchParams);
    params.set("spaceType", newSpaceType);
    setSearchParams(params);

    // Update document title
    document.title = `${newSpaceType} Space | inty`;

    // Reset to page 1
    setCurrentPage(1);

    // Fetch companies with the new type
    if (userLocation) {
      // Clear existing companies while fetching new ones
      setCompanies([]);
      setLoading(true);
      
      fetchCompanies(1, {
        search: searchQuery || undefined,
        projectType: projectType !== "Project Type" ? projectType : undefined,
        size: size !== "Size (sq ft)" ? size : undefined,
        priceRange: priceRange !== "Price Range" ? priceRange : undefined,
        location: userLocation,
        type: newSpaceType
      });
    }
  };

  return (
    <div className="bg-white overflow-x-hidden">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} />

      <div className="absolute top-0 left-0 w-full bg-transparent z-50">
        <Header isResidentialPage={true} />
      </div>

      {/* Search Prompt Popup */}
      {showSearchPrompt && (
        <SearchPromptPopup 
          isLoggedIn={isSignedIn}
          onClose={handleCloseSearchPrompt}
          onStartSearch={handleStartSearch}
        />
      )}

      {/* Location Popup - only show if showLocationPopup is true */}
      {showLocationPopup && (
        <LocationPopup onLocationSelect={handleLocationSelect} />
      )}

      {/* Floating Compare Button */}
      {isSignedIn && compareCount > 0 && (
        <div className="fixed bottom-16 sm:bottom-20 right-4 z-50">
          <Button
            onClick={() => {
              if (compareCount >= 2 && compareCount <= 3) {
                navigate('/compare');
              } else {
                toast.error("Select at least 2 and no more than 3 companies to compare!", {
                  position: "top-center",
                  autoClose: 3000,
                  hideProgressBar: true,
                });
              }
            }}
            className="bg-[#006452] hover:bg-[#005443] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg text-sm sm:text-base"
          >
            Compare ({compareCount})
          </Button>
        </div>
      )}

      {/* Location Toggle Button */}
      {userLocation && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white rounded-full shadow-lg p-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#006452]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-sm">{userLocation}</span>
              <button
                onClick={handleChangeLocation}
                className="ml-2 text-sm text-[#006452] hover:text-[#005345] font-medium"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      )}

      <section
        className="relative h-[300px] sm:h-[400px] md:h-[515px] bg-cover bg-center text-white flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(250,250,250,0.85)] to-[rgba(0,100,82,0.85)]"></div>
        <div className="z-2 flex flex-col items-center px-4 max-w-full">
          <div className="flex flex-col sm:flex-row items-center">
            <h2
              className={`font-inter font-black transition-all duration-300 cursor-pointer text-white tracking-normal leading-tight ${spaceType === "Residential"
                ? "text-2xl sm:text-4xl md:text-[64px] opacity-100"
                : "text-base sm:text-2xl md:text-[20px] opacity-60 hover:opacity-80"
                }`}
              onClick={() => handleSpaceTypeChange("Residential")}
            >
              Residential
            </h2>
            <span className="hidden sm:block font-inter font-black mx-2 text-4xl md:text-[64px] tracking-normal text-white">
              |
            </span>
            <div className="w-20 h-0.5 bg-white my-2 sm:hidden"></div>
            <h3
              className={`font-inter font-black transition-all duration-300 cursor-pointer text-white tracking-normal leading-tight ${spaceType === "Commercial"
                ? "text-2xl sm:text-4xl md:text-[64px] opacity-100"
                : "text-base sm:text-2xl md:text-[20px] opacity-60 hover:opacity-80"
                }`}
              onClick={() => handleSpaceTypeChange("Commercial")}
            >
              Commercial
            </h3>
          </div>
          <div className="mt-4 text-xs sm:text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
            Currently viewing: <span className="font-bold">{spaceType}</span> spaces
          </div>
        </div>
      </section>

      <div className="flex justify-center w-full">
        <div className="w-full max-w-6xl px-2 sm:px-4 md:px-8 lg:px-12">
          <div className="bg-white p-2 sm:p-4">
            {/* Pass the handleSearch function to the Search component */}
            <Search onSearch={handleSearch} />
          </div>

          {error && (
            <div className="text-red-500 text-center my-4 p-4 bg-red-50 rounded">
              {error}
            </div>
          )}
          
          {loading && (
            <div className="flex justify-center items-center my-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#006452]"></div>
            </div>
          )}

          {!loading && !error && !userLocation && (
            <div className="text-center my-12 p-6 bg-gray-50 rounded-lg">
              <p className="text-lg sm:text-xl text-gray-600">Please select a location to see available companies.</p>
            </div>
          )}

          {!loading && !error && userLocation && (
            <div className="flex flex-col items-center w-full">
              {companies.length > 0 ? (
                <div className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4 px-4 sm:px-0 relative">
                    {/* Show only first 3 companies for non-logged-in users, or paginate for logged-in users */}
                    {(isSignedIn 
                      ? companies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) 
                      : companies.slice(0, 3)
                    ).map((company, index) => (
                      <CompanyCard
                        key={company._id}
                        company={company}
                        onCompareChange={handleCompareChange}
                      />
                    ))}
                  </div>

                  {/* Login card for non-logged-in users */}
                  {!isSignedIn && companies.length > 3 && (
                    <div className="mt-12 mb-8 bg-gradient-to-r from-[#006452] to-[#00836b] rounded-lg shadow-xl p-4 sm:p-8 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-3 sm:p-4 rounded-full mb-4">
                          <img src={lock} alt="Lock" className="w-8 sm:w-10 h-8 sm:h-10" />
                        </div>
                        <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">
                          {companies.length - 3 >= 10 ? "10+" : companies.length - 3} More Companies Available
                        </h3>
                        <p className="text-white/90 mb-4 sm:mb-6 max-w-lg text-sm sm:text-base">
                          Create a free account to unlock all companies matching your search criteria and access advanced comparison features.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <button
                            onClick={() => navigate('/login')}
                            className="bg-white text-[#006452] hover:bg-gray-100 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold shadow-lg transition-all text-sm sm:text-base"
                          >
                            Login
                          </button>
                          <button 
                            onClick={() => navigate('/signup')}
                            className="bg-white/20 hover:bg-white/30 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold shadow-lg transition-all text-sm sm:text-base"
                          >
                            Sign Up
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center my-12 p-6 bg-gray-50 rounded-lg w-full max-w-3xl">
                  <p className="text-lg sm:text-xl text-gray-600">
                    No companies found in {userLocation} matching your search criteria.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                  {/* Debug info */}
                  <div className="mt-4 p-2 border border-gray-300 bg-gray-100 text-xs text-left">
                    <p>Debug Info:</p>
                    <p>Current Space Type: {spaceType}</p>
                    <p>Companies Count: {companies.length}</p>
                    <p>Current Page: {currentPage}</p>
                    <p>Total Pages: {totalPages}</p>
                  </div>
                </div>
              )}

              {/* Show pagination only for logged-in users */}
              {companies.length > ITEMS_PER_PAGE && isSignedIn && (
                <div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mt-6"
                  />
                  <div className="text-xs text-gray-500 text-center mt-2">
                    Page {currentPage} of {totalPages} ({companies.length} {spaceType} companies total)
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}