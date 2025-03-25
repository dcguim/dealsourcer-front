import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../App';
import './Auth.css';

const AccessCode = () => {
    const [accessCode, setAccessCode] = useState('');
    const [email, setEmail] = useState('');
    const [mode, setMode] = useState('signup'); // Default to signup mode
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Extract email and mode from query parameters
        const params = new URLSearchParams(location.search);
        const emailParam = params.get('email');
        const modeParam = params.get('mode');
        
        if (emailParam) {
            setEmail(emailParam);
            console.log(`Email set from URL: ${emailParam}`);
        }
        
        if (modeParam) {
            setMode(modeParam);
            console.log(`Mode set from URL: ${modeParam}`);
        }
    }, [location]);

    useEffect(() => {
        // Create a countdown for code expiration (5 minutes)
        if (email) {
            setCountdown(5 * 60); // 5 minutes in seconds
        }
    }, [email]);

    useEffect(() => {
        // Handle countdown timer
        if (countdown === null) return;
        
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [countdown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleAccessCodeSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Make sure the access code is properly formatted (remove any spaces, etc.)
        const cleanedCode = accessCode.trim();
        
        // Detailed request log
        const requestData = { 
            email: email,
            access_code: cleanedCode
        };
        
        console.log(`Verifying code with API endpoint: ${API_URL}/api/verify-code`);
        console.log('Request data:', requestData);

        try {
            // Configure axios with proper headers
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };
            
            const response = await axios.post(
                `${API_URL}/api/verify-code`, 
                requestData,
                config
            );
            
            console.log('Verification response:', response);
            console.log('Verification successful:', response.data);
            
            // Save the token if provided by the API
            if (response.data && response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userEmail', email);
                console.log('Auth token saved in localStorage');
            } else {
                console.log('No token received from API');
                // Still consider verification successful if API doesn't return a token
                localStorage.setItem('userEmail', email);
                console.log('User email saved in localStorage');
            }
            
            // Show success message
            alert('Verification successful! Redirecting to homepage.');
            
            // Redirect to dashboard or home page after successful verification
            navigate('/');
        } catch (error) {
            console.error('Error verifying access code:', error);
            
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

    const handleResendCode = async () => {
        setLoading(true);
        setError('');

        const requestData = { email: email };
        console.log(`Resending code to ${email} using API endpoint: ${API_URL}/api/signup`);
        console.log('Request data:', requestData);

        try {
            // Configure axios with proper headers
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };
            
            // Use the signup endpoint to resend the code
            const response = await axios.post(
                `${API_URL}/api/signup`, 
                requestData,
                config
            );
            
            console.log('Resend code response:', response);
            
            // Reset countdown timer
            setCountdown(5 * 60);
            
            // Show success message
            alert('A new code has been sent to your email.');
        } catch (error) {
            console.error('Error resending code:', error);
            
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
                <h2>Enter Access Code</h2>
                <p className="auth-subtitle">
                    We've sent a code to your email: <strong>{email}</strong>
                </p>
                
                {countdown > 0 && (
                    <p className="timer">Code expires in: {formatTime(countdown)}</p>
                )}
                
                {countdown === 0 && (
                    <p className="expired-message">
                        Your code has expired. Please request a new one.
                    </p>
                )}
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleAccessCodeSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="accessCode">Access Code</label>
                        <input 
                            type="text" 
                            id="accessCode"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)} 
                            required 
                            autoFocus
                            disabled={loading || countdown === 0}
                            placeholder="Enter the 6-digit code"
                            maxLength={6}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading || countdown === 0}
                    >
                        {loading ? 'Verifying...' : 'Verify Access Code'}
                    </button>
                </form>
                
                <div className="debug-info" style={{ fontSize: '12px', color: '#666', marginTop: '20px', textAlign: 'left' }}>
                    <details>
                        <summary>Debug Information</summary>
                        <p>API URL: {API_URL}</p>
                        <p>Email: {email}</p>
                        <p>Mode: {mode}</p>
                        <p>Endpoint: {API_URL}/api/verify-code</p>
                    </details>
                </div>
                
                <p className="auth-footer">
                    Didn't receive a code or code expired?{' '}
                    <button 
                        className="text-button" 
                        onClick={handleResendCode}
                        disabled={loading}
                    >
                        Resend Code
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AccessCode;

