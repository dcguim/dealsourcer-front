import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
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
// Debug utilities removed
// import './utils/ageFilterDebug';
// import './utils/searchDebug';

// API URL - set to the specific endpoint provided
export const API_URL = 'http://54.80.8.167:8000';

// Simplified search access - replaced with no-op function
export const allowSearchAccess = () => {
  // Function intentionally left empty - for compatibility only
};

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Simple axios interceptor for error handling only
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// FooterWrapper component to conditionally render the Footer
const FooterWrapper = () => {
  const location = useLocation();
  
  // Don't show footer on dashboard routes
  if (location.pathname.includes('/dashboard')) {
    return null;
  }
  
  return <Footer />;
};

// NavbarWrapper component to conditionally show Navbar
const NavbarWrapper = () => {
  const location = useLocation();
  
  // Don't show navbar on dashboard routes
  if (location.pathname.includes('/dashboard')) {
    return null;
  }
  
  return <Navbar />;
};

function App() {
  // Remove debug-related code
  
  return (
    <Router>
      <div className="App">
        <NavbarWrapper />
        <Routes>
          <Route path="/" element={
            <>
              <HeroThreeJS />
              <Features />
              <Benefits />
              <HowItWorks />
            </>
          } />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/access-code" element={<AccessCode />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
        <FooterWrapper />
      </div>
    </Router>
  );
}

export default App; 