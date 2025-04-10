import axios from 'axios';

// Use environment variable if available, otherwise use the production API URL
const BASE_API_URL = import.meta.env.VITE_API_URL || 'https://inty-backend.onrender.com/api';

// Determine if we need CORS workaround
const needsCorsWorkaround = () => {
  return window.location.hostname === 'www.inty.in' || window.location.hostname === 'inty.in';
};

// The actual API URL to use - if we need CORS workaround, use a public CORS proxy
// NOTE: These public proxies have limitations and should be replaced with your own solution
const API_URL = needsCorsWorkaround() 
  ? `https://api.allorigins.win/raw?url=${encodeURIComponent(BASE_API_URL)}`
  : BASE_API_URL;

// Create a reusable axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minute timeout
});

// Modify the request URL for allorigins proxy
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token when available
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If using CORS proxy
    if (needsCorsWorkaround()) {
      // For allorigins we need to modify the URL structure
      // Instead of baseURL + url, we need to encode the full URL in the url parameter
      const fullUrl = config.url.startsWith('http') 
        ? config.url 
        : `${BASE_API_URL}${config.url.startsWith('/') ? '' : '/'}${config.url}`;
        
      // Replace the baseURL (which already has the proxy) with empty string
      config.baseURL = '';
      
      // And set the URL to include the target URL as a parameter
      config.url = `https://api.allorigins.win/raw?url=${encodeURIComponent(fullUrl)}`;
      
      // Add params as query string to the target URL if we have any
      if (config.params) {
        const searchParams = new URLSearchParams();
        for (const key in config.params) {
          searchParams.append(key, config.params[key]);
        }
        const queryString = searchParams.toString();
        if (queryString) {
          config.url = `https://api.allorigins.win/raw?url=${encodeURIComponent(fullUrl + (fullUrl.includes('?') ? '&' : '?') + queryString)}`;
        }
        // Remove the params since we've added them to the URL
        config.params = {};
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Special handling for upload client to work with CORS workaround
// Note: File uploads through CORS proxies are complex and may not work correctly
const uploadClient = axios.create({
  baseURL: needsCorsWorkaround() ? '' : BASE_API_URL,
  timeout: 180000, // 3 minute timeout for uploads
});

// For upload client
uploadClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Warning for uploads with CORS proxy
    if (needsCorsWorkaround()) {
      console.warn('Upload with CORS proxy may not work correctly. File uploads require direct access to the API server.');
      
      // For form-data uploads through CORS proxy - this is a best effort approach
      // but may not work for all cases, especially file uploads
      const fullUrl = config.url.startsWith('http') 
        ? config.url 
        : `${BASE_API_URL}${config.url.startsWith('/') ? '' : '/'}${config.url}`;
        
      config.url = `https://api.allorigins.win/raw?url=${encodeURIComponent(fullUrl)}`;
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