export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Get the current token and decode it
export const getCurrentDecodedToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found in localStorage');
    return null;
  }
  
  const decoded = decodeToken(token);
  console.log('Decoded token:', decoded);
  return decoded;
};

// Store token with expiration time
export const setTokenWithExpiration = (token) => {
  if (!token) return;
  
  localStorage.setItem('token', token);
  
  // Set token expiration time to 1 hour from now
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + 1);
  localStorage.setItem('tokenExpiration', expirationTime.getTime().toString());
  
  console.log(`Token will expire at: ${expirationTime.toLocaleString()}`);
};

// Helper to check if the token has expired
export const isTokenExpired = () => {
  const decoded = getCurrentDecodedToken();
  if (!decoded) return true;
  
  // First check if the token has an exp claim
  if (decoded.exp) {
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < currentTime;
    
    console.log(`Token has exp claim and expires at: ${new Date(decoded.exp * 1000).toLocaleString()}`);
    console.log(`Current time: ${new Date(currentTime * 1000).toLocaleString()}`);
    console.log(`Token is ${isExpired ? 'expired' : 'valid'}`);
    
    return isExpired;
  }
  
  // If no exp claim, check our custom expiration
  const expiration = localStorage.getItem('tokenExpiration');
  if (!expiration) return false; // No expiration set, assume valid
  
  const expirationTime = parseInt(expiration, 10);
  const currentTime = Date.now();
  const isExpired = expirationTime < currentTime;
  
  console.log(`Custom token expiration: ${new Date(expirationTime).toLocaleString()}`);
  console.log(`Current time: ${new Date(currentTime).toLocaleString()}`);
  console.log(`Token is ${isExpired ? 'expired' : 'valid'}`);
  
  return isExpired;
};

// Expose for easy access from browser console
window.tokenUtils = {
  decodeToken,
  getCurrentDecodedToken,
  isTokenExpired,
  setTokenWithExpiration
};

const tokenUtils = {
  decodeToken,
  getCurrentDecodedToken,
  isTokenExpired,
  setTokenWithExpiration
};

export default tokenUtils;
