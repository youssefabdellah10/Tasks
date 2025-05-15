import axios from 'axios';

// Base URLs for different microservices
const API_BASE_URL = {
  user: 'http://localhost:7000/users/api', // User, Admin, Company, Seller service
  dish: 'http://localhost:3001/api', // Dish management service
  order: 'http://localhost:8083/api', // Order service
};

// Create axios instances for each service
const userApi = axios.create({
  baseURL: API_BASE_URL.user,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

const dishApi = axios.create({
  baseURL: API_BASE_URL.dish,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const orderApi = axios.create({
  baseURL: API_BASE_URL.order,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor to include auth token
const addAuthToken = (api) => {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        console.log(`Adding token to ${config.url}`);
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn(`No token available for request to ${config.url}`);
      }
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor for error handling
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle token expiration
      if (error.response && error.response.status === 401) {
        // Instead of forcing a redirect, we'll just clear the storage
        // and let React Router handle the redirect appropriately
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        localStorage.removeItem('companyId');
        
        // Let the component handle redirection through React Router
        console.error('Authentication failed, clearing token');
      }
      
      // Create a more descriptive error message
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      
      // Log the error for debugging
      console.error(`API Error: ${errorMessage}`, error);
      
      // Enhance the error object with more details
      const enhancedError = {
        ...error,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        endpoint: error.config?.url,
        method: error.config?.method?.toUpperCase()
      };
      
      return Promise.reject(enhancedError);
    }
  );
  
  return api;
};

addAuthToken(userApi);
addAuthToken(dishApi);
addAuthToken(orderApi);

export { userApi, dishApi, orderApi };
