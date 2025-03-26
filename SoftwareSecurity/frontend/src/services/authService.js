// src/services/authService.js
import api from './api';

// Login user
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  // Vulnerable: Storing sensitive info in localStorage
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
    localStorage.setItem('userRole', response.data.role);
    localStorage.setItem('userId', response.data.id);
  }
  return response.data;
};

// Register user
export const register = async (username, email, password) => {
  return await api.post('/auth/register', { username, email, password });
};

// Logout user
export const logout = async () => {
  // Vulnerable: Not invalidating session on server
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  return await api.post('/auth/logout');
};

// Check if user is logged in
export const isLoggedIn = () => {
  return localStorage.getItem('user') !== null;
};

// Check if user is admin
export const isAdmin = () => {
  return localStorage.getItem('userRole') === 'admin';
};