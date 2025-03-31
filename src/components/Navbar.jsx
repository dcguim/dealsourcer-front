import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  
  // We'll use the isAuthenticated prop passed from App.jsx
  // This ensures the auth state is consistent throughout the app
  
  // Log for debugging
  console.log(`Navbar - Authentication state: ${isAuthenticated}`);

  const scrollToCalendar = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignOut = () => {
    console.log('Navbar: Logout initiated, clearing auth data...');
    
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('user');
    
    // Clear axios headers
    delete axios.defaults.headers.common['Authorization'];
    console.log('Navbar: Cleared axios authorization headers');
    
    // Dispatch event instead of setting state locally
    // Important: Do this BEFORE navigation
    console.log('Navbar: Dispatching auth-state-changed event...');
    window.dispatchEvent(new Event('auth-state-changed'));
    
    // Force navigation with a more significant delay to ensure event processing
    console.log('Navbar: Navigating to root page (/)...');
    setTimeout(() => {
      navigate('/', { replace: true });
      console.log('Navbar: Navigation to root page completed');
    }, 300);
  };

  return (
    <nav className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">Deal Sourcer</Link>
        </div>
        
        {/* Menu items - shown on all pages except dashboard */}
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
          <a href="#benefits" className="text-gray-600 hover:text-gray-900 font-medium">Benefits</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">How It Works</a>
        </div>
        
        {/* Auth buttons - different based on auth state */}
        <div className="flex space-x-4">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard"
                className="text-[#3b3992] hover:text-[#3b3992]/80 border border-[#3b3992] px-6 py-2 rounded-md font-medium transition-colors"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleSignOut}
                className="bg-[#3b3992] hover:bg-[#3b3992]/80 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/signin"
                className="text-[#3b3992] hover:text-[#3b3992]/80 border border-[#3b3992] px-6 py-2 rounded-md font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup"
                className="bg-[#3b3992] hover:bg-[#3b3992]/80 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
