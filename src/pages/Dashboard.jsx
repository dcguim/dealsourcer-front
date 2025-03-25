import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import SearchTab from '../components/dashboard/SearchTab';
import SavedCompanies from '../components/dashboard/SavedCompanies';
import Settings from '../components/dashboard/Settings';
import './Dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('search');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication
        const email = localStorage.getItem('userEmail');
        if (!email) {
            // Not authenticated, redirect to sign in
            navigate('/signin');
            return;
        }
        setUserEmail(email);
        
        // Log that dashboard is loaded, helpful for debugging
        console.log('Dashboard loaded, active tab:', activeTab);
    }, [navigate, activeTab]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Use memo to prevent unnecessary re-renders that might trigger searches
    const renderTabContent = () => {
        console.log('Rendering tab content for:', activeTab);
        
        switch (activeTab) {
            case 'search':
                return <SearchTab key="search-tab" />;
            case 'saved':
                return <SavedCompanies key="saved-tab" />;
            case 'settings':
                return <Settings key="settings-tab" userEmail={userEmail} />;
            default:
                return <SearchTab key="default-search-tab" />;
        }
    };

    return (
        <div className="dashboard">
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
            <main className={`dashboard-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                {renderTabContent()}
            </main>
        </div>
    );
};

export default Dashboard; 