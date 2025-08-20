import axios from 'axios';

// Get the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  params: {}, // Default empty params for query parameters
  timeout: 15000, // 15 seconds timeout for all requests
  // Retry logic for failed requests
  retry: 2, // Number of retry attempts
  retryDelay: 1000, // Delay between retries in ms
});

// Request interceptor for adding auth token and setting retry config
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Set retry configuration for each request if not already set
    if (config.retry === undefined) {
      config.retry = api.defaults.retry;
    }
    if (config.retryDelay === undefined) {
      config.retryDelay = api.defaults.retryDelay;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Implement retry logic for network errors and timeouts
    if ((error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') && 
        originalRequest && 
        !originalRequest._retry && 
        originalRequest.retry > 0) {
      
      originalRequest._retry = true;
      originalRequest.retry--;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, originalRequest.retryDelay));
      
      console.log(`Retrying request to ${originalRequest.url}. Attempts left: ${originalRequest.retry}`);
      return api(originalRequest);
    }
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token logic can be added here
      localStorage.removeItem('token');
      window.location.href = '/user/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;