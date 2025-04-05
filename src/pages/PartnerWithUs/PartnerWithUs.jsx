// PartnerWithUs.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../../components/ui/Button";
import Header from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import backgroundImage from "../../assets/background.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PartnerWithUs() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);

  // For signup/login form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "", // "company", "designer", or "craftsman"
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // API URL - using environment variable if available, otherwise hardcoded
  // Add fallback to production API if localhost fails
  const LOCAL_API_URL = 'http://localhost:3000/api';
  const PRODUCTION_API_URL = 'https://inty-backend.onrender.com/api';
  const [apiUrl, setApiUrl] = useState(LOCAL_API_URL);

  // Debug API URL
  console.log("Using API URL:", apiUrl);

  // Add function to switch API URLs if needed
  const switchToProductionApi = () => {
    console.log("Switching to production API URL");
    setApiUrl(PRODUCTION_API_URL);
    return PRODUCTION_API_URL;
  };

  useEffect(() => {
    setIsVisible(true);
  }, [apiUrl]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
      toast.dismiss(); // Dismiss any error toasts related to this field
    }
  };

  const validateSignupForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    } else if (formData.email.length > 100) {
      newErrors.email = "Email is too long (max 100 characters)";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (formData.password.length > 50) {
      newErrors.password = "Password is too long (max 50 characters)";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Please select a role";
    } else if (!["company", "designer", "craftsman"].includes(formData.role)) {
      newErrors.role = "Please select a valid role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLoginForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    } else if (formData.email.length > 100) {
      newErrors.email = "Email is too long (max 100 characters)";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (formData.password.length > 50) {
      newErrors.password = "Password is too long (max 50 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateSignupForm()) {
      // Validate again and show specific toast errors for validation issues
      if (errors.email) {
        toast.error(`Email Error: ${errors.email}`);
      }
      if (errors.password) {
        toast.error(`Password Error: ${errors.password}`);
      }
      if (errors.confirmPassword) {
        toast.error(`Confirmation Error: ${errors.confirmPassword}`);
      }
      if (errors.role) {
        toast.error(`Role Error: ${errors.role}`);
      }
      return;
    }

    // First, check if email is already registered with this role
    // This pre-check helps provide better user experience before full signup
    try {
      const checkResponse = await axios.get(`${apiUrl}/users/check-email`, {
        params: {
          email: formData.email,
          role: formData.role
        }
      }).catch(err => {
        // If the endpoint doesn't exist yet, just continue with normal registration
        console.log("Email check endpoint not available, continuing with standard registration");
        return { data: { exists: false, otherRoles: [] } };
      });
      
      if (checkResponse.data && checkResponse.data.exists) {
        toast.error(`This email is already registered as a ${formData.role}.`);
        
        // Show login prompt
        setTimeout(() => {
          if (window.confirm("Would you like to log in instead?")) {
            setIsLoginMode(true);
          }
        }, 1000);
        
        return;
      }
      
      // If email exists with other roles, inform user but continue
      if (checkResponse.data && checkResponse.data.otherRoles && checkResponse.data.otherRoles.length > 0) {
        const roles = checkResponse.data.otherRoles;
        toast.info(`You're already registered as: ${roles.join(', ')}. You can use the same email for different roles.`);
      }
    } catch (checkError) {
      // Just log the error but continue with registration
      console.log("Error checking email:", checkError);
    }

    setIsLoading(true);
    toast.info("Creating your account...", { autoClose: false, toastId: "signup-progress" });

    try {
      console.log("Sending signup request to:", `${apiUrl}/users/register`);
      console.log("Signup data:", {
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      let currentApiUrl = apiUrl;
      let response;

      try {
        // First try with current API URL
        response = await axios.post(`${currentApiUrl}/users/register`, {
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
      } catch (initialError) {
        console.error("Initial API request failed:", initialError);
        
        // If using localhost and got an error, try the production API
        if (currentApiUrl === LOCAL_API_URL) {
          toast.info("Local server connection failed. Trying remote server...");
          currentApiUrl = switchToProductionApi();
          
          response = await axios.post(`${currentApiUrl}/users/register`, {
            email: formData.email,
            password: formData.password,
            role: formData.role
          });
        } else {
          // If already using production API, rethrow the error
          throw initialError;
        }
      }

      console.log("Registration response:", response.data);
      
      // Close the progress toast
      toast.dismiss("signup-progress");
      
      if (response.data.success) {
        toast.success("Registration successful! You can now complete your profile.");

        // Show notification about admin review
        toast.info(
          "After profile completion, your listing will be reviewed by our admin team before being published on the website.", 
          { autoClose: 5000 }
        );

        // Redirect based on role
        setTimeout(() => {
          toast.info(`Taking you to your ${formData.role} profile setup...`);
          
          switch (formData.role) {
            case "company":
              navigate("/add-company");
              break;
            case "designer":
              navigate("/add-designer");
              break;
            case "craftsman":
              navigate("/add-craftsman");
              break;
            default:
              toast.warning("Role not recognized. Redirecting to homepage.");
              navigate("/"); // Go to home if something went wrong
          }
        }, 1500);
      } else {
        toast.error(response.data.message || "Registration failed. Please try again.");
      }

    } catch (error) {
      console.error("Registration error:", error);
      
      // Close the progress toast
      toast.dismiss("signup-progress");
      
      // Handle specific API error responses
      if (error.response) {
        const statusCode = error.response.status;
        const errorData = error.response.data;
        
        console.log("Error response data:", errorData);
        
        switch (statusCode) {
          case 400:
            // Handle different types of 400 errors
            if (errorData.code === 'DUPLICATE_EMAIL_ROLE') {
              // This is from our updated backend
              toast.error(errorData.message || `This email is already registered as a ${formData.role}`);
              
              // Prompt to login instead
              setTimeout(() => {
                if (window.confirm("Would you like to log in instead?")) {
                  setIsLoginMode(true);
                }
              }, 1000);
            }
            else if (errorData.message && errorData.message.includes("already registered as a")) {
              // Handle duplicate email for the same role (updated backend)
              toast.error(errorData.message);
              toast.info("You can use the same email to register for different roles (company, designer, or craftsman).");
              
              // Prompt to login instead
              setTimeout(() => {
                if (window.confirm("Would you like to log in instead?")) {
                  setIsLoginMode(true);
                }
              }, 1000);
            } 
            else if (errorData.message && errorData.message === "Email is already registered") {
              // This is the message from the old backend code
              toast.error("This email is already registered in our system.");
              
              // Try to get other roles this email might be registered with
              try {
                // This is a fallback check for older backends
                axios.get(`${apiUrl}/users/check-email`, {
                  params: { email: formData.email }
                }).then(response => {
                  if (response.data && response.data.otherRoles && response.data.otherRoles.length > 0) {
                    const roles = response.data.otherRoles;
                    toast.info(`You're already registered as: ${roles.join(', ')}`);
                  }
                }).catch(() => {
                  // Endpoint doesn't exist, just show the generic message
                  toast.info("Please try registering with a different email address or contact support.");
                });
              } catch (checkError) {
                console.log("Error in fallback email check:", checkError);
              }
              
              // Optional: Show a popup that helps the user navigate to login instead
              setTimeout(() => {
                if (window.confirm("Do you already have an account with this email? Would you like to log in instead?")) {
                  setIsLoginMode(true);
                }
              }, 1000);
            } else {
              toast.error(`Input Error: ${errorData.message || "Please check your information"}`);
            }
            break;
          case 409:
            toast.error(`Account Error: ${errorData.message || "This email is already registered with this role"}`);
            toast.info("You can use the same email to register for different roles (company, designer, or craftsman).");
            break;
          case 500:
            // Display more details for server errors
            const errorDetails = errorData.details || errorData.error || errorData.message || "Unknown server error";
            console.error("Server error details:", errorDetails);
            toast.error("Server Error: Registration failed due to a technical issue.");
            toast.info("Please try again later or contact support if the issue persists.");
            break;
          case 422:
            toast.error(`Validation Error: ${errorData.message || "Please check your information"}`);
            break;
          default:
            toast.error(errorData.message || "Registration failed. Please try again.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("Network Error: Please check your internet connection and try again.");
        
        // If using localhost, suggest trying the production server
        if (apiUrl === LOCAL_API_URL) {
          setTimeout(() => {
            toast.info("Server might be offline. Would you like to try our production server?", {
              autoClose: false,
              closeOnClick: false,
              draggable: false,
              closeButton: false,
              position: "bottom-center",
              onClick: () => {
                toast.dismiss();
                switchToProductionApi();
                toast.info("Switched to production server. Please try registering again.");
              }
            });
          }, 1000);
        }
      } else {
        // Something happened in setting up the request
        toast.error("Error: Something went wrong. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) {
      // Validate again and show specific toast errors for validation issues
      if (errors.email) {
        toast.error(`Email Error: ${errors.email}`);
      }
      if (errors.password) {
        toast.error(`Password Error: ${errors.password}`);
      }
      return;
    }

    setIsLoading(true);
    toast.info("Logging in...", { autoClose: false, toastId: "login-progress" });

    try {
      console.log("Sending login request to:", `${apiUrl}/users/login`);
      
      let currentApiUrl = apiUrl;
      let response;

      try {
        // First try with current API URL
        response = await axios.post(`${currentApiUrl}/users/login`, {
          email: formData.email,
          password: formData.password
        });
      } catch (initialError) {
        console.error("Initial API request failed:", initialError);
        
        // If using localhost and got an error, try the production API
        if (currentApiUrl === LOCAL_API_URL) {
          toast.info("Local server connection failed. Trying remote server...");
          currentApiUrl = switchToProductionApi();
          
          response = await axios.post(`${currentApiUrl}/users/login`, {
            email: formData.email,
            password: formData.password
          });
        } else {
          // If already using production API, rethrow the error
          throw initialError;
        }
      }
      
      console.log("Login response:", response.data);
      
      // Close the progress toast
      toast.dismiss("login-progress");
      
      if (response.data.success) {
        toast.success("Login successful!");
        
        // Save token in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userRole", response.data.user.role);
        
        // Redirect based on role
        setTimeout(() => {
          toast.info(`Taking you to your dashboard...`);
          navigate("/"); // For now, just go to home
        }, 1500);
      } else {
        toast.error(response.data.message || "Login failed. Please try again.");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      
      // Close the progress toast
      toast.dismiss("login-progress");
      
      // Handle specific API error responses
      if (error.response) {
        const statusCode = error.response.status;
        const errorData = error.response.data;
        
        switch (statusCode) {
          case 400:
            toast.error(`Input Error: ${errorData.message || "Please check your information"}`);
            break;
          case 401:
            toast.error(`Authentication Error: ${errorData.message || "Invalid email or password"}`);
            break;
          case 500:
            toast.error("Server Error: We're experiencing technical difficulties. Please try again later.");
            break;
          default:
            toast.error(errorData.message || "Login failed. Please try again.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("Network Error: Please check your internet connection and try again.");
        
        // If using localhost, suggest trying the production server
        if (apiUrl === LOCAL_API_URL) {
          setTimeout(() => {
            toast.info("Server might be offline. Would you like to try our production server?", {
              autoClose: false,
              closeOnClick: false,
              draggable: false,
              closeButton: false,
              position: "bottom-center",
              onClick: () => {
                toast.dismiss();
                switchToProductionApi();
                toast.info("Switched to production server. Please try logging in again.");
              }
            });
          }, 1000);
        }
      } else {
        // Something happened in setting up the request
        toast.error("Error: Something went wrong. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoginMode) {
      await handleLogin();
    } else {
      await handleSignup();
    }
  };

  // Toggle between login and signup modes
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      role: ""
    });
    
    toast.info(isLoginMode ? "Switching to sign up mode..." : "Switching to login mode...");
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email address first");
      setErrors({...errors, email: "Email is required for password reset"});
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setErrors({...errors, email: "Email is invalid"});
      return;
    }
    
    toast.info(`Password reset instructions will be sent to ${formData.email}`);
    // Here you would add actual password reset logic
    // navigate("/forgot-password", { state: { email: formData.email } });
  };
  
  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    toast.info(`Selected role: ${role}`);
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
      
      <div className="absolute top-0 left-0 w-full bg-transparent z-50">
        <Header />
      </div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[400px] bg-cover bg-center text-white flex items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(250,250,250,0.85)] to-[rgba(0,100,82,0.85)]"></div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="z-50 font-inter font-black text-4xl md:text-[64px] leading-[77.45px] tracking-normal text-white"
        >
          Partner With Us
        </motion.h2>
      </motion.section>

      {/* Introduction Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-[#006452] mb-6"
          >
            Grow Your Business with inty
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, delay: 0.2 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-gray-600 mb-8"
          >
            Join inty's network and connect with a wider audience of customers looking for quality interior design services.
            {isLoginMode ? " Sign in to access your account." : " Sign up below to get started on your journey."}
          </motion.p>
        </div>
      </section>

      {/* Signup/Login Form Section */}
      <section className="max-w-md mx-auto px-4 py-8 mb-12">
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.8 }}
          className="bg-white p-8 rounded-xl shadow-lg"
        >
          {/* Toggle buttons for signup/login */}
          <div className="flex mb-6 border rounded-lg overflow-hidden">
            <button
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-2 ${!isLoginMode ? 'bg-[#006452] text-white' : 'bg-white text-gray-700'}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-2 ${isLoginMode ? 'bg-[#006452] text-white' : 'bg-white text-gray-700'}`}
            >
              Log In
            </button>
          </div>

          <h2 className="text-2xl font-bold text-center text-[#006452] mb-6">
            {isLoginMode ? "Welcome Back" : "Create Your Account"}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address*</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#006452]`}
                placeholder="your@email.com"
                onFocus={() => toast.dismiss()}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password*</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#006452]`}
                placeholder="•••••••"
                onFocus={() => toast.dismiss()}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password Input (Signup only) */}
            {!isLoginMode && (
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">Confirm Password*</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#006452]`}
                  placeholder="•••••••"
                  onFocus={() => toast.dismiss()}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Role Selection (Signup only) */}
            {!isLoginMode && (
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">I am a:*</label>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className={`border ${formData.role === 'company' ? 'bg-[#006452] text-white' : 'bg-white text-gray-700'} rounded-md py-2 px-3 text-center cursor-pointer hover:bg-gray-50 transition-colors ${formData.role === 'company' ? 'hover:bg-[#005543]' : ''}`}
                    onClick={() => handleRoleSelect('company')}
                  >
                    Company
                  </div>
                  <div
                    className={`border ${formData.role === 'designer' ? 'bg-[#006452] text-white' : 'bg-white text-gray-700'} rounded-md py-2 px-3 text-center cursor-pointer hover:bg-gray-50 transition-colors ${formData.role === 'designer' ? 'hover:bg-[#005543]' : ''}`}
                    onClick={() => handleRoleSelect('designer')}
                  >
                    Designer
                  </div>
                  <div
                    className={`border ${formData.role === 'craftsman' ? 'bg-[#006452] text-white' : 'bg-white text-gray-700'} rounded-md py-2 px-3 text-center cursor-pointer hover:bg-gray-50 transition-colors ${formData.role === 'craftsman' ? 'hover:bg-[#005543]' : ''}`}
                    onClick={() => handleRoleSelect('craftsman')}
                  >
                    Craftsman
                  </div>
                </div>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>
            )}

            {/* Forgot Password (Login only) */}
            {isLoginMode && (
              <div className="mb-6 text-right">
                <a
                  href="#"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#006452] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#006452] text-white hover:bg-[#004d40] py-3 rounded-lg transition-all duration-200 flex justify-center items-center"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? (isLoginMode ? "Logging In..." : "Creating Account...") : (isLoginMode ? "Log In" : "Sign Up")}
            </Button>

            <p className="text-center mt-4 text-gray-600">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-[#006452] hover:underline"
              >
                {isLoginMode ? "Sign up" : "Log in"}
              </button>
            </p>
          </form>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 bg-gray-50">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-[#006452] mb-6"
          >
            Benefits of Partnering with inty
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white p-5 rounded-lg shadow-md"
              onClick={() => toast.info("Increased visibility helps you reach more potential customers")}
            >
              <h3 className="font-bold text-lg mb-2">Increased Visibility</h3>
              <p className="text-gray-600">Get discovered by customers actively looking for your services</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white p-5 rounded-lg shadow-md"
              onClick={() => toast.info("Our tools help you streamline your business operations")}
            >
              <h3 className="font-bold text-lg mb-2">Powerful Tools</h3>
              <p className="text-gray-600">Manage projects, portfolios, and client communications efficiently</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-white p-5 rounded-lg shadow-md"
              onClick={() => toast.info("Our secure payment system protects both you and your clients")}
            >
              <h3 className="font-bold text-lg mb-2">Secure Payments</h3>
              <p className="text-gray-600">Handle transactions safely and easily with our payment system</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="bg-white p-5 rounded-lg shadow-md"
              onClick={() => toast.info("Our support team is available to help you succeed")}
            >
              <h3 className="font-bold text-lg mb-2">Dedicated Support</h3>
              <p className="text-gray-600">Our team is ready to help you grow your business on our platform</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold text-[#006452] mb-8 text-center"
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md"
            onClick={() => toast.info("Learn more about our partnership model")}
          >
            <h3 className="font-bold text-lg mb-2">How does the partnership work?</h3>
            <p className="text-gray-600">Once you sign up, you'll be able to create a detailed profile, showcase your work, and receive inquiries from potential clients looking for your services</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md"
            onClick={() => toast.info("Our fee structure is transparent and competitive")}
          >
            <h3 className="font-bold text-lg mb-2">Are there any fees to join?</h3>
            <p className="text-gray-600">Basic registration is free. We only charge a small commission on projects you secure through our platform</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md"
            onClick={() => toast.info("Complete your profile to showcase your expertise")}
          >
            <h3 className="font-bold text-lg mb-2">What information will I need to provide?</h3>
            <p className="text-gray-600">After registration, you'll be asked to complete your profile with professional details, portfolio items, and credentials relevant to your role</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}