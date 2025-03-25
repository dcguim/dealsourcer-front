// src/pages/SignIn.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../App';
import './Auth.css';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Prepare request data - ensure proper format
        const requestData = { email: email.trim() };

        try {
            console.log(`Attempting to sign in with API endpoint: ${API_URL}/api/signup`);
            console.log('Request data:', requestData);
            
            // Send sign-in request to the API endpoint
            const response = await axios.post(`${API_URL}/api/signup`, requestData);
            
            console.log('Sign in request successful:', response.data);
            
            // Redirect to access code page with email in query param
            navigate(`/access-code?email=${encodeURIComponent(email)}&mode=signin`);
        } catch (error) {
            console.error('Error signing in:', error);
            
            // Detailed error logging
            if (error.response) {
                console.error('API error response:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
                setError(
                    error.response.data?.message || 
                    `Error (${error.response.status}): ${error.response.statusText}`
                );
            } else if (error.request) {
                console.error('No response received:', error.request);
                setError('No response from server. Please check your internet connection and try again.');
            } else {
                console.error('Request setup error:', error.message);
                setError(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Sign In</h2>
                <p className="auth-subtitle">Enter your email to receive an access code</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSignIn} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            disabled={loading}
                            placeholder="your@email.com"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Sending Code...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="debug-info" style={{ fontSize: '12px', color: '#666', marginTop: '20px', textAlign: 'left' }}>
                    <details>
                        <summary>Debug Information</summary>
                        <p>API URL: {API_URL}</p>
                        <p>Endpoint: {API_URL}/api/signup</p>
                    </details>
                </div>
                
                <p className="auth-footer">
                    Don't have an account? <a href="/signup">Sign Up</a>
                </p>
            </div>
        </div>
    );
};

export default SignIn; 