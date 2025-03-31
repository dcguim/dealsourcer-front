import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/constants';

// Configure axios defaults
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';

const AccessCode = ({ setIsAuthenticated }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get information from location state or session storage
  const locationState = location.state || {};
  const pendingAuth = JSON.parse(sessionStorage.getItem('pendingAuth') || '{}');
  
  const email = locationState.email || pendingAuth.email || '';
  const source = locationState.source || pendingAuth.source || 'signin'; // Default to signin
  // Get setAuthCallback if it exists in location state
  const setAuthCallback = locationState.setAuthCallback;
  
  useEffect(() => {
    // If no email is provided, redirect back to sign in
    if (!email) {
      navigate('/signin');
      return;
    }
    
    // Set up countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Store state in session storage in case of page refresh
    if (locationState.email && locationState.source) {
      sessionStorage.setItem('pendingAuth', JSON.stringify({
        email: locationState.email,
        source: locationState.source
      }));
    }
    
    return () => clearInterval(timer);
  }, [email, navigate, locationState]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Trim any whitespace from the access code
    const cleanedCode = accessCode.trim();
    
    // Basic validation
    if (!cleanedCode) {
      setError('Please enter the access code sent to your email');
      setIsLoading(false);
      return;
    }
    
    if (!email) {
      setError('Email information is missing. Please go back and try again.');
      setIsLoading(false);
      return;
    }
    
    // Prepare payload with API's expected format
    const payload = {
      email: email.trim().toLowerCase(),
      access_code: cleanedCode
    };

    // Simple, direct request
    try {
      console.log('Sending POST to:', `${API_URL}/api/login`);
      console.log('With payload:', payload);
      
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('Response:', data);
      handleSuccessfulLogin(data, email);
    } catch (error) {
      console.error('Error:', error);
      handleLoginError(error);
      setIsLoading(false);
    }
  };
  
  // Helper function to handle successful login
  const handleSuccessfulLogin = (data, userEmail) => {
    console.log('Login successful, processing response:', JSON.stringify(data));
    
    try {
      // Handle different response formats
      // Some APIs return token directly, others nest it under a 'token' field
      const token = data.access_token || 
                   (data.token && data.token.access_token) || 
                   data.token || 
                   null;
      
      console.log('Extracted token:', token ? `${token.substring(0, 15)}...` : 'No token found');
      console.log('Token type:', typeof token);
      console.log('Token length:', token ? token.length : 0);
      
      // Get user data depending on API format
      const userData = data.user || 
                      (data.token && data.token.user) || 
                      { email: userEmail };
      
      if (!token) {
        setError('Login successful but no token received. Please try again.');
        setIsLoading(false);
        return;
      }
      
      // Clear any previous tokens to avoid conflicts
      localStorage.removeItem('authToken');
      
      // Wait a moment to ensure localStorage is clear
      setTimeout(() => {
        // Store the token in localStorage with error handling
        try {
          localStorage.setItem('authToken', token);
          console.log('Token stored in localStorage successfully');
          
          // Verify token was stored correctly
          const storedToken = localStorage.getItem('authToken');
          console.log('Verified stored token:', storedToken ? `${storedToken.substring(0, 15)}...` : 'No token found');
          console.log('Token storage verification:', token === storedToken ? 'Successful' : 'Failed');
          
          if (!storedToken || token !== storedToken) {
            throw new Error('Token storage verification failed');
          }
          
          // Store email for reference
          localStorage.setItem('userEmail', userEmail);
          console.log('Email stored in localStorage:', userEmail);
          
          // Store user data
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('User data stored in localStorage');
          
          // Set authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Authorization header set for axios');
          
          // Update the app's authentication state
          if (setIsAuthenticated) {
            setIsAuthenticated(true);
            console.log('App authentication state updated to true');
          } else {
            console.warn('setIsAuthenticated function not available');
          }
          
          // Dispatch auth state change event
          window.dispatchEvent(new Event('auth-state-changed'));
          console.log('auth-state-changed event dispatched');
          
          // Clean up any pending auth data
          sessionStorage.removeItem('pendingAuth');
          
          // Show brief success message
          setError('');
          setIsLoading(false);
          
          // Log before navigation
          console.log('IMPORTANT: Preparing navigation to dashboard with token', token ? 'present' : 'missing');
          
          // Better approach: Use a hybrid approach for reliability
          setTimeout(() => {
            // First try React Router navigation
            try {
              navigate('/dashboard', { replace: true });
              console.log('React Router navigation executed');
              
              // Fallback: If we're still on this page after a delay, use direct navigation
              setTimeout(() => {
                if (window.location.pathname.includes('access-code')) {
                  console.log('Still on access code page, trying direct navigation');
                  window.location.href = '/dashboard';
                }
              }, 500);
            } catch (navError) {
              console.error('Navigation error:', navError);
              // Fallback to direct navigation
              window.location.href = '/dashboard';
            }
          }, 500); // Small delay to ensure events are processed
          
        } catch (storageError) {
          console.error('Error storing authentication data:', storageError);
          setError('Error storing authentication data. Please try again.');
          setIsLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error('Error in handleSuccessfulLogin:', error);
      setError('Error processing login response. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Helper function to handle login errors
  const handleLoginError = (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.data && error.response.data.detail) {
        setError(error.response.data.detail);
      } else if (error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else if (error.response.status === 401) {
        setError('Invalid access code. Please check your email and try again.');
      } else if (error.response.status === 422) {
        setError('Invalid data format. Please check your email and code.');
      } else if (error.response.status === 400) {
        setError('Invalid or expired verification code. Please request a new code.');
      } else {
        setError(`Login failed (${error.response.status}). Please try again.`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      setError('Server not responding. Please check your internet connection or try again later.');
    } else {
      // Something happened in setting up the request
      setError('Error during login request. Please try again.');
    }
  };
  
  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Get stored email
      if (!email) {
        setError('Email information missing. Please go back and try again.');
        setIsLoading(false);
        return;
      }
      
      // Request a new code
      await axios.post(`${API_URL}/api/request-login-code`, {
        email
      });
      
      // Reset countdown
      setCountdown(300);
      
      // Reset access code field
      setAccessCode('');
      
      // Show success message
      alert('A new access code has been sent to your email.');
    } catch (error) {
      if (error.response && error.response.data) {
        setError(`Failed to resend code: ${error.response.data.detail || error.response.data.message || 'Server error'}`);
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Security component to protect the dashboard
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b3992] mx-auto"></div>
          <p className="mt-4 text-gray-700">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="m-auto w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Access Code</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter the code sent to {email}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="mt-1">
              <input
                id="accessCode"
                name="accessCode"
                type="text"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3b3992] focus:border-[#3b3992] sm:text-sm"
                placeholder="Enter code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading || countdown === 0}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#3b3992] hover:bg-[#2e2c70] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b3992] ${(isLoading || countdown === 0) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(source === 'signup' ? '/signup' : '/signin')}
              className="text-sm font-medium text-[#3b3992] hover:text-[#2e2c70]"
            >
              Back to {source === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
            
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading || countdown > 270} // Can only resend after 30 seconds
              className={`text-sm font-medium text-[#3b3992] hover:text-[#2e2c70] ${(isLoading || countdown > 270) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Resend Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccessCode;

