import { userApi } from './api';

const AuthService = {
  // Login function for any user type
  login: async (username, password, userType) => {
    try {
      // Using POST with query parameters as per backend format
      const response = await userApi.post(`/user/login?username=${username}&password=${password}`);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Store user role from response instead of passed userType
        const role = response.data.role.toLowerCase();
        localStorage.setItem('userType', role);
        
        // Store username as userId
        localStorage.setItem('userId', response.data.username);
        
        // Handle company information
        if (role === 'seller' && response.data.companyUsername) {
          localStorage.setItem('companyId', response.data.companyUsername);
        }
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register function for customer only
  register: async (username, password, customer_name, address, mobile_number) => {
    try {
      const customerData = {
        username,
        password,
        customer_name,
        address,
        mobile_number
      };
      const response = await userApi.post('http://localhost:7000/users/api/customer/register', customerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('companyId');
  },

  // Get current user info
  getCurrentUser: () => {
    return {
      token: localStorage.getItem('token'),
      userType: localStorage.getItem('userType'),
      userId: localStorage.getItem('userId'),
      companyId: localStorage.getItem('companyId')
    };
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  }
};

export default AuthService;
