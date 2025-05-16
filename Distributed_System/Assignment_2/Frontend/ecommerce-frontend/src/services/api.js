import axios from 'axios';
const API_BASE_URL = {
  user: 'http://localhost:7000/users/api', 
  dish: 'http://localhost:3001/api', 
  order: 'http://localhost:8083/api',
};
const userApi = axios.create({
  baseURL: API_BASE_URL.user,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        localStorage.removeItem('companyId');
        console.error('Authentication failed, clearing token');
      }
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      console.error(`API Error: ${errorMessage}`, error);
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
