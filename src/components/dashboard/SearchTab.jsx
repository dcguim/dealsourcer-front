import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { API_URL, allowSearchAccess } from '../../App';
import './SearchTab.css';
import SearchResults from './SearchResults';
import BirthYearRangeSlider from '../BirthYearRangeSlider';
import { markUserInitiatedRequest } from '../../utils/searchDebug';

// Create a function outside the component that does nothing
// This will be used instead of the real handler when we don't want to process changes
const noopFunction = () => {
    console.log("🛑 Noop function called - intentionally doing nothing");
    return null;
};

const SearchTab = () => {
    const [searchParams, setSearchParams] = useState({
        name: '',
        description: '',
        jurisdiction: '',
        legal_form: '',
        status: 'active',
        participant_name: ''
    });
    
    // Separate state for the year range
    const [yearBoundaries, setYearBoundaries] = useState({
        minYear: 1970,
        maxYear: 1990
    });
    
    // Track if age filter is active
    const [isAgeFilterActive, setIsAgeFilterActive] = useState(true);
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [totalResults, setTotalResults] = useState(0);
    
    // Flag to prevent initial search
    const [hasSearched, setHasSearched] = useState(false);
    
    // Ref to track if search should be performed automatically
    const shouldAutoSearch = useRef(false);
    
    // Last time a user explicitly clicked the search button
    const lastUserSearchTime = useRef(0);
    
    // Completely prevent non-user initiated searches
    const originalAxiosGet = useRef(null);
    useEffect(() => {
        // Save the original axios.get method on mount
        if (!originalAxiosGet.current) {
            originalAxiosGet.current = axios.get;
            
            // Replace axios.get with our filtered version
            axios.get = function(...args) {
                const url = args[0];
                
                // Check if this is a search request
                if (url && typeof url === 'string' && url.includes(`${API_URL}/search`)) {
                    // If no manual search was performed recently, block it
                    const timeSinceLastSearch = Date.now() - lastUserSearchTime.current;
                    if (timeSinceLastSearch > 1000) { // If more than 1 second since last user search
                        console.warn('⛔⛔ SEARCH BLOCKED IN COMPONENT: No recent user-initiated search');
                        return Promise.resolve({
                            data: {
                                results: [],
                                total: 0,
                                _blocked: true
                            }
                        });
                    }
                }
                
                // Allow the request to proceed
                return originalAxiosGet.current.apply(this, args);
            };
        }
        
        // Restore on unmount
        return () => {
            if (originalAxiosGet.current) {
                axios.get = originalAxiosGet.current;
            }
        };
    }, []);
    
    const legalForms = [
        'AG', 'AG+Co KG', 'AG+Co OHG', 'AöR', 'EGB', 'EWIV', 'GmbH', 
        'GmbH+Co KG', 'GmbH+Co OHG', 'JPpR', 'KG', 'KGaA', 'KöR', 
        'OHG', 'RAR', 'SE', 'SJP', 'StbR', 'UG (haftungsbeschränkt)', 
        'VVaG', 'eK'
    ];
    
    // Create a special handler for the year range that does absolutely nothing
    // This ensures that even if the slider tries to notify, it won't trigger any state changes
    const handleYearRangeChange = useCallback((newYearRange) => {
        // Do nothing - we don't want ANY state changes from the slider component to trigger searches
    }, []);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams({ ...searchParams, [name]: value });
    };
    
    const handleSearch = async (e) => {
        if (e) {
            e.preventDefault();
            
            // Remove debug guards and global flags
            lastUserSearchTime.current = Date.now();
            markUserInitiatedRequest(); // Keep this since it's an empty function now
            allowSearchAccess();
        }
        
        setLoading(true);
        setError('');
        setHasSearched(true);
        
        try {
            // Prepare query parameters
            const queryParams = new URLSearchParams();
            
            // Add non-empty parameters
            if (searchParams.name && searchParams.name.length >= 2) {
                queryParams.append('name', searchParams.name);
            }
            
            if (searchParams.description && searchParams.description.length >= 2) {
                queryParams.append('description', searchParams.description);
            }
            
            if (searchParams.jurisdiction) {
                queryParams.append('jurisdiction', searchParams.jurisdiction);
            }
            
            if (searchParams.legal_form) {
                queryParams.append('legal_form', searchParams.legal_form);
            }
            
            // Convert status to German for the API
            if (searchParams.status) {
                const statusMapping = {
                    'active': 'aktiv',
                    'inactive': 'gelöscht'
                };
                queryParams.append('status', statusMapping[searchParams.status]);
            }
            
            if (searchParams.participant_name) {
                queryParams.append('participant_name', searchParams.participant_name);
            }
            
            // Calculate center year and range for API request
            // Only add birth year parameters if filter is active
            if (yearBoundaries && isAgeFilterActive) {
                const centerYear = Math.round((yearBoundaries.minYear + yearBoundaries.maxYear) / 2);
                const range = Math.round((yearBoundaries.maxYear - yearBoundaries.minYear) / 2);
                
                queryParams.append('participant_birth_year', centerYear);
                queryParams.append('participant_birth_year_range', range);
            }
            
            // Make API request
            const response = await axios.get(`${API_URL}/search?${queryParams.toString()}`);
            
            if (response.data && Array.isArray(response.data.results)) {
                setResults(response.data.results);
                setTotalResults(response.data.total || response.data.results.length);
            } else {
                setResults([]);
                setTotalResults(0);
            }
        } catch (error) {
            console.error('Error searching organizations:', error);
            setError('An error occurred while searching. Please try again.');
            setResults([]);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    };
    
    const handleClear = () => {
        setSearchParams({
            name: '',
            description: '',
            jurisdiction: '',
            legal_form: '',
            status: 'active',
            participant_name: ''
        });
        
        setYearBoundaries({
            minYear: 1970,
            maxYear: 1990
        });
        
        setIsAgeFilterActive(true);
        setResults([]);
        setTotalResults(0);
        setError('');
        setHasSearched(false);
    };
    
    return (
        <div className="search-tab">
            <h1>Search Organizations</h1>
            
            <div className="search-container">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Organization Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={searchParams.name}
                                onChange={handleInputChange}
                                placeholder="Enter organization name (min 2 characters)"
                                minLength="2"
                                maxLength="255"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="description">Description Keywords</label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                value={searchParams.description}
                                onChange={handleInputChange}
                                placeholder="Enter keywords (min 2 characters)"
                                minLength="2"
                                maxLength="500"
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="legal_form">Legal Form</label>
                            <select
                                id="legal_form"
                                name="legal_form"
                                value={searchParams.legal_form}
                                onChange={handleInputChange}
                            >
                                <option value="">Select a legal form</option>
                                {legalForms.map((form) => (
                                    <option key={form} value={form}>{form}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={searchParams.status}
                                onChange={handleInputChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="participant_name">Participant Name</label>
                            <input
                                type="text"
                                id="participant_name"
                                name="participant_name"
                                value={searchParams.participant_name}
                                onChange={handleInputChange}
                                placeholder="Enter participant name"
                                maxLength="255"
                            />
                        </div>
                    </div>
                </form>

                {/* Age Filter section - styled like other form components */}
                <div className="search-form" style={{ marginTop: '20px' }}>
                    <div className="form-row">
                        <div className="form-group" style={{ width: '100%' }}>
                            <label htmlFor="age-filter">Age Filter</label>
                            <BirthYearRangeSlider 
                                onChange={handleYearRangeChange}
                                initialMinYear={yearBoundaries.minYear}
                                initialMaxYear={yearBoundaries.maxYear}
                            />
                        </div>
                    </div>
                </div>

                {/* Continue with the form actions in its own mini-form */}
                <div style={{ marginTop: '20px' }}>
                    <div className="form-actions">
                        <button 
                            onClick={handleSearch}
                            className="btn btn-primary" 
                            disabled={loading}
                            type="button"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={handleClear}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {hasSearched && (
                <div className="results-container">
                    {results.length > 0 ? (
                        <div className="results-summary">
                            Found {totalResults} organization(s)
                        </div>
                    ) : (
                        !loading && <div className="results-summary">No results found</div>
                    )}
                    
                    <SearchResults results={results} loading={loading} />
                </div>
            )}
        </div>
    );
};

export default SearchTab; 