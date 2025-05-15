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

// Helper to check if the token has expired
export const isTokenExpired = () => {
  const decoded = getCurrentDecodedToken();
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = decoded.exp < currentTime;
  
  console.log(`Token expires at: ${new Date(decoded.exp * 1000).toLocaleString()}`);
  console.log(`Current time: ${new Date(currentTime * 1000).toLocaleString()}`);
  console.log(`Token is ${isExpired ? 'expired' : 'valid'}`);
  
  return isExpired;
};


// Expose for easy access from browser console
window.tokenUtils = {
  decodeToken,
  getCurrentDecodedToken,
  isTokenExpired,
};

export default {
  decodeToken,
  getCurrentDecodedToken,
  isTokenExpired,
};
