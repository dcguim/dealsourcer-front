import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import SearchTab from '../components/dashboard/SearchTab';
import SavedCompanies from '../components/dashboard/SavedCompanies';
import Settings from '../components/dashboard/Settings';
import './Dashboard.css';
import axios from 'axios';
import { API_URL } from '../utils/constants';

// Add a fallback component for error handling
const FallbackComponent = ({ componentName, error }) => {
    return (
        <div style={{ padding: '20px', margin: '20px', border: '1px solid #f44336', borderRadius: '5px', backgroundColor: '#ffebee' }}>
            <h2>Error loading {componentName}</h2>
            <p>{error?.message || 'Unknown error occurred'}</p>
            <div style={{ marginTop: '10px' }}>
                <button 
                    style={{ padding: '8px 16px', backgroundColor: '#3b3992', color: 'white', border: 'none', borderRadius: '4px' }}
                    onClick={() => window.location.reload()}
                >
                    Reload Page
                </button>
            </div>
        </div>
    );
};

// Simplified dashboard loader for initial rendering
const DashboardLoader = () => (
    <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b3992] mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading dashboard...</p>
        </div>
    </div>
);

// Emergency recovery component if dashboard fails to load
const EmergencyRecovery = () => {
    const navigate = useNavigate();
    
    const handleSignOut = () => {
        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        // Redirect to sign in
        navigate('/signin');
    };
    
    return (
        <div className="flex h-screen bg-gray-100 items-center justify-center">
            <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Dashboard Cannot Load</h2>
                <p className="mb-4 text-gray-700">
                    We're having trouble loading your dashboard. This may be due to:
                </p>
                <ul className="mb-6 text-left text-gray-600 pl-6 list-disc">
                    <li>Authentication issues</li>
                    <li>Server connectivity problems</li>
                    <li>Browser compatibility issues</li>
                </ul>
                <div className="flex flex-col space-y-3">
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-[#3b3992] text-white rounded hover:bg-[#2e2c70]"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={handleSignOut}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        Sign Out and Return to Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

// Use error boundary pattern directly in the component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Keep this error logging for production error tracking
        console.error("Dashboard error boundary caught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <EmergencyRecovery />;
        }

        return this.props.children;
    }
}

// A helper function to directly check localStorage
const checkAndLogLocalStorage = () => {
    try {
        // Print detailed information about localStorage
        console.log('======= LOCAL STORAGE DIAGNOSTIC =======');
        
        // Check if localStorage is available
        const isAvailable = typeof localStorage !== 'undefined';
        console.log('localStorage available:', isAvailable);
        
        if (!isAvailable) {
            console.error('localStorage is not available in this browser context');
            return false;
        }
        
        // Check token in localStorage
        const authToken = localStorage.getItem('authToken');
        console.log('authToken exists:', !!authToken);
        console.log('authToken type:', typeof authToken);
        console.log('authToken length:', authToken ? authToken.length : 0);
        console.log('authToken preview:', authToken ? `${authToken.substring(0, 15)}...${authToken.substring(authToken.length - 5)}` : 'null');
        
        // Check user email
        const userEmail = localStorage.getItem('userEmail');
        console.log('userEmail exists:', !!userEmail);
        console.log('userEmail value:', userEmail);
        
        // Check if axios has the authorization header
        const hasAuthHeader = axios.defaults.headers.common['Authorization'];
        console.log('axios auth header exists:', !!hasAuthHeader);
        
        // Summary result
        const storageValid = !!authToken && !!userEmail;
        console.log('localStorage validation:', storageValid ? 'PASSED' : 'FAILED');
        console.log('======= END DIAGNOSTIC =======');
        
        return storageValid;
    } catch (error) {
        console.error('Error checking localStorage:', error);
        return false;
    }
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('search');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardError, setDashboardError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const email = localStorage.getItem('userEmail');
                
                if (!token) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                // Set axios authorization header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Set the authenticated state
                setIsAuthenticated(true);
                setUserEmail(email || '');
            } catch (error) {
                console.error('Error initializing dashboard auth:', error);
                setDashboardError(error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const renderTabContent = () => {
        try {
            switch (activeTab) {
                case 'search':
                    return (
                        <Suspense fallback={<DashboardLoader />}>
                            <SearchTab key="search-tab" />
                        </Suspense>
                    );
                case 'saved':
                    return (
                        <Suspense fallback={<DashboardLoader />}>
                            <SavedCompanies key="saved-tab" />
                        </Suspense>
                    );
                case 'settings':
                    return (
                        <Suspense fallback={<DashboardLoader />}>
                            <Settings key="settings-tab" userEmail={userEmail} />
                        </Suspense>
                    );
                default:
                    return (
                        <Suspense fallback={<DashboardLoader />}>
                            <SearchTab key="default-search-tab" />
                        </Suspense>
                    );
            }
        } catch (error) {
            return <FallbackComponent componentName={activeTab} error={error} />;
        }
    };

    if (dashboardError) {
        return <EmergencyRecovery />;
    }

    if (isLoading) {
        if (sessionStorage.getItem('user_logout') === 'true') {
            return null;
        }
        
        return (
            <div className="flex h-screen bg-gray-100 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b3992] mx-auto"></div>
                    <p className="mt-4 text-gray-700">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (sessionStorage.getItem('user_logout') === 'true') {
            return null;
        }
        
        return (
            <div className="flex h-screen bg-gray-100 items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
                    <p className="mb-4">Please sign in to access the dashboard</p>
                    <button 
                        onClick={() => navigate('/signin')}
                        className="px-4 py-2 bg-[#3b3992] text-white rounded hover:bg-[#2e2c70]"
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <ErrorBoundary>
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
        </ErrorBoundary>
    );
};

export default Dashboard; 