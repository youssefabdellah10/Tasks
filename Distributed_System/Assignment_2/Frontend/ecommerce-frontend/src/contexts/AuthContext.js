import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.service';
import tokenUtils from '../utils/tokenUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check logged in status once during initialization
  useEffect(() => {
    if (authChecked) return;
    
    const checkLoggedIn = () => {
      console.log("Checking if user is logged in...");
      const user = AuthService.getCurrentUser();
      console.log("User from localStorage:", user);
      
      // Debug the token if it exists
      if (user && user.token) {
        console.log("Token found in localStorage");
        const decodedToken = tokenUtils.getCurrentDecodedToken();
        console.log("Token payload:", decodedToken);
        console.log("Token expired:", tokenUtils.isTokenExpired());
        
        // If token is expired, log out
        if (tokenUtils.isTokenExpired()) {
          console.log("Token is expired, logging out");
          AuthService.logout();
          setCurrentUser(null);
          setIsLoading(false);
          setAuthChecked(true);
          return;
        }
        
        // Check if the token has the required fields
        if (decodedToken) {
          const hasUserIdentifier = !!(decodedToken.sub || decodedToken.username || decodedToken.userId);
          console.log("Token has user identifier:", hasUserIdentifier);
          
          if (user.userType === 'seller') {
            const hasCompanyInfo = !!(decodedToken.companyUsername || decodedToken.companyId);
            console.log("Token has company info:", hasCompanyInfo);
          }
        }
        
        console.log("Setting current user from localStorage");
        setCurrentUser(user);
      } else {
        console.log("No valid user found, logging out");
        // Clean up any partial auth state
        AuthService.logout();
      }
      setIsLoading(false);
      setAuthChecked(true);
    };
    
    checkLoggedIn();
  }, [authChecked]);

  // Set up a timer to check token expiration periodically
  useEffect(() => {
    if (!currentUser) return;
    
    const checkTokenInterval = setInterval(() => {
      if (tokenUtils.isTokenExpired()) {
        console.log("Token expiration detected in timer, logging out");
        AuthService.logout();
        setCurrentUser(null);
      }
    }, 60000); // Check every minute
    
    // Clear interval on unmount
    return () => clearInterval(checkTokenInterval);
  }, [currentUser]);

  const login = async (username, password, userType) => {
    try {
      setError(null);
      setIsLoading(true);
      const user = await AuthService.login(username, password, userType);
      setCurrentUser({
        token: user.token,
        userType: user.role.toLowerCase(),
        userId: user.username
      });
      setIsLoading(false);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      setIsLoading(false);
      throw error;
    }
  };  // Register user
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
