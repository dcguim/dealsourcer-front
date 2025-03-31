// Create a new utility file for token management

// Check if token exists
export const hasToken = () => {
  return !!localStorage.getItem('authToken');
};

// Get token (with optional masking for logs)
export const getToken = (masked = false) => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  return masked ? `${token.substring(0, 10)}...` : token;
};

// Set token and axios default header
export const setToken = (token) => {
  if (!token) {
    localStorage.removeItem('authToken');
    if (window.axios && window.axios.defaults) {
      delete window.axios.defaults.headers.common['Authorization'];
    }
    return;
  }
  
  localStorage.setItem('authToken', token);
  
  // Set axios header if axios is available
  if (window.axios && window.axios.defaults) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Verify token format
export const isValidTokenFormat = (token) => {
  if (!token) return false;
  
  // Check for basic JWT format (three parts separated by dots)
  const parts = token.split('.');
  return parts.length === 3;
};

// Log token info for debugging
export const logTokenInfo = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('No token found in localStorage');
    return null;
  }
  
  console.log('Token exists:', !!token);
  console.log('Token preview:', token.substring(0, 15) + '...');
  
  try {
    // Try to decode the payload (middle part of JWT)
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      
      // Check if token is expired
      if (payload.exp) {
        const expiryDate = new Date(payload.exp * 1000);
        const now = new Date();
        console.log('Token expires:', expiryDate);
        console.log('Is token expired:', expiryDate < now);
      }
      
      return payload;
    } else {
      console.error('Token does not appear to be a valid JWT');
      return null;
    }
  } catch (e) {
    console.error('Error parsing token:', e);
    return null;
  }
};

export const logTokenDetails = () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.error('No auth token found in localStorage');
    return null;
  }
  
  console.log('==================== TOKEN DETAILS ====================');
  console.log('Token preview:', token.substring(0, 15) + '...' + token.substring(token.length - 10));
  console.log('Token length:', token.length);
  
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      
      // Check expiration
      if (payload.exp) {
        const expiryDate = new Date(payload.exp * 1000);
        const now = new Date();
        const timeUntilExpiry = expiryDate - now;
        
        console.log('Token expires at:', expiryDate.toLocaleString());
        console.log('Minutes until expiry:', Math.floor(timeUntilExpiry / 1000 / 60));
        console.log('Is expired:', timeUntilExpiry < 0);
      }
    }
  } catch (e) {
    console.error('Error decoding token:', e);
  }
  
  console.log('Correct Authorization header format:');
  console.log('Authorization: Bearer ' + token);
  console.log('========================================================');
  
  return token;
};

// Add a function to check if a token is a valid JWT
export const isValidJWT = (token) => {
  if (!token) return false;
  
  // Basic format check: three parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Try to decode the payload
    JSON.parse(atob(parts[1]));
    return true;
  } catch (e) {
    return false;
  }
};

// Add a function to check if a JWT is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false; // No expiration
    
    const expiryDate = new Date(payload.exp * 1000);
    const now = new Date();
    
    return expiryDate < now;
  } catch (e) {
    return true; // If we can't decode, assume it's expired
  }
}; 