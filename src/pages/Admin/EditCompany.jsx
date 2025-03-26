import React, { useState, useEffect } from 'react'
import axios from "axios"
import { useNavigate, useParams } from 'react-router-dom'



const EditCompany = () => {

    // Set API_URL
    //const API_URL = "https://inty-backend-6wzp.onrender.com/api";
    // const API_URL = "https://inty-backend-2.onrender.com/api";
    const API_URL = "https://inty-backend.onrender.com/api";
    const { id } = useParams();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [company, setCompany] = useState(null)
    const [formData, setFormData] = useState({
        // Original fields
        name: "",
        projects: "",
        experience: "",
        calculatedExperience: "",
        yearError: "",
        branches: "",
        logo: null,
        // New fields from screenshots
        registeredCompanyName: "",
        nameDisplay: "",
        description: "",
        ageOfCompany: "",
        availableCities: [],
        officialWebsite: "",
        fullName: "",
        designation: "",
        phoneNumber: "",
        minMaxBudget: "",
        type: [],
        bannerImages: Array(10).fill(null),
        discountsOfferTimeline: "",
        numberOfProjectsCompleted: "",
        digitalBrochure: null,
        usp: "",
        contactEmail: "",
        googleRating: "",
        googleReviews: "",
        anyAwardWon: "",
        categoryType: "",
        paymentType: [],
        assured: "",
        latitude: "",
        longitude: "",
        workInTeams: "",
        deliveryTimeline: "",
        basicPriceRange: "",
        premiumPriceRange: "",
        luxuryPriceRange: "",
        serviceCategories: [],
        payedStatus: "", // New field for payment status
    });
    
    // State for tags
    const [offerTags, setOfferTags] = useState([]);
    const [awardTags, setAwardTags] = useState([]);
    const [uspTags, setUspTags] = useState([]);
    const [offerInput, setOfferInput] = useState("");
    const [awardInput, setAwardInput] = useState("");
    const [uspInput, setUspInput] = useState("");
    const navigate = useNavigate();

    // Add these new state variables
    const [existingLogo, setExistingLogo] = useState(null);
    const [existingBannerImages, setExistingBannerImages] = useState(Array(10).fill(null));

    // Inside the EditCompany component, add these new state variables
    const [citySearchInput, setCitySearchInput] = useState("");
    const [filteredCities, setFilteredCities] = useState([]);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [activeCityIndex, setActiveCityIndex] = useState(-1);
    const [popularCities, setPopularCities] = useState([
        'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 
        'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Indore', 'Nagpur'
    ]);

    const getCompanyById = async () => {
        try {
            setLoading(true);
            const { data: { companyDetails } } = await axios.get(`${API_URL}/companies/getCompany/${id}`);
            setCompany(companyDetails);
            console.log("Company Details: ", companyDetails);

            // Set existing logo
            if (companyDetails.logo) {
                setExistingLogo(companyDetails.logo);
            }

            // Set existing banner images
            const bannerImagesArray = Array(10).fill(null);
            // Check for individual banner image fields in the API response
            for (let i = 0; i < 10; i++) {
                const bannerKey = `bannerImage${i+1}`;
                if (companyDetails[bannerKey]) {
                    bannerImagesArray[i] = companyDetails[bannerKey];
                }
            }
            
            // Also check for array of banner images if that's how they're stored
            if (companyDetails.bannerImages && Array.isArray(companyDetails.bannerImages)) {
                companyDetails.bannerImages.forEach((img, idx) => {
                    if (idx < 10 && img) {
                        bannerImagesArray[idx] = img;
                    }
                });
            }
            
            setExistingBannerImages(bannerImagesArray);

            // Calculate years of experience if we have an establishment year
            let calculatedExp = "";
            let establishmentYear = "";
            
            // Check if we have an establishmentYear field
            if (companyDetails.establishmentYear) {
                establishmentYear = companyDetails.establishmentYear;
                const currentYear = new Date().getFullYear();
                calculatedExp = (currentYear - parseInt(establishmentYear)).toString();
                console.log("Using establishmentYear:", establishmentYear, "calculatedExp:", calculatedExp);
            } 
            // If no establishmentYear, but we have experience, use the current year minus experience to calculate establishment year
            else if (companyDetails.experience) {
                // Keep the experience value as is, since it's already years of experience
                calculatedExp = companyDetails.experience;
                
                // Calculate establishment year based on experience
                const currentYear = new Date().getFullYear();
                establishmentYear = (currentYear - parseInt(companyDetails.experience)).toString();
                console.log("Calculated establishmentYear from experience:", establishmentYear, "experience:", calculatedExp);
            }

            // Process the type field from API response - it could be a string, array or comma-separated string
            let processedTypes = [];
            if (companyDetails.type) {
                if (Array.isArray(companyDetails.type)) {
                    processedTypes = companyDetails.type;
                } else if (typeof companyDetails.type === 'string') {
                    // Handle comma-separated string or single value
                    processedTypes = companyDetails.type.split(',').map(t => t.trim()).filter(Boolean);
                }
            }
            console.log("Processed types:", processedTypes);

            // Set form data from company details
            setFormData({
                name: companyDetails.name || "",
                projects: companyDetails.projects || "",
                // Use the calculated establishment year
                experience: establishmentYear || "",
                calculatedExperience: calculatedExp,
                yearError: "",
                branches: companyDetails.branches || "",
                logo: null,
                registeredCompanyName: companyDetails.registeredCompanyName || "",
                nameDisplay: companyDetails.nameDisplay || "",
                description: companyDetails.description || "",
                ageOfCompany: companyDetails.ageOfCompany || "",
                availableCities: companyDetails.availableCities || [],
                officialWebsite: companyDetails.officialWebsite || "",
                fullName: companyDetails.fullName || "",
                designation: companyDetails.designation || "",
                phoneNumber: companyDetails.phoneNumber || "",
                minMaxBudget: companyDetails.minMaxBudget || "",
                type: processedTypes,
                bannerImages: Array(10).fill(null),
                discountsOfferTimeline: companyDetails.discountsOfferTimeline || "",
                numberOfProjectsCompleted: companyDetails.numberOfProjectsCompleted || "",
                digitalBrochure: null,
                usp: companyDetails.usp || "",
                contactEmail: companyDetails.contactEmail || "",
                googleRating: companyDetails.googleRating || "",
                googleReviews: companyDetails.googleReviews || "",
                anyAwardWon: companyDetails.anyAwardWon || "",
                categoryType: companyDetails.categoryType || "",
                paymentType: companyDetails.paymentType || [],
                assured: companyDetails.assured || "",
                latitude: companyDetails.latitude || "",
                longitude: companyDetails.longitude || "",
                workInTeams: companyDetails.workInTeams || "",
                deliveryTimeline: companyDetails.deliveryTimeline || "",
                // Use original price ranges if available, otherwise use the calculated values
                basicPriceRange: companyDetails.originalBasicPriceRange || companyDetails.basicPriceRange || "",
                premiumPriceRange: companyDetails.originalPremiumPriceRange || companyDetails.premiumPriceRange || "",
                luxuryPriceRange: companyDetails.originalLuxuryPriceRange || companyDetails.luxuryPriceRange || "",
                serviceCategories: companyDetails.serviceCategories || [],
                payedStatus: companyDetails.payedStatus || "", // Initialize from existing data
            });
            
            // Initialize tags from existing data
            if (companyDetails.discountsOfferTimeline) {
                setOfferTags(companyDetails.discountsOfferTimeline.split(',').map(tag => tag.trim()).filter(tag => tag));
            }
            
            if (companyDetails.anyAwardWon) {
                setAwardTags(companyDetails.anyAwardWon.split(',').map(tag => tag.trim()).filter(tag => tag));
            }
            
            if (companyDetails.usp) {
                setUspTags(companyDetails.usp.split(',').map(tag => tag.trim()).filter(tag => tag));
            }
        } catch (err) {
            console.error("Error fetching company:", err);
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to fetch company. Please try again later."
            );
            setCompany(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        getCompanyById();
    }, [id])

    // Cities options based on the screenshots
    const citiesOptions = [
        "Agra", "Ahmedabad", "Ajmer", "Akola", "Aligarh", "Allahabad", "Amravati", "Amritsar", 
        "Aurangabad", "Bengaluru", "Bareilly", "Belgaum", "Bhavnagar", "Bhilai", "Bhiwandi", 
        "Bhopal", "Bhubaneswar", "Bikaner", "Bilaspur", "Bokaro", "Chandigarh", "Chennai", 
        "Coimbatore", "Cuttack", "Dehradun", "Delhi", "Dhanbad", "Durgapur", "Faridabad", 
        "Firozabad", "Ghaziabad", "Gorakhpur", "Gulbarga", "Guntur", "Gurgaon", "Guwahati", 
        "Gwalior", "Hubli", "Hyderabad", "Indore", "Jabalpur", "Jaipur", "Jalandhar", "Jammu", 
        "Jamnagar", "Jamshedpur", "Jhansi", "Jodhpur", "Kanpur", "Kochi", "Kolhapur", "Kolkata", 
        "Kota", "Kozhikode", "Kurnool", "Lucknow", "Ludhiana", "Madurai", "Mangalore", "Meerut", 
        "Mumbai", "Mysore", "Nagpur", "Nashik", "Navi Mumbai", "Noida", "Patna", "Pondicherry", 
        "Pune", "Raipur", "Rajkot", "Ranchi", "Rourkela", "Salem", "Sangli", "Siliguri", "Solapur", 
        "Srinagar", "Surat", "Thiruvananthapuram", "Thrissur", "Tiruchirappalli", "Tirunelveli", 
        "Tiruppur", "Ujjain", "Vadodara", "Varanasi", "Vijayawada", "Visakhapatnam", "Warangal",
        // Adding more Indian cities
        "Agartala", "Aizawl", "Aligarh", "Alwar", "Ambala", "Ambarnath", "Ambikapur", "Anand", "Anantapur",
        "Asansol", "Avadi", "Baharampur", "Balasore", "Ballari", "Bathinda", "Begusarai", "Berhampur",
        "Bhagalpur", "Bharatpur", "Bhilwara", "Bhimavaram", "Bhind", "Bhiwani", "Bhubaneswar", "Bidar",
        "Bijapur", "Bikaner", "Bilaspur", "Budaun", "Bulandshahr", "Burhanpur", "Buxar", "Champdani",
        "Chandrapur", "Chhatarpur", "Chhindwara", "Chittoor", "Cuddalore", "Darbhanga", "Davanagere",
        "Deoghar", "Dewas", "Dhanbad", "Dharwad", "Dibrugarh", "Dindigul", "Durg", "Durgapur", "Eluru",
        "Erode", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Gandhidham", "Gandhinagar", "Gangtok",
        "Gaya", "Gopalpur", "Gudivada", "Gulbarga", "Guntakal", "Guntur", "Gurgaon", "Haldia", "Hapur",
        "Hardwar", "Hazaribagh", "Hindupur", "Hospet", "Howrah", "Imphal", "Itanagar", "Jehanabad", "Jhunjhunu",
        "Kadapa", "Kakinada", "Kalyan", "Kamarhati", "Kanchipuram", "Karaikudi", "Karawal Nagar", "Karimnagar",
        "Karnal", "Katihar", "Khammam", "Kharagpur", "Kirari Suleman Nagar", "Kishanganj", "Kolar", "Kolhapur",
        "Kollam", "Korba", "Kottayam", "Kulti", "Kumbakonam", "Latur", "Loni", "Ludhiana", "Machilipatnam",
        "Madanapalle", "Madhyamgram", "Mahaboobnagar", "Maheshtala", "Malegaon", "Malerkotla", "Mangalore",
        "Mathura", "Mau", "Medinipur", "Mira-Bhayandar", "Miryalaguda", "Mirzapur", "Morbi", "Morena", "Motihari",
        "Munger", "Muzaffarnagar", "Muzaffarpur", "Nadiad", "Nagercoil", "Nagpur", "Naihati", "Nanded", "Nandyal",
        "Narasaraopet", "Nashik", "Nellore", "New Delhi", "Nizamabad", "Ongole", "Orai", "Ozhukarai", "Pali",
        "Pallavaram", "Panchkula", "Panihati", "Panipat", "Panvel", "Parbhani", "Pathankot", "Patiala", "Patna",
        "Phagwara", "Pimpri-Chinchwad", "Pollachi", "Pondicherry", "Proddatur", "Pudukkottai", "Pune", "Puri",
        "Purnia", "Raichur", "Raiganj", "Raipur", "Rajahmundry", "Rajkot", "Rajpur Sonarpur", "Ramagundam",
        "Rampur", "Ranchi", "Ratlam", "Rewa", "Rohtak", "Rourkela", "Sagar", "Saharanpur", "Saharsa", "Salem",
        "Sambalpur", "Sambhal", "Sangli", "Santipur", "Sasaram", "Satara", "Satna", "Secunderabad", "Serampore",
        "Shahjahanpur", "Shimla", "Shimoga", "Shivpuri", "Sikar", "Silchar", "Siliguri", "Singrauli", "Sirsa",
        "Sitapur", "Siwan", "Solapur", "Sonipat", "Sri Ganganagar", "Srikakulam", "Srinagar", "Surendranagar",
        "Suryapet", "Tadepalligudem", "Tadipatri", "Tenali", "Tezpur", "Thanjavur", "Thoothukudi", "Thrissur",
        "Tinsukia", "Tiruchirapalli", "Tirunelveli", "Tirupati", "Tirupur", "Tiruvottiyur", "Tumkur", "Udaipur",
        "Udupi", "Ujjain", "Ulhasnagar", "Uluberia", "Unnao", "Vadodara", "Valsad", "Vapi", "Varanasi", "Vasai-Virar",
        "Vellore", "Vijayawada", "Visakhapatnam", "Vizianagaram", "Warangal", "Yamunanagar", "Yavatmal"
    ];

    // Age of company options
    const ageOptions = ["0-1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

    // Budget options
    const budgetOptions = ["Any budget", "Under ₹5 Lakh", "₹5-10 Lakh", "₹10-20 Lakh", "₹20-50 Lakh", "Above ₹50 Lakh"];

    // Type options
    const typeOptions = ["Residential", "Commercial", "Institutional", "Other"];

    // Category type options
    const categoryOptions = ["Interior Designer", "Architect", "Contractor", "Home Decor"];

    // Payment type options
    const paymentOptions = ["Full Payment", "Installments", "Milestone-based"];

    // Assured options
    const assuredOptions = ["Yes", "No"];

    // Payed status options
    const payedStatusOptions = ["Paid", "Pending", "Not Paid"];



    // useEffect(() => {
    //     // Check if user is authenticated
    //     const token = localStorage.getItem("adminToken");
    //     if (!token) {
    //         navigate("/admin/login");
    //     }
    //     setLoading(false);
    // }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // If the field is "experience" (which is now the year of establishment)
        if (name === "experience") {
            // Calculate years of experience based on current year
            const currentYear = new Date().getFullYear();
            const establishmentYear = parseInt(value);
            
            console.log("Input establishment year:", value, "parsed:", establishmentYear);
            
            // Only calculate if the input is a valid year
            if (!isNaN(establishmentYear) && establishmentYear > 0 && establishmentYear <= currentYear) {
                const yearsOfExperience = currentYear - establishmentYear;
                console.log("Calculated years of experience:", yearsOfExperience);
                setFormData({ 
                    ...formData, 
                    [name]: value,
                    calculatedExperience: yearsOfExperience.toString(), // Store calculated experience
                    yearError: "" // Clear any previous error
                });
            } else {
                // Just update the establishment year without calculating experience
                let errorMsg = "";
                if (value !== "") {
                    if (isNaN(establishmentYear)) {
                        errorMsg = "Please enter a valid year";
                    } else if (establishmentYear <= 0) {
                        errorMsg = "Year must be greater than 0";
                    } else if (establishmentYear > currentYear) {
                        errorMsg = "Year cannot be in the future";
                    }
                }
                
                setFormData({ 
                    ...formData, 
                    [name]: value, 
                    calculatedExperience: "",
                    yearError: errorMsg
                });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e, index = null) => {
        const { name, files } = e.target;
        if (index !== null) {
            const newBannerImages = [...formData.bannerImages];
            newBannerImages[index] = files[0];
            setFormData({ ...formData, bannerImages: newBannerImages });
            
            // Clear the existing banner image at this index to show we're replacing it
            const newExistingBannerImages = [...existingBannerImages];
            newExistingBannerImages[index] = null;
            setExistingBannerImages(newExistingBannerImages);
        } else {
            setFormData({ ...formData, [name]: files[0] });
            
            // If we're changing the logo, clear the existing logo
            if (name === 'logo') {
                setExistingLogo(null);
            }
        }
    };

    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const selectedValues = Array.from(options)
            .filter(option => option.selected)
            .map(option => option.value);
        setFormData({ ...formData, [name]: selectedValues });
    };

    const handleCheckboxChange = (e) => {
        const { name, value, checked } = e.target;
        
        // Get the current array or initialize empty array
        const currentValues = Array.isArray(formData[name]) ? [...formData[name]] : [];
        
        if (checked) {
            // Add the value if it doesn't exist
            if (!currentValues.includes(value)) {
                setFormData({ ...formData, [name]: [...currentValues, value] });
            }
        } else {
            // Remove the value
            setFormData({ 
                ...formData, 
                [name]: currentValues.filter(item => item !== value) 
            });
        }
    };

    // Handle offer tags
    const handleOfferInputChange = (e) => {
        setOfferInput(e.target.value);
    };
    
    const handleOfferKeyDown = (e) => {
        if (e.key === 'Enter' && offerInput.trim()) {
            e.preventDefault();
            const newTags = [...offerTags, offerInput.trim()];
            setOfferTags(newTags);
            setFormData({ ...formData, discountsOfferTimeline: newTags.join(',') });
            setOfferInput('');
        }
    };
    
    const removeOfferTag = (indexToRemove) => {
        const newTags = offerTags.filter((_, index) => index !== indexToRemove);
        setOfferTags(newTags);
        setFormData({ ...formData, discountsOfferTimeline: newTags.join(',') });
    };
    
    // Handle award tags
    const handleAwardInputChange = (e) => {
        setAwardInput(e.target.value);
    };
    
    const handleAwardKeyDown = (e) => {
        if (e.key === 'Enter' && awardInput.trim()) {
            e.preventDefault();
            const newTags = [...awardTags, awardInput.trim()];
            setAwardTags(newTags);
            setFormData({ ...formData, anyAwardWon: newTags.join(',') });
            setAwardInput('');
        }
    };
    
    const removeAwardTag = (indexToRemove) => {
        const newTags = awardTags.filter((_, index) => index !== indexToRemove);
        setAwardTags(newTags);
        setFormData({ ...formData, anyAwardWon: newTags.join(',') });
    };

    // Handle USP tags
    const handleUspInputChange = (e) => {
        setUspInput(e.target.value);
    };

    const handleUspKeyDown = (e) => {
        if (e.key === 'Enter' && uspInput.trim()) {
            e.preventDefault();
            const newTags = [...uspTags, uspInput.trim()];
            setUspTags(newTags);
            setFormData({ ...formData, usp: newTags.join(',') });
            setUspInput('');
        }
    };

    const removeUspTag = (indexToRemove) => {
        const newTags = uspTags.filter((_, index) => index !== indexToRemove);
        setUspTags(newTags);
        setFormData({ ...formData, usp: newTags.join(',') });
    };

    // Add these new functions to handle city search and selection
    const handleCitySearchChange = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setCitySearchInput(searchTerm);
        
        if (searchTerm.length > 0) {
            const filtered = citiesOptions.filter(city => 
                city.toLowerCase().includes(searchTerm)
            ).slice(0, 50); // Limit to 50 results for performance
            
            setFilteredCities(filtered);
            setShowCityDropdown(true);
            setActiveCityIndex(-1); // Reset active index
        } else {
            setFilteredCities([]);
            setShowCityDropdown(false);
        }
    };

    const handleCityKeyDown = (e) => {
        if (!showCityDropdown) return;
        
        // Arrow down
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveCityIndex(prev => 
                prev < filteredCities.length - 1 ? prev + 1 : prev
            );
        }
        // Arrow up
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveCityIndex(prev => prev > 0 ? prev - 1 : 0);
        }
        // Enter - select city
        else if (e.key === 'Enter' && activeCityIndex >= 0) {
            e.preventDefault();
            addCity(filteredCities[activeCityIndex]);
        }
        // Escape - close dropdown
        else if (e.key === 'Escape') {
            e.preventDefault();
            setShowCityDropdown(false);
        }
    };

    const addCity = (city) => {
        if (!formData.availableCities.includes(city)) {
            setFormData({
                ...formData,
                availableCities: [...formData.availableCities, city]
            });
        }
        setCitySearchInput("");
        setShowCityDropdown(false);
    };

    const removeCity = (indexToRemove) => {
        setFormData({
            ...formData,
            availableCities: formData.availableCities.filter((_, i) => i !== indexToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();

        // Required fields validation
        if (!formData.name || !formData.projects || !formData.experience || !formData.branches || !formData.latitude || !formData.longitude) {
            setError("Please fill all required fields");
            setLoading(false);
            return;
        }
        
        // Type validation - ensure at least one type is selected
        if (!formData.type || formData.type.length === 0) {
            setError("Please select at least one company type (Residential, Commercial, etc.)");
            setLoading(false);
            return;
        }

        // Check for year validation error
        if (formData.yearError) {
            setError(`Invalid year of establishment: ${formData.yearError}`);
            setLoading(false);
            return;
        }

        // Check if years of experience was calculated
        if (!formData.calculatedExperience) {
            setError("Please enter a valid year of establishment to calculate years of experience");
            setLoading(false);
            return;
        }

        // Create a sanitized version of formData
        const sanitizedFormData = { ...formData };
        
        // Remove potentially problematic fields
        delete sanitizedFormData.testimonials;
        
        // Ensure availableCities is an array
        if (sanitizedFormData.availableCities && !Array.isArray(sanitizedFormData.availableCities)) {
            if (typeof sanitizedFormData.availableCities === 'string') {
                sanitizedFormData.availableCities = sanitizedFormData.availableCities.split(',');
            } else {
                sanitizedFormData.availableCities = [];
            }
        }
        
        // Ensure numeric fields are numbers
        ['projects', 'branches', 'latitude', 'longitude'].forEach(field => {
            if (sanitizedFormData[field] && typeof sanitizedFormData[field] === 'string') {
                sanitizedFormData[field] = parseFloat(sanitizedFormData[field]);
            }
        });

        // For the experience field, use the calculated experience value instead of the establishment year
        if (sanitizedFormData.calculatedExperience) {
            // Use the calculated experience value for the experience field
            sanitizedFormData.experience = parseInt(sanitizedFormData.calculatedExperience);
            
            // Add the establishment year as a separate field
            sanitizedFormData.establishmentYear = formData.experience;
            
            console.log("Setting experience:", sanitizedFormData.experience, "and establishmentYear:", sanitizedFormData.establishmentYear);
        }
        
        // Remove internal fields that shouldn't be sent to the API
        delete sanitizedFormData.calculatedExperience;
        delete sanitizedFormData.yearError;

        // Detailed logging of form data for debugging
        console.log("Sanitized form data being submitted:", sanitizedFormData);
        
        Object.keys(sanitizedFormData).forEach((key) => {
            if (key === 'bannerImages') {
                sanitizedFormData.bannerImages.forEach((file, index) => {
                    if (file) {
                        console.log(`bannerImage${index}: ${file.name}`);
                        data.append(`bannerImage${index}`, file);
                    }
                });
            } else if (key === 'availableCities') {
                // Handle availableCities array
                if (Array.isArray(sanitizedFormData.availableCities)) {
                    sanitizedFormData.availableCities.forEach(city => {
                        data.append('availableCities', city);
                    });
                }
            } else if (key === 'type') {
                // Handle type array - ensure it's formatted correctly for the backend
                if (Array.isArray(sanitizedFormData.type)) {
                    // Clear any existing type values and set with the new selections
                    // Join types with commas if the backend expects a string
                    const typeString = sanitizedFormData.type.join(',');
                    
                    // Use 'type' as the key to ensure it overwrites any existing value
                    data.append('type', typeString);
                    
                    console.log("Setting type field:", typeString);
                } else if (typeof sanitizedFormData.type === 'string') {
                    data.append('type', sanitizedFormData.type);
                }
            } else if (key === 'paymentType') {
                // Handle paymentType array
                if (Array.isArray(sanitizedFormData.paymentType)) {
                    sanitizedFormData.paymentType.forEach(paymentType => {
                        data.append('paymentType', paymentType);
                    });
                } else if (typeof sanitizedFormData.paymentType === 'string') {
                    data.append('paymentType', sanitizedFormData.paymentType);
                }
            } else if (key === 'serviceCategories') {
                // Handle serviceCategories array
                if (Array.isArray(sanitizedFormData.serviceCategories)) {
                    sanitizedFormData.serviceCategories.forEach(category => {
                        data.append('serviceCategories', category);
                    });
                }
            } else if (key === 'testimonials' || key === 'yearError' || key === 'calculatedExperience') {
                // Skip these fields
                console.log(`Skipping ${key} field to avoid potential issues`);
            } else if (sanitizedFormData[key] !== null && sanitizedFormData[key] !== '') {
                if (sanitizedFormData[key] instanceof File) {
                    console.log(`${key}: ${sanitizedFormData[key].name}`);
                    data.append(key, sanitizedFormData[key]);
                } else {
                    console.log(`${key}: ${sanitizedFormData[key]}`);
                    data.append(key, sanitizedFormData[key]);
                }
            }
        });

        try {
            console.log("Submitting to URL:", `${API_URL}/companies/edit/${id}`);

            const token = localStorage.getItem("adminToken");
            console.log("Using token:", token ? "Token exists" : "No token");

            const response = await axios.put(`${API_URL}/companies/edit/${id}`, data, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    "Content-Type": "multipart/form-data",
                },
                timeout: 120000, // 2min second timeout
            });

            console.log("Response received:", response);

            // Reset form after successful submission
            setFormData({
                name: "",
                projects: "",
                experience: "",
                calculatedExperience: "",
                yearError: "",
                branches: "",
                logo: null,
                registeredCompanyName: "",
                nameDisplay: "",
                description: "",
                ageOfCompany: "",
                availableCities: [],
                officialWebsite: "",
                fullName: "",
                designation: "",
                phoneNumber: "",
                minMaxBudget: "",
                type: [],
                bannerImages: Array(10).fill(null),
                discountsOfferTimeline: "",
                numberOfProjectsCompleted: "",
                digitalBrochure: null,
                usp: "",
                contactEmail: "",
                googleRating: "",
                googleReviews: "",
                anyAwardWon: "",
                categoryType: "",
                paymentType: [],
                assured: "",
                latitude: "",
                longitude: "",
                workInTeams: "",
                deliveryTimeline: "",
                basicPriceRange: "",
                premiumPriceRange: "",
                luxuryPriceRange: "",
                serviceCategories: [],
                payedStatus: "", // Reset payment status
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
            window.scrollTo(0, 0);
            console.log("Company edited successfully:", response.data);
            navigate(`/admin/showCompanies`);
        } catch (error) {
            console.error("Error editing company:", error);
            console.error("Error details:", error.response?.data);
            // Log more detailed error information
            console.error("Error response:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            // Use the detailed error from the server if available
            let errorMessage = "Failed to edit company";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
                // If there are validation errors, list them
                if (error.response.data.validation) {
                    const validationErrors = error.response.data.validation
                        .map(err => `${err.field}: ${err.message}`)
                        .join(', ');
                    errorMessage += ` - ${validationErrors}`;
                }
            }

            setError(errorMessage);
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        // Show a confirmation dialog before deleting
        if (!window.confirm(`Are you sure you want to delete the company "${formData.name}"? This action cannot be undone.`)) {
            return; // User cancelled
        }
        
        setLoading(true);
        setError(null);
        try {
            console.log("Deleting company:", id);

            const token = localStorage.getItem("adminToken");
            console.log("Using token:", token ? "Token exists" : "No token");

            const response = await axios.delete(`${API_URL}/companies/delete/${id}`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                },
                timeout: 60000, // 1 minute timeout
            });

            console.log("Response received:", response);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
            window.scrollTo(0, 0);
            console.log("Company deleted successfully:", response.data);
            
            // Redirect after a short delay to allow the user to see the success message
            setTimeout(() => {
                navigate('/admin/showCompanies');
            }, 2000);
        } catch (error) {
            console.error("Error deleting company:", error);
            console.error("Error details:", error.response?.data);

            // Use the detailed error from the server if available
            let errorMessage = "Failed to delete company";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            setError(errorMessage);
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-3">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Company Edit Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                        <div>
                            <span className="font-bold">Success!</span> Company data edited successfully.
                        </div>
                        <button onClick={() => setSuccess(false)} className="text-green-700">
                            &times;
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Add Company Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Edit Company</h2>
                    <div className="text-sm text-gray-600 mb-4">Fields marked with <span className="text-red-500">*</span> are required</div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Original fields */}
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Company Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Company Name"
                                    className="w-full p-2 border rounded"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Number of Projects <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="projects"
                                    placeholder="Number of Projects"
                                    className="w-full p-2 border rounded"
                                    value={formData.projects}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">
                                    Year of establishment <span className="text-red-500">*</span>
                                    <span className="relative ml-1 group">
                                        <span className="cursor-help text-gray-500">ⓘ</span>
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 w-48 hidden group-hover:block">
                                            Enter the year when the company was established. Years of experience will be calculated automatically.
                                        </div>
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    name="experience"
                                    placeholder="Year of establishment (e.g., 2010)"
                                    className={`w-full p-2 border rounded ${formData.yearError ? 'border-red-500' : ''}`}
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    min="1800"
                                    max={new Date().getFullYear()}
                                    required
                                />
                                {formData.yearError ? (
                                    <p className="text-sm text-red-600 mt-1">
                                        {formData.yearError}
                                    </p>
                                ) : formData.calculatedExperience ? (
                                    <p className="text-sm text-green-600 mt-1">
                                        Years of Experience: <strong>{formData.calculatedExperience} years</strong>
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter the year when the company was established.
                                    </p>
                                )}
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Number of Branches <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="branches"
                                    placeholder="Number of Branches"
                                    className="w-full p-2 border rounded"
                                    value={formData.branches}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Company Logo</label>
                                <div className="mb-2">
                                    {existingLogo && (
                                        <div className="mb-2">
                                            <p className="text-sm text-gray-600 mb-1">Current logo:</p>
                                            <img 
                                                src={existingLogo} 
                                                alt="Current logo" 
                                                className="w-20 h-20 object-cover border rounded"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        name="logo"
                                        accept="image/*"
                                        className="w-full p-2 border rounded"
                                        onChange={(e) => handleFileChange(e)}
                                    />
                                    <p className="text-xs text-red-500">Image Size Should Be 200x200 PX</p>
                                </div>
                            </div>

                            {/* New fields from screenshots */}
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Registered Company Name</label>
                                <input
                                    type="text"
                                    name="registeredCompanyName"
                                    placeholder="Registered Company Name"
                                    className="w-full p-2 border rounded"
                                    value={formData.registeredCompanyName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Name Display <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="nameDisplay"
                                    placeholder="Display Name"
                                    className="w-full p-2 border rounded"
                                    value={formData.nameDisplay}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                                <textarea
                                    name="description"
                                    placeholder="Description"
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                ></textarea>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Age of Company</label>
                                <select
                                    name="ageOfCompany"
                                    className="w-full p-2 border rounded"
                                    value={formData.ageOfCompany}
                                    onChange={handleInputChange}
                                >
                                    <option value="" disabled>Select Age of Company</option>
                                    {ageOptions.map((option, index) => (
                                        <option key={index} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">
                                    Available Cities/Locations
                                    <span className="text-xs text-gray-500 ml-1">(Where your company operates)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search cities..."
                                        className="w-full p-2 border rounded mb-2"
                                        value={citySearchInput}
                                        onChange={handleCitySearchChange}
                                        onKeyDown={handleCityKeyDown}
                                        onFocus={() => citySearchInput && setShowCityDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                                    />
                                    
                                    {showCityDropdown && (
                                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto">
                                            {filteredCities.length > 0 ? (
                                                filteredCities.map((city, index) => (
                                                    <div 
                                                        key={index} 
                                                        className={`p-2 cursor-pointer ${index === activeCityIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                                        onClick={() => addCity(city)}
                                                        onMouseEnter={() => setActiveCityIndex(index)}
                                                    >
                                                        {city}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-2 text-gray-500">No cities found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Popular cities section */}
                                {formData.availableCities.length === 0 && (
                                    <div className="mt-2 mb-3">
                                        <p className="text-sm font-medium mb-1">Popular cities:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {popularCities.map((city, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                                                    onClick={() => addCity(city)}
                                                >
                                                    {city}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Display selected cities as tags */}
                                {formData.availableCities.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium mb-1">Selected cities ({formData.availableCities.length}):</p>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.availableCities.map((city, index) => (
                                                <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center text-sm">
                                                    {city}
                                                    <button 
                                                        type="button"
                                                        className="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                                                        onClick={() => removeCity(index)}
                                                        aria-label={`Remove ${city}`}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                                            onClick={() => setFormData({...formData, availableCities: []})}
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Link to Official Website</label>
                                <input
                                    type="url"
                                    name="officialWebsite"
                                    placeholder="https://example.com"
                                    className="w-full p-2 border rounded"
                                    value={formData.officialWebsite}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    className="w-full p-2 border rounded"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    placeholder="Designation"
                                    className="w-full p-2 border rounded"
                                    value={formData.designation}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Phone Number"
                                    className="w-full p-2 border rounded"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Min-Max Budget</label>
                                <select
                                    name="minMaxBudget"
                                    className="w-full p-2 border rounded"
                                    value={formData.minMaxBudget}
                                    onChange={handleInputChange}
                                >
                                    <option value="" disabled>Select Min-Max Budget</option>
                                    {budgetOptions.map((option, index) => (
                                        <option key={index} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">
                                    Type <span className="text-red-500">*</span>
                                    <span className="text-xs text-gray-500 ml-1">(Used for filtering spaces)</span>
                                </label>
                                <div className="space-y-2 p-3 border rounded bg-gray-50">
                                    {typeOptions.map((option, index) => (
                                        <div key={index} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`type-${option}`}
                                                name="type"
                                                value={option}
                                                checked={formData.type.includes(option)}
                                                onChange={handleCheckboxChange}
                                                className="mr-2 h-4 w-4 text-blue-600"
                                                required={formData.type.length === 0}
                                            />
                                            <label htmlFor={`type-${option}`} className="text-sm font-medium">
                                                {option}
                                            </label>
                                        </div>
                                    ))}
                                    {formData.type.length === 0 && (
                                        <p className="text-xs text-red-500 mt-1">
                                            Please select at least one type
                                        </p>
                                    )}
                                    {formData.type.length > 0 && (
                                        <div className="mt-2 text-xs text-green-600">
                                            Selected: {formData.type.join(', ')}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    This will determine if the company shows on Residential or Commercial space pages
                                </p>
                            </div>
                        </div>

                        {/* Banner Images */}
                        <div className="mt-6">
                            <h3 className="text-lg font-medium mb-4">Banner Images</h3>
                            <div className="mb-4">
                                <button 
                                    type="button" 
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    onClick={() => {
                                        // Find the first empty slot
                                        const emptyIndex = existingBannerImages.findIndex(img => img === null);
                                        if (emptyIndex >= 0) {
                                            // Focus the file input for that slot
                                            const fileInput = document.getElementById(`bannerImage${emptyIndex}`);
                                            if (fileInput) fileInput.click();
                                        } else if (existingBannerImages.length < 10) {
                                            // Add a new empty slot
                                            setExistingBannerImages([...existingBannerImages, null]);
                                        } else {
                                            alert("Maximum 10 banner images allowed. Please remove one to add another.");
                                        }
                                    }}
                                >
                                    Add Banner Image
                                </button>
                                <span className="ml-2 text-sm text-gray-500">
                                    {existingBannerImages.filter(Boolean).length} of 10 banner images used
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {existingBannerImages.map((image, index) => (
                                    <div key={index} className="col-span-1 relative">
                                        <label className="block text-gray-700 mb-2">Banner Image ({index + 1})</label>
                                        {image && (
                                            <div className="mb-2 relative group">
                                                <img 
                                                    src={image} 
                                                    alt={`Current banner ${index + 1}`} 
                                                    className="w-full h-32 object-cover border rounded"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        // Create a copy of the array
                                                        const newBannerImages = [...existingBannerImages];
                                                        // Set this slot to null
                                                        newBannerImages[index] = null;
                                                        setExistingBannerImages(newBannerImages);
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            id={`bannerImage${index}`}
                                            type="file"
                                            name={`bannerImage${index}`}
                                            accept="image/*"
                                            className="w-full p-2 border rounded"
                                            onChange={(e) => handleFileChange(e, index)}
                                        />
                                        <p className="text-xs text-red-500">Image Size Should Be 1350x400 PX</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Discounts/Offer/Timeline</label>
                                <div className="w-full p-2 border rounded bg-white min-h-[100px]">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {offerTags.map((tag, index) => (
                                            <div key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                {tag}
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeOfferTag(index)}
                                                    className="ml-2 text-orange-600 hover:text-orange-800"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={offerInput}
                                        onChange={handleOfferInputChange}
                                        onKeyDown={handleOfferKeyDown}
                                        placeholder="Type offer and press Enter"
                                        className="w-full p-1 border-b border-gray-300 focus:outline-none focus:border-[#006452]"
                                    />
                                    <input 
                                        type="hidden" 
                                        name="discountsOfferTimeline" 
                                        value={formData.discountsOfferTimeline} 
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Press Enter to add each offer</p>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">No. of Projects Completed/Awards</label>
                                <textarea
                                    name="numberOfProjectsCompleted"
                                    placeholder="No. of Projects Completed/Awards"
                                    className="w-full p-2 border rounded"
                                    value={formData.numberOfProjectsCompleted}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Digital Brochure (PDF only)</label>
                                <input
                                    type="file"
                                    name="digitalBrochure"
                                    accept=".pdf"
                                    className="w-full p-2 border rounded"
                                    onChange={(e) => handleFileChange(e)}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">USP (Unique Selling Points)</label>
                                <div className="w-full p-2 border rounded bg-white min-h-[100px]">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {uspTags.map((tag, index) => (
                                            <div key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeUspTag(index)}
                                                    className="ml-2 text-purple-600 hover:text-purple-800"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={uspInput}
                                        onChange={handleUspInputChange}
                                        onKeyDown={handleUspKeyDown}
                                        placeholder="Type USP and press Enter"
                                        className="w-full p-1 border-b border-gray-300 focus:outline-none focus:border-[#006452]"
                                    />
                                    <input
                                        type="hidden"
                                        name="usp"
                                        value={formData.usp}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Press Enter to add each USP</p>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Contact Email Address</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    placeholder="Contact Email Address"
                                    className="w-full p-2 border rounded"
                                    value={formData.contactEmail}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Google Rating</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="googleRating"
                                        placeholder="Enter rating (0.0 - 5.0)"
                                        className="w-full p-2 border rounded"
                                        value={formData.googleRating}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="5"
                                        step="0.1"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <span className="text-yellow-500">★</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Enter a value between 0.0 and 5.0</p>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Google Reviews</label>
                                <textarea
                                    name="googleReviews"
                                    placeholder="Google Reviews"
                                    className="w-full p-2 border rounded"
                                    value={formData.googleReviews}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Latitude <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="latitude"
                                    placeholder="Latitude (e.g., 23.0225)"
                                    className="w-full p-2 border rounded"
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                    required
                                />
                                <p className="text-xs text-gray-500">Decimal format (e.g., 23.0225)</p>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Longitude <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="longitude"
                                    placeholder="Longitude (e.g., 72.5714)"
                                    className="w-full p-2 border rounded"
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                    required
                                />
                                <p className="text-xs text-gray-500">Decimal format (e.g., 72.5714)</p>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Any Award Won</label>
                                <div className="w-full p-2 border rounded bg-white min-h-[100px]">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {awardTags.map((tag, index) => (
                                            <div key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                {tag}
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeAwardTag(index)}
                                                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={awardInput}
                                        onChange={handleAwardInputChange}
                                        onKeyDown={handleAwardKeyDown}
                                        placeholder="Type award and press Enter"
                                        className="w-full p-1 border-b border-gray-300 focus:outline-none focus:border-[#006452]"
                                    />
                                    <input 
                                        type="hidden" 
                                        name="anyAwardWon" 
                                        value={formData.anyAwardWon} 
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Press Enter to add each award</p>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Category Type</label>
                                <select
                                    name="categoryType"
                                    className="w-full p-2 border rounded"
                                    value={formData.categoryType}
                                    onChange={handleInputChange}
                                >
                                    <option value="" disabled>Select Type</option>
                                    {categoryOptions.map((option, index) => (
                                        <option key={index} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Payment Type</label>
                                <div className="space-y-2">
                                    {paymentOptions.map((option, index) => (
                                        <div key={index} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`payment-${option}`}
                                                name="paymentType"
                                                value={option}
                                                checked={formData.paymentType.includes(option)}
                                                onChange={handleCheckboxChange}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`payment-${option}`}>{option}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Assured</label>
                                <select
                                    name="assured"
                                    className="w-full p-2 border rounded"
                                    value={formData.assured}
                                    onChange={handleInputChange}
                                >
                                    <option value="" disabled>Select Assured</option>
                                    {assuredOptions.map((option, index) => (
                                        <option key={index} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Payed or Not</label>
                                <select
                                    name="payedStatus"
                                    className="w-full p-2 border rounded"
                                    value={formData.payedStatus}
                                    onChange={handleInputChange}
                                >
                                    <option value="" disabled>Select Payment Status</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Not Paid">Not Paid</option>
                                </select>
                            </div>
                        </div>

                        {/* Price Range Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="col-span-3">
                                <h3 className="text-lg font-medium mb-2">Price Range Categories</h3>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Basic Price Range <span className="text-red-500">*</span></label>
                                <div className="flex items-center">
                                    <span className="text-gray-500 mr-1">₹</span>
                                    <input
                                        type="text"
                                        name="basicPriceRange"
                                        placeholder="1000-5000"
                                        className="w-full p-2 border rounded"
                                        value={formData.basicPriceRange}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Format: min-max (e.g., 1000-5000)</p>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Premium Price Range <span className="text-red-500">*</span></label>
                                <div className="flex items-center">
                                    <span className="text-gray-500 mr-1">₹</span>
                                    <input
                                        type="text"
                                        name="premiumPriceRange"
                                        placeholder="5000-10000"
                                        className="w-full p-2 border rounded"
                                        value={formData.premiumPriceRange}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Format: min-max (e.g., 5000-10000)</p>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Luxury Price Range <span className="text-red-500">*</span></label>
                                <div className="flex items-center">
                                    <span className="text-gray-500 mr-1">₹</span>
                                    <input
                                        type="text"
                                        name="luxuryPriceRange"
                                        placeholder="10000-20000"
                                        className="w-full p-2 border rounded"
                                        value={formData.luxuryPriceRange}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Format: min-max (e.g., 10000-20000)</p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>

                            <button
                                type="button"
                                className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-500"
                                disabled={loading}
                                onClick={handleDelete}
                            >
                                {loading ? 'Deleting...' : 'Delete Company'}
                            </button>
                            
                            <button
                                type="button"
                                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                                disabled={loading}
                                onClick={() => navigate('/admin/showCompanies')}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Form Instructions */}
                <div className="mt-4 p-4 bg-blue-100 text-blue-800 rounded-md mb-8">
                    <h3 className="font-bold mb-2">Registration Instructions</h3>
                    <p>Fill out all relevant details in the form above to register a company. Fields marked with * are required.</p>
                    <p className="mt-2">For best results:</p>
                    <ul className="list-disc ml-6 mt-1">
                        <li>Upload company logo at 200x200px</li>
                        <li>Banner images should be 1350x400px</li>
                        <li>Brochure and testimonials must be in PDF format</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default EditCompany
