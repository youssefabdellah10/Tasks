import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check logged in status and refresh token if needed
  useEffect(() => {
    const checkLoggedIn = () => {
      const user = AuthService.getCurrentUser();
      if (user && user.token) {
        setCurrentUser(user);
      } else {
        // Clean up any partial auth state
        AuthService.logout();
      }
      setIsLoading(false);
    };
    
    checkLoggedIn();
    
    // Set up a timer to periodically check auth status
    const authCheckInterval = setInterval(() => {
      if (AuthService.isAuthenticated()) {
        checkLoggedIn();
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(authCheckInterval);
  }, []);

  const login = async (username, password, userType) => {
    try {
      setError(null);
      setIsLoading(true);
      const user = await AuthService.login(username, password, userType);
      setCurrentUser({
        token: user.token,
        userType: user.role.toLowerCase(),
        userId: user.username,
        companyId: user.companyUsername || null
      });
      setIsLoading(false);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      setIsLoading(false);
      throw error;
    }
  };

  // Register user
  const register = async (username, password, customer_name, address, mobile_number) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await AuthService.register(username, password, customer_name, address, mobile_number);
      setIsLoading(false);
      return response;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    userType: currentUser?.userType
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
