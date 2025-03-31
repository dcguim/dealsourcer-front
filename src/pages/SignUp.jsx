// src/pages/SignUp.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/constants';
import './Auth.css';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Clean input values and format properly for API
        const userData = {
            email: email.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            company: company.trim()
        };
        
        console.log('Attempting signup with data:', userData);
        console.log('API URL:', `${API_URL}/api/signup`);

        try {
            const response = await axios.post(`${API_URL}/api/signup`, userData);
            
            console.log('Signup response:', response);
            console.log('Signup successful:', response.data);
            
            // Store email for verification page
            sessionStorage.setItem('pendingAuth', JSON.stringify({ 
                email,
                source: 'signup'
            }));
            
            // Redirect to the access code page
            navigate('/access', { 
                state: { 
                    email,
                    source: 'signup'
                }
            });
        } catch (error) {
            console.error('Error signing up:', error);
            
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
                <h2>Sign Up</h2>
                <p className="auth-subtitle">Create a new account to get started</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSignUp} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input 
                            type="text" 
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)} 
                            required 
                            disabled={loading}
                            placeholder="John"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input 
                            type="text" 
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)} 
                            required 
                            disabled={loading}
                            placeholder="Doe"
                        />
                    </div>
                    
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
                    
                    <div className="form-group">
                        <label htmlFor="company">Company</label>
                        <input 
                            type="text" 
                            id="company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)} 
                            required 
                            disabled={loading}
                            placeholder="Your Company"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                
                <p className="auth-footer">
                    Already have an account? <a href="/signin">Sign In</a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;