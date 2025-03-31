import React, { useState, useEffect } from 'react';
import { API_URL } from '../../utils/constants';
import './SearchTab.css';
import SearchResults from './SearchResults';
import BirthYearRangeSlider from '../BirthYearRangeSlider';
import { useNavigate } from 'react-router-dom';

const SearchTab = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        name: '',
        description: '',
        legal_form: '',
        participant_name: '',
        participant_birth_year: 1960,
        participant_birth_year_range: 10,
        yearFilterEnabled: false
    });
    
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isApiError, setIsApiError] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [cachedResults, setCachedResults] = useState([]);
    const resultsPerPage = 10;
    const batchSize = 100;
    
    const legalForms = [
        'AG', 'AG+Co KG', 'AG+Co OHG', 'AöR', 'EGB', 'EWIV', 'GmbH', 
        'GmbH+Co KG', 'GmbH+Co OHG', 'JPpR', 'KG', 'KGaA', 'KöR', 
        'OHG', 'RAR', 'SE', 'SJP', 'StbR', 'UG (haftungsbeschränkt)', 
        'VVaG', 'eK'
    ];
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleYearRangeChange = ({ minYear, maxYear, isActive }) => {
        // Ensure we're working with integers
        const minYearInt = Math.floor(minYear);
        const maxYearInt = Math.floor(maxYear);
        
        // Calculate center year and range as integers
        const centerYear = Math.floor((minYearInt + maxYearInt) / 2);
        const yearRange = Math.floor((maxYearInt - minYearInt) / 2);
        
        setSearchParams(prev => {
            if (prev.participant_birth_year === centerYear && 
                prev.participant_birth_year_range === yearRange && 
                prev.yearFilterEnabled === isActive) {
                return prev;
            }
            return {
                ...prev,
                participant_birth_year: centerYear,
                participant_birth_year_range: yearRange,
                yearFilterEnabled: isActive
            };
        });
    };
    
    const fetchResults = async (offset = 0) => {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            // Don't clear results immediately, just show a warning
            setError('Your session will expire soon. Please save any important information.');
            return {
                results: cachedResults,
                total: totalResults
            };
        }

        try {
            const queryParams = new URLSearchParams();
            queryParams.append('status', 'aktiv');
            queryParams.append('limit', '100');
            queryParams.append('offset', offset.toString());
            
            // Add optional search parameters if they have values
            if (searchParams.name) queryParams.append('name', searchParams.name);
            if (searchParams.description) queryParams.append('description', searchParams.description);
            if (searchParams.legal_form) queryParams.append('legal_form', searchParams.legal_form);
            if (searchParams.participant_name) queryParams.append('participant_name', searchParams.participant_name);
            
            if (searchParams.yearFilterEnabled) {
                queryParams.append('participant_birth_year', Math.floor(searchParams.participant_birth_year).toString());
                queryParams.append('participant_birth_year_range', Math.floor(searchParams.participant_birth_year_range).toString());
            }

            const requestUrl = `${API_URL}/search?${queryParams.toString()}`;

            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                mode: 'cors'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                });

                if (response.status === 401) {
                    // Don't clear results immediately on 401, show a warning first
                    setError('Your session is expiring. Please save your work and sign in again soon.');
                    return {
                        results: cachedResults,
                        total: totalResults
                    };
                }

                if (response.status === 403) {
                    setError('You do not have permission to perform this search. Please sign in again.');
                    return {
                        results: cachedResults,
                        total: totalResults
                    };
                }

                if (errorData?.detail) {
                    handleApiError(`API Error: ${errorData.detail}`);
                    return {
                        results: cachedResults,
                        total: totalResults
                    };
                }

                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            return {
                results: data.results || [],
                total: data.total || 0
            };
        } catch (error) {
            console.error('Fetch error:', error);
            if (error.message.includes('Failed to fetch')) {
                handleRequestError({
                    message: 'Failed to fetch',
                    details: 'Unable to connect to the server. Please check your internet connection.'
                });
            } else {
                handleRequestError({
                    message: error.message,
                    details: 'The server returned an invalid response. Please try again later.'
                });
            }
            // Return existing results instead of null
            return {
                results: cachedResults,
                total: totalResults
            };
        }
    };

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setIsApiError(false);
        setCurrentPage(1);
        setCachedResults([]);
        
        const response = await fetchResults(0);
        if (response) {
            setCachedResults(response.results);
            setTotalResults(response.total || response.results.length);
        }
        
        setIsLoading(false);
    };

    const handlePageChange = async (newPage) => {
        // Check if we need to fetch the next batch (every 5 pages)
        // Only fetch if we don't already have the next batch cached
        if (newPage % 5 === 0) {
            const nextBatchStartIndex = newPage * resultsPerPage;
            if (nextBatchStartIndex >= cachedResults.length) {
                setIsLoading(true);
                const nextBatchOffset = cachedResults.length;
                
                const response = await fetchResults(nextBatchOffset);
                if (response && response.results && response.results.length > 0) {
                    const newCachedResults = [...cachedResults, ...response.results];
                    setCachedResults(newCachedResults);
                    const newTotal = response.total || newCachedResults.length;
                    setTotalResults(newTotal);
                } else {
                    setTotalResults(cachedResults.length);
                }
                setIsLoading(false);
            }
        }
        
        setCurrentPage(newPage);
    };

    // Get current page's results
    const getCurrentPageResults = () => {
        const startIndex = (currentPage - 1) * resultsPerPage;
        const endIndex = startIndex + resultsPerPage;
        return cachedResults.slice(startIndex, endIndex);
    };

    const handleClear = () => {
        setSearchParams({
            name: '',
            description: '',
            legal_form: '',
            participant_name: '',
            participant_birth_year: 1960,
            participant_birth_year_range: 10,
            yearFilterEnabled: false
        });
        setResults([]);
        setError('');
        setCurrentPage(1);
        setCachedResults([]);
    };

    const handleSignInRedirect = () => {
        localStorage.removeItem('authToken');
        navigate('/signin');
    };

    const handleAuthError = (message) => {
        setIsApiError(true);
        setError(message);
        // Don't clear the token immediately
        setTimeout(() => {
            const shouldRedirect = window.confirm('Your session has expired. Would you like to sign in again to continue viewing results?');
            if (shouldRedirect) {
                localStorage.removeItem('authToken');
                navigate('/signin');
            }
        }, 1000);
    };

    const handleApiError = (message) => {
        setIsApiError(true);
        setError(message);
    };

    const handleRequestError = (error) => {
        setIsApiError(true);
        if (error.details) {
            setError(error.details);
        } else {
            setError(
                error.message === 'Failed to fetch'
                    ? 'Unable to connect to the server. Please check your internet connection.'
                    : `Error: ${error.message}. Please try again later.`
            );
        }
    };
    
    // Calculate min and max years for the slider based on center and range
    const sliderMinYear = searchParams.participant_birth_year - searchParams.participant_birth_year_range;
    const sliderMaxYear = searchParams.participant_birth_year + searchParams.participant_birth_year_range;
    
    return (
        <div className="search-tab">
            <div className="search-container">
                <h1>Search Companies</h1>
                <form className="search-form" onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                }}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Company Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={searchParams.name}
                                onChange={handleInputChange}
                                placeholder="Enter company name"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                value={searchParams.description}
                                onChange={handleInputChange}
                                placeholder="Enter company description"
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
                                <option value="">Select Legal Form</option>
                                {legalForms.map(form => (
                                    <option key={form} value={form}>{form}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="participant_name">Participant Name</label>
                            <input
                                type="text"
                                id="participant_name"
                                name="participant_name"
                                value={searchParams.participant_name}
                                onChange={handleInputChange}
                                placeholder="Enter participant name"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Birth Year Range</label>
                            <BirthYearRangeSlider
                                onChange={handleYearRangeChange}
                                initialMinYear={sliderMinYear}
                                initialMaxYear={sliderMaxYear}
                                disabled={!searchParams.yearFilterEnabled}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClear}
                            disabled={isLoading}
                        >
                            Clear
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    {isApiError && (
                        <button 
                            className="btn btn-primary mt-4"
                            onClick={handleSignInRedirect}
                        >
                            Sign In Again
                        </button>
                    )}
                </div>
            )}

            {!error && (cachedResults.length > 0 || isLoading) ? (
                <SearchResults 
                    results={getCurrentPageResults()}
                    loading={isLoading}
                    totalResults={totalResults}
                    currentPage={currentPage}
                    resultsPerPage={resultsPerPage}
                    onPageChange={handlePageChange}
                />
            ) : null}

            {!error && !isLoading && cachedResults.length === 0 && (
                <div className="no-results">
                    <p>No results found. Try adjusting your search criteria.</p>
                </div>
            )}
        </div>
    );
};

export default SearchTab; 