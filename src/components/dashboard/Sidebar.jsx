import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, isOpen, toggleSidebar }) => {
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <h2 className={isOpen ? 'visible' : 'hidden'}>Deal Sourcer</h2>
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
                <p>© 2023 Deal Sourcer</p>
            </div>
        </div>
    );
};

export default Sidebar; 