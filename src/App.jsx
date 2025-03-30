import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import HeroThreeJS from './components/HeroThreeJS';
import Features from './components/Features';
import Benefits from './components/Benefits';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AccessCode from './pages/AccessCode';
import Dashboard from './pages/Dashboard';
import axios from 'axios';
import { API_URL } from './utils/constants';
// Debug utilities removed
// import './utils/ageFilterDebug';
// import './utils/searchDebug';

// Simplified search access - replaced with no-op function
export const allowSearchAccess = () => {
  // Function intentionally left empty - for compatibility only
};

// FooterWrapper component to conditionally render the Footer
const FooterWrapper = ({ isAuthenticated }) => {
  const location = useLocation();
  const path = location.pathname;
  
  // Don't show footer on dashboard routes when authenticated
  // Ensure path-checking is case-insensitive with toLowerCase()
  const shouldHide = path.toLowerCase().includes('/dashboard');
  
  // More detailed logging for debugging
  console.log(`FooterWrapper - Path: ${path}`);
  console.log(`FooterWrapper - isAuthenticated: ${isAuthenticated}`);
  console.log(`FooterWrapper - shouldHide based only on path: ${shouldHide}`);
  
  if (shouldHide) {
    console.log('Footer hidden on dashboard path');
    return null;
  }
  
  return <Footer />;
};

// NavbarWrapper component to conditionally show Navbar
const NavbarWrapper = ({ isAuthenticated }) => {
  const location = useLocation();
  const path = location.pathname;
  
  // Don't show navbar on dashboard routes when authenticated
  // Ensure path-checking is case-insensitive with toLowerCase()
  const shouldHide = path.toLowerCase().includes('/dashboard');
  
  // More detailed logging for debugging
  console.log(`NavbarWrapper - Path: ${path}`);
  console.log(`NavbarWrapper - isAuthenticated: ${isAuthenticated}`);
  console.log(`NavbarWrapper - shouldHide based only on path: ${shouldHide}`);
  
  if (shouldHide) {
    console.log('Navbar hidden on dashboard path');
    return null;
  }
  
  return <Navbar isAuthenticated={isAuthenticated} />;
};

function App() {
  console.log('=== App Component Render Start ===');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const isLogout = sessionStorage.getItem('user_logout') === 'true';
    
    if (token && !isLogout) {
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    // Wrapper function for the auth event listener that logs before checking
    const handleAuthEvent = () => {
      console.log("Auth state change event received");
      
      // Check if this is an intentional logout
      const isLogout = sessionStorage.getItem('user_logout') === 'true';
      
      // Force recheck of authentication status
      const token = localStorage.getItem('authToken');
      console.log("Auth event triggered - Token exists:", !!token, "Intentional logout:", isLogout);
      
      // If this is an intentional logout, we don't want to change auth state yet
      // Let the Sidebar logout function handle the navigation first
      if (isLogout) {
        console.log("Intentional logout in progress - deferring auth state change");
        // We don't update isAuthenticated state here
        return;
      }
      
      // Update authentication state immediately
      setIsAuthenticated(!!token);
      
      // Update axios headers based on authentication status
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Auth event: Set Authorization header with token');
        
        // If this is a sign-in/access code verification and we're not at the dashboard, navigate there
        // This is a fallback mechanism to ensure users reach the dashboard after authentication
        const path = window.location.pathname;
        if (path.match(/\/(signin|signup|access)$/) || path === '/') {
          console.log('Detected authenticated user outside dashboard, redirecting...');
          // Short delay to ensure state updates first
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
        }
      } else {
        delete axios.defaults.headers.common['Authorization'];
        console.log('Auth event: Cleared Authorization header due to logout');
      }
      
      // If token is missing and we were authenticated
      if (!token && isAuthenticated) {
        console.log("Token removed - user logged out");
        // If this was an intentional logout, clear the flag
        if (isLogout) {
          console.log("Intentional logout detected - not redirecting to sign-in");
          sessionStorage.removeItem('user_logout');
          // Navigation handled by the component that triggered logout
        }
      }
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleAuthEvent);
    
    // Add event listener for custom auth state events (dispatched during logout)
    window.addEventListener('auth-state-changed', handleAuthEvent);

    // Set up global axios defaults
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';
    
    // Check for existing auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      // Set authorization header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Auth token loaded from storage and set in axios defaults');
    }
    
    // Add request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        // Double-check token on every request
        const currentToken = localStorage.getItem('authToken');
        if (currentToken) {
          config.headers['Authorization'] = `Bearer ${currentToken}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for handling auth errors
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          console.error('401 Unauthorized error:', error.response.data);
          console.log('Current URL:', window.location.pathname);
          
          // Check if this is an intentional logout
          const isLogout = sessionStorage.getItem('user_logout') === 'true';
          
          // Only clear the token, but don't redirect automatically
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          
          if (isLogout) {
            console.log('401 during logout process - expected behavior');
          } else {
            console.warn('Token cleared due to 401 error, but NOT redirecting automatically');
          }
        }
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptors and event listener on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
      window.removeEventListener('storage', handleAuthEvent);
      window.removeEventListener('auth-state-changed', handleAuthEvent);
    };
  }, [isAuthenticated]); // Add isAuthenticated to dependencies since we use it in handleAuthEvent

  console.log('=== App Component Render End ===');

  return (
    <Router>
      <div className="App">
        <NavbarWrapper isAuthenticated={isAuthenticated} />
        <Routes>
          <Route path="/" element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> :
            <>
              <HeroThreeJS />
              <Features />
              <Benefits />
              <HowItWorks />
            </>
          } />
          <Route path="/signin" element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> :
            <SignIn setIsAuthenticated={setIsAuthenticated} />
          } />
          <Route path="/signup" element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> :
            <SignUp />
          } />
          <Route path="/access" element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> :
            <AccessCode setIsAuthenticated={setIsAuthenticated} />
          } />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
        <FooterWrapper isAuthenticated={isAuthenticated} />
      </div>
    </Router>
  );
}

export default App; 