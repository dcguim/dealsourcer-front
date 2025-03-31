import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ activeTab, setActiveTab, isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Try to get user info from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUserName(user.email || 'User');
            } catch (e) {
                console.error('Error parsing user data:', e);
                setUserName('User');
            }
        }
    }, []);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // Enhanced logout function with full cleanup
    const handleLogout = () => {
        // Remove the confirmation dialog and immediately log out
        console.log('Logout initiated, clearing all auth data...');
        
        try {
            // 1. First set the logout flag BEFORE any other actions
            console.log('Setting user_logout flag in sessionStorage');
            sessionStorage.setItem('user_logout', 'true');
            
            // 2. Clear ALL auth-related localStorage items IMMEDIATELY
            console.log('Clearing localStorage authentication data');
            const authItems = ['authToken', 'user', 'userEmail', 'token', 'userData', 'access_token', 'refresh_token'];
            authItems.forEach(item => localStorage.removeItem(item));
            
            // 3. Clear session storage except the logout flag
            console.log('Clearing sessionStorage except logout flag');
            const userLogout = sessionStorage.getItem('user_logout');
            sessionStorage.clear();
            if (userLogout) {
                sessionStorage.setItem('user_logout', userLogout);
            }
            
            // 4. Clear all axios authorization headers
            console.log('Clearing authorization headers');
            delete axios.defaults.headers.common['Authorization'];
            
            // 5. Fire the auth state change event
            console.log('Dispatching auth-state-changed event');
            window.dispatchEvent(new Event('auth-state-changed'));
            
            // 6. FORCE navigate to the homepage using window.location
            // This bypasses React Router completely and forces a full page reload
            console.log('FORCE redirecting to homepage');
            window.location.href = '/';
            
            return true; // Successful logout
        } catch (error) {
            // Log the error but still try to navigate out forcefully
            console.error('Error during logout:', error);
            
            // Force navigate regardless of error
            window.location.href = '/';
            return false; // Logout had errors
        }
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <h2 className={isOpen ? 'visible' : 'hidden'}>Deal Sourcer</h2>
                <p className={`text-sm text-gray-600 mt-1 ${isOpen ? 'visible' : 'hidden'}`}>{userName}</p>
                <button className="toggle-btn" onClick={toggleSidebar}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {isOpen ? (
                            <polyline points="15 18 9 12 15 6"></polyline>
                        ) : (
                            <polyline points="9 18 15 12 9 6"></polyline>
                        )}
                    </svg>
                </button>
            </div>
            
            <nav className="sidebar-nav">
                <ul>
                    <li 
                        className={`sidebar-item ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => handleTabClick('search')}
                    >
                        <span className="sidebar-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </span>
                        <span className={`sidebar-text ${isOpen ? 'visible' : 'hidden'}`}>Search</span>
                    </li>
                    <li 
                        className={`sidebar-item ${activeTab === 'saved' ? 'active' : ''}`}
                        onClick={() => handleTabClick('saved')}
                    >
                        <span className="sidebar-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </span>
                        <span className={`sidebar-text ${isOpen ? 'visible' : 'hidden'}`}>Saved Companies</span>
                    </li>
                    <li 
                        className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => handleTabClick('settings')}
                    >
                        <span className="sidebar-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </span>
                        <span className={`sidebar-text ${isOpen ? 'visible' : 'hidden'}`}>Settings</span>
                    </li>
                </ul>
            </nav>
            
            <div className={`sidebar-footer ${isOpen ? 'visible' : 'hidden'}`}>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                    <svg 
                        className="mr-3 h-5 w-5 text-gray-500" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                        />
                    </svg>
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar; 