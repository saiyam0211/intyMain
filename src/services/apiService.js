import axios from 'axios';

// Use environment variable if available, otherwise use the production API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://inty-backend.onrender.com/api';

// Create a reusable axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minute timeout
});

// Add a request interceptor to include auth token when available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Create a separate instance for form data uploads
const uploadClient = axios.create({
  baseURL: API_URL,
  // Don't set Content-Type for form-data uploads - let the browser set it with proper boundary
  timeout: 180000, // 3 minute timeout for uploads
});

// Add a request interceptor for upload client
uploadClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
uploadClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Upload Request Failed:', error);
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    console.error('Request Config:', error.config);
    return Promise.reject(error);
  }
);

export { apiClient, uploadClient, API_URL }; 