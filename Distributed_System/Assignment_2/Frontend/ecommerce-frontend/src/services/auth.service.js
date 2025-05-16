import { userApi } from './api';
import tokenUtils from '../utils/tokenUtils';

const AuthService = {
  login: async (username, password, userType) => {
    try {
      const response = await userApi.post(`/user/login?username=${username}&password=${password}`);
      
      if (response.data.token) {
        // Use our token utility to store token with expiration
        tokenUtils.setTokenWithExpiration(response.data.token);
        
        const role = response.data.role.toLowerCase();
        localStorage.setItem('userType', role);
        localStorage.setItem('userId', response.data.username);
        if (role === 'seller' && response.data.companyUsername) {
          localStorage.setItem('companyId', response.data.companyUsername);
        }
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
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
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('companyId');
    // Clear cart data on logout
    localStorage.removeItem('cart');
  },
  getCurrentUser: () => {
    return {
      token: localStorage.getItem('token'),
      userType: localStorage.getItem('userType'),
      userId: localStorage.getItem('userId'),
      companyId: localStorage.getItem('companyId')
    };
  },
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  }
};

export default AuthService;
