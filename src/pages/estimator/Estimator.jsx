import React, { useState, useEffect } from 'react';
import Stepper, { Step } from '../../components/estimator components/Stepper';
import ScopeSelection from '../../components/estimator components/ScopeSelection';
import HomeType from '../../components/estimator components/HomeType';
import RoomSelection from '../../components/estimator components/Roomselection';
import PackageSelection from '../../components/estimator components/PackageSelection';
import UserDetails from '../../components/estimator components/UserDetails';
import Header from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { motion } from "framer-motion";
import backgroundImage from "../../assets/background.png";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for API calls

function Estimator() {
    // Get the company pricing data from navigation state
    const location = useLocation();
    const companyPriceData = location.state?.priceData;
    const companyId = location.state?.companyId;
    const companyName = location.state?.companyName;
    const navigate = useNavigate();

    // State for averaged pricing data from all companies
    const [averagePricing, setAveragePricing] = useState({
        basicPriceRange: 0,
        premiumPriceRange: 0,
        luxuryPriceRange: 0
    });

    // Loading state for price fetching
    const [loadingPrices, setLoadingPrices] = useState(true);

    const [formData, setFormData] = useState({
        scope: '',
        homeType: '',
        carpetArea: '',
        rooms: [],
        package: '',
        userDetails: {
            name: '',
            email: '',
            phone: '',
            city: '',
        },
        estimatedCost: 0,
        companyId: companyId || null,
        companyName: companyName || null
    });

    // State to track stepper content height
    const [stepperHeight, setStepperHeight] = useState(0);
    // Reference to the stepper container
    const stepperContainerRef = React.useRef(null);
    const validateStep = (step) => {
        switch (step) {
            case 1: // Scope Selection
                if (!formData.scope) {
                    alert('Please select a scope of work');
                    return false;
                }
                return true;

            case 2: // Home Type
                if (!formData.homeType) {
                    alert('Please select a home type');
                    return false;
                }
                if (!formData.carpetArea) {
                    alert('Please enter carpet area in sq. ft.');
                    return false;
                }
                // Validate that carpet area is a number
                if (isNaN(parseFloat(formData.carpetArea))) {
                    alert('Carpet area must be a number');
                    return false;
                }
                return true;

            case 3: // Room Selection
                if (formData.rooms.length === 0) {
                    alert('Please select at least one room');
                    return false;
                }
                return true;

            case 4: // Package Selection
                if (!formData.package) {
                    alert('Please select a package');
                    return false;
                }
                return true;

            case 5: // User Details
                if (!formData.userDetails.name) {
                    alert('Please enter your name');
                    return false;
                }
                if (!formData.userDetails.email) {
                    alert('Please enter your email');
                    return false;
                }
                if (!formData.userDetails.phone) {
                    alert('Please enter your phone number');
                    return false;
                }
                if (!formData.userDetails.city) {
                    alert('Please enter your city');
                    return false;
                }

                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.userDetails.email)) {
                    alert('Please enter a valid email address');
                    return false;
                }

                // Phone validation - basic 10-digit check
                const phoneDigits = formData.userDetails.phone.replace(/\D/g, '');
                if (phoneDigits.length !== 10) {
                    alert('Please enter a valid 10-digit phone number');
                    return false;
                }

                return true;

            default:
                return true;
        }
    };

    // Fetch average pricing data from all companies
    useEffect(() => {
        const fetchAveragePrices = async () => {
            try {
                setLoadingPrices(true);
                const response = await axios.get('https://inty-backend.onrender.com/api/companies');
                const companies = response.data;

                if (companies && companies.length > 0) {
                    let totalBasic = 0;
                    let totalPremium = 0;
                    let totalLuxury = 0;
                    let countBasic = 0;
                    let countPremium = 0;
                    let countLuxury = 0;

                    companies.forEach(company => {
                        // Process basic price
                        if (company.basicPriceRange) {
                            const basicPrice = parseFloat(company.basicPriceRange);
                            if (!isNaN(basicPrice)) {
                                totalBasic += basicPrice;
                                countBasic++;
                            }
                        }

                        // Process premium price
                        if (company.premiumPriceRange) {
                            const premiumPrice = parseFloat(company.premiumPriceRange);
                            if (!isNaN(premiumPrice)) {
                                totalPremium += premiumPrice;
                                countPremium++;
                            }
                        }

                        // Process luxury price
                        if (company.luxuryPriceRange) {
                            const luxuryPrice = parseFloat(company.luxuryPriceRange);
                            if (!isNaN(luxuryPrice)) {
                                totalLuxury += luxuryPrice;
                                countLuxury++;
                            }
                        }
                    });

                    // Calculate averages across all companies
                    const avgBasic = countBasic > 0 ? totalBasic / countBasic : 150;
                    const avgPremium = countPremium > 0 ? totalPremium / countPremium : 500;
                    const avgLuxury = countLuxury > 0 ? totalLuxury / countLuxury : 1500;

                    setAveragePricing({
                        basicPriceRange: avgBasic,
                        premiumPriceRange: avgPremium,
                        luxuryPriceRange: avgLuxury
                    });

                    console.log('Average pricing calculated:', {
                        basicPriceRange: avgBasic,
                        premiumPriceRange: avgPremium,
                        luxuryPriceRange: avgLuxury
                    });
                } else {
                    // No companies found, use default values
                    setAveragePricing({
                        basicPriceRange: 150,
                        premiumPriceRange: 500,
                        luxuryPriceRange: 1500
                    });
                }
            } catch (error) {
                console.error('Error fetching companies for pricing calculation:', error);
                // Use default values in case of error
                setAveragePricing({
                    basicPriceRange: 150,
                    premiumPriceRange: 500,
                    luxuryPriceRange: 1500
                });
            } finally {
                setLoadingPrices(false);
            }
        };

        fetchAveragePrices();
    }, []);

    // Update height when content changes
    useEffect(() => {
        if (stepperContainerRef.current) {
            const height = stepperContainerRef.current.clientHeight;
            if (height !== stepperHeight) {
                setStepperHeight(height);
            }
        }

        // Set up resize observer to monitor height changes
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setStepperHeight(entry.contentRect.height);
            }
        });

        if (stepperContainerRef.current) {
            resizeObserver.observe(stepperContainerRef.current);
        }

        return () => {
            if (stepperContainerRef.current) {
                resizeObserver.unobserve(stepperContainerRef.current);
            }
        };
    }, [formData, stepperHeight]);

    // Determine which pricing to use
    const getPackageMultipliers = () => {
        // If a specific company is selected, use their pricing
        if (companyId && companyPriceData) {
            return {
                'Basic': companyPriceData.basicPriceRange ? parseFloat(companyPriceData.basicPriceRange) : averagePricing.basicPriceRange,
                'Premium': companyPriceData.premiumPriceRange ? parseFloat(companyPriceData.premiumPriceRange) : averagePricing.premiumPriceRange,
                'Luxury': companyPriceData.luxuryPriceRange ? parseFloat(companyPriceData.luxuryPriceRange) : averagePricing.luxuryPriceRange
            };
        }

        // Otherwise use the average pricing from all companies
        return {
            'Basic': averagePricing.basicPriceRange,
            'Premium': averagePricing.premiumPriceRange,
            'Luxury': averagePricing.luxuryPriceRange
        };
    };

    const handleCalculateEstimatedCost = (data) => {
        const packageMultipliers = getPackageMultipliers();

        // Use the appropriate multiplier based on selected package
        const multiplier = packageMultipliers[data.package] || 0;

        // Calculate cost: Carpet Area * Package Multiplier
        const carpetArea = parseFloat(data.carpetArea) || 0;
        const cost = carpetArea * multiplier;

        // Return the actual number, not the formatted string with commas
        return Math.round(cost);
    };

    useEffect(() => {
        // Calculate estimated cost whenever carpet area or package changes
        if (formData.carpetArea && formData.package) {
            const estimatedCost = handleCalculateEstimatedCost(formData);
            setFormData(prev => ({
                ...prev,
                estimatedCost
            }));
        }
    }, [formData.carpetArea, formData.package, averagePricing]);

    const handleFormSubmit = async () => {
        try {
            // Enhanced validation - check all required fields
            if (!formData.userDetails.name ||
                !formData.userDetails.email ||
                !formData.userDetails.phone ||
                !formData.userDetails.city ||
                !formData.scope ||
                !formData.homeType ||
                !formData.carpetArea ||
                formData.rooms.length === 0 ||
                !formData.package) {
                alert('Please fill in all required fields');
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.userDetails.email)) {
                alert('Please enter a valid email address');
                return;
            }

            // Phone validation (basic)
            if (!/^\d{10}$/.test(formData.userDetails.phone.replace(/\D/g, ''))) {
                alert('Please enter a valid 10-digit phone number');
                return;
            }

            // Create a copy of formData for submission
            const submissionData = { ...formData };

            // Ensure estimatedCost is a number, not a formatted string
            if (typeof submissionData.estimatedCost === 'string') {
                submissionData.estimatedCost = parseInt(submissionData.estimatedCost.replace(/,/g, ''));
            }

            // Show request being made
            console.log('Sending data to:', 'https://inty-backend.onrender.com/api/users/quote');
            console.log('Request data:', JSON.stringify(submissionData, null, 2));

            const response = await fetch('https://inty-backend.onrender.com/api/users/quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            // Log the raw response to debug
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            // Try to parse as JSON if possible
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                throw new Error('Server returned an invalid response. Check server logs.');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit quote');
            }

            alert('Quote submitted successfully! Check your email for details.');
            navigate('/');
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Failed to submit quote. Please try again.');
        }
    };


    // Summary component with company pricing data
    const Summary = ({ formData }) => {
        const packageMultipliers = getPackageMultipliers();

        // Calculate costs for all package options for comparison
        const calculateCost = (packageType) => {
            const carpetArea = parseFloat(formData.carpetArea) || 0;
            const cost = carpetArea * (packageMultipliers[packageType] || 0);
            return Math.round(cost).toLocaleString();
        };

        // Get costs for all packages
        const basicCost = calculateCost('Basic');
        const premiumCost = calculateCost('Premium');
        const luxuryCost = calculateCost('Luxury');

        return (
            <div className="w-full max-w-lg mx-auto p-5 sm:p-6 bg-white shadow-md rounded-lg border border-gray-100">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-[#006452]">Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-md">
                        <p><strong className="text-[#006452]">Scope:</strong> {formData.scope}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                        <p><strong className="text-[#006452]">Home Type:</strong> {formData.homeType}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                        <p><strong className="text-[#006452]">Carpet Area:</strong> {formData.carpetArea} sq ft</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                        <p><strong className="text-[#006452]">Package:</strong> {formData.package}</p>
                    </div>
                    {formData.companyName && (
                        <div className="p-3 bg-gray-50 rounded-md sm:col-span-2">
                            <p><strong className="text-[#006452]">Company:</strong> {formData.companyName}</p>
                        </div>
                    )}
                    <div className="p-3 bg-gray-50 rounded-md sm:col-span-2">
                        <p><strong className="text-[#006452]">Selected Rooms:</strong></p>
                        <ul className="mt-2 ml-4 space-y-1">
                            {(() => {
                                // Count occurrences of each room type
                                const roomCounts = {};
                                formData.rooms.forEach(room => {
                                    // Extract base room type (remove numbers if present)
                                    const baseRoomType = room.split(' ').filter(part => isNaN(part)).join(' ');
                                    roomCounts[baseRoomType] = (roomCounts[baseRoomType] || 0) + 1;
                                });

                                // Return list items for each room type with count
                                return Object.entries(roomCounts).map(([roomType, count]) => (
                                    <li key={roomType}>
                                        {roomType}: <span className="font-medium">{count}</span>
                                    </li>
                                ));
                            })()}
                        </ul>
                    </div>
                    <div className="p-4 bg-[#e6f2ef] rounded-md mt-2 sm:col-span-2">
                        <p className="text-lg font-bold text-[#006452]">Estimated Cost: ₹{typeof formData.estimatedCost === 'number' ? formData.estimatedCost.toLocaleString() : formData.estimatedCost}</p>
                    </div>

                    {/* Package comparison section */}
                    <div className="p-3 bg-gray-50 rounded-md mt-2 sm:col-span-2">
                        <p className="text-sm font-medium text-[#006452] mb-2">Cost Comparison:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                            <div className={`p-2 rounded ${formData.package === 'Basic' ? 'bg-[#e6f2ef] border border-[#006452]' : 'bg-white border'}`}>
                                <p className="font-medium">Basic Package:</p>
                                <p>₹{basicCost}</p>
                            </div>
                            <div className={`p-2 rounded ${formData.package === 'Premium' ? 'bg-[#e6f2ef] border border-[#006452]' : 'bg-white border'}`}>
                                <p className="font-medium">Premium Package:</p>
                                <p>₹{premiumCost}</p>
                            </div>
                            <div className={`p-2 rounded ${formData.package === 'Luxury' ? 'bg-[#e6f2ef] border border-[#006452]' : 'bg-white border'}`}>
                                <p className="font-medium">Luxury Package:</p>
                                <p>₹{luxuryCost}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ThankYou component remains the same
    const ThankYou = () => (
        <div className="w-full max-w-lg mx-auto p-5 sm:p-6 bg-white shadow-md rounded-lg border border-gray-100 text-center">
            <div className="mb-6">
                <svg className="mx-auto h-16 w-16 text-[#006452]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-[#006452]">Thank You!</h2>
            <p className="text-gray-600 mb-4">
                Your quote has been successfully submitted. We've sent the detailed estimation to your email.
            </p>
            <p className="text-gray-600">
                Our team will contact you shortly to discuss the next steps.
            </p>
        </div>
    );

    // Display loading message while fetching prices
    if (loadingPrices) {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="w-full bg-transparent z-50">
                    <Header />
                </div>
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006452] mb-4"></div>
                        <p className="text-lg text-[#006452]">Loading estimator...</p>
                    </div>
                </div>
                <div className="mt-auto">
                    <Footer />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden max-w-full">
            {/* Header */}
            <div className="w-full bg-transparent z-50">
                <Header />
            </div>

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative h-[300px] md:h-[400px] bg-cover bg-center text-white flex items-center justify-center"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(250,250,250,0.85)] to-[rgba(0,100,82,0.85)]"></div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="z-10 font-inter font-black text-4xl md:text-[64px] leading-[77.45px] tracking-normal text-white"
                >
                    Cost Estimator
                </motion.h2>
            </motion.section>

            {/* Main Content */}
            <div className="w-full mx-auto px-4 py-6 flex-grow">
                <div className="text-center mb-6 px-4">
                    <h3 className="text-lg font-medium text-[#006452]">
                        Complete the steps below to receive your personalized quote
                    </h3>
                    {companyName && (
                        <p className="text-sm text-gray-600 mt-2">
                            Estimating costs for <span className="font-medium text-[#006452]">{companyName}</span>
                        </p>
                    )}
                    {!companyName && (
                        <p className="text-sm text-gray-600 mt-2">
                            {/* Using average industry rates from {averagePricing ? Object.values(averagePricing).filter(val => val > 0).length : 0} companies */}
                            Using average industry rates form companies
                        </p>
                    )}
                </div>

                {/* Stepper container with ref for height tracking */}
                <div
                    ref={stepperContainerRef}
                    className="bg-white rounded-lg shadow-sm flex-grow"
                    style={{ transition: 'all 0.3s ease' }}
                >
                    <Stepper
                        initialStep={1}
                        onStepChange={(step) => console.log('Current Step:', step)}
                        onFinalStepCompleted={handleFormSubmit}
                        stepContainerClassName="flex items-center justify-center p-4 overflow-x-auto space-x-2"
                        contentClassName="py-6"
                        nextButtonProps={{
                            className: "duration-350 flex items-center justify-center rounded-lg bg-[#006452] py-2 px-4 font-medium tracking-tight text-white transition hover:bg-[#005443] active:bg-[#004434]"
                        }}
                        nextButtonText="Continue"
                        backButtonProps={{
                            className: "duration-350 flex items-center justify-center rounded-lg border border-[#006452] py-2 px-4 font-medium tracking-tight text-[#006452] transition hover:bg-[#f0f9f6]"
                        }}
                        validateStep={validateStep} // Pass the validation function to Stepper
                    >
                        <Step>
                            <ScopeSelection formData={formData} setFormData={setFormData} />
                        </Step>
                        <Step>
                            <HomeType formData={formData} setFormData={setFormData} />
                        </Step>
                        <Step>
                            <RoomSelection formData={formData} setFormData={setFormData} />
                        </Step>
                        <Step>
                            <PackageSelection formData={formData} setFormData={setFormData} />
                        </Step>
                        <Step>
                            <UserDetails formData={formData} setFormData={setFormData} />
                        </Step>
                        <Step>
                            <Summary formData={formData} />
                        </Step>
                    </Stepper>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
}

export default Estimator;