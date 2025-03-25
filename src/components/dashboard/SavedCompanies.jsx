import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../App';
import './SavedCompanies.css';

const SavedCompanies = () => {
    const [savedCompanies, setSavedCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // This function would typically fetch the user's saved companies
        // For now, we'll simulate it with mock data
        const fetchSavedCompanies = async () => {
            setLoading(true);
            try {
                // Normally you would call your API here
                // const response = await axios.get(`${API_URL}/saved-companies`);
                // setSavedCompanies(response.data);
                
                // Simulating API response with mock data
                setTimeout(() => {
                    const mockData = [
                        {
                            id: '1',
                            name: 'Example GmbH',
                            legal_form: 'GmbH',
                            status: 'aktiv',
                            jurisdiction: 'Berlin',
                            saved_on: new Date().toISOString(),
                            registration_number: 'HRB 123456',
                            description: 'A software development company specializing in AI solutions.'
                        },
                        {
                            id: '2',
                            name: 'Sample AG',
                            legal_form: 'AG',
                            status: 'aktiv',
                            jurisdiction: 'München',
                            saved_on: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                            registration_number: 'HRB 654321',
                            description: 'Financial services and consulting.'
                        }
                    ];
                    setSavedCompanies(mockData);
                    setLoading(false);
                }, 1000);
            } catch (err) {
                console.error('Error fetching saved companies:', err);
                setError('Failed to load your saved companies. Please try again later.');
                setLoading(false);
            }
        };

        fetchSavedCompanies();
    }, []);

    const handleRemoveCompany = (id) => {
        // This would typically make an API call to remove the company
        // For now, we'll just update the local state
        setSavedCompanies(savedCompanies.filter(company => company.id !== id));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="saved-companies-loading">
                <div className="loading-spinner"></div>
                <p>Loading your saved companies...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="saved-companies-error">
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        );
    }

    if (savedCompanies.length === 0) {
        return (
            <div className="saved-companies-empty">
                <h1>Saved Companies</h1>
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h2>No saved companies yet</h2>
                    <p>Companies you save from search results will appear here for quick access.</p>
                    <button className="btn btn-primary" onClick={() => window.location.hash = '#search'}>
                        Search Companies
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="saved-companies">
            <h1>Saved Companies</h1>
            
            <div className="saved-companies-list">
                {savedCompanies.map(company => (
                    <div key={company.id} className="saved-company-card">
                        <div className="saved-company-header">
                            <h3>{company.name}</h3>
                            <div className="saved-company-meta">
                                <span className="legal-form">{company.legal_form}</span>
                                <span className={`status ${company.status === 'aktiv' ? 'active' : 'inactive'}`}>
                                    {company.status === 'aktiv' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="saved-company-details">
                            <div className="detail-row">
                                <span className="detail-label">Registration Number:</span>
                                <span className="detail-value">{company.registration_number || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Jurisdiction:</span>
                                <span className="detail-value">{company.jurisdiction || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Saved On:</span>
                                <span className="detail-value">{formatDate(company.saved_on)}</span>
                            </div>
                        </div>
                        
                        {company.description && (
                            <div className="saved-company-description">
                                <p>{company.description}</p>
                            </div>
                        )}
                        
                        <div className="saved-company-actions">
                            <button className="btn btn-outline" onClick={() => window.open(`/company/${company.id}`, '_blank')}>
                                View Details
                            </button>
                            <button className="btn btn-danger" onClick={() => handleRemoveCompany(company.id)}>
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SavedCompanies; 