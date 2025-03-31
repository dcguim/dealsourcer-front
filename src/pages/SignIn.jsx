// src/pages/SignIn.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import './Auth.css';

const SignIn = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError('Please enter your email address');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setMessage('');
        
        try {
            console.log(`Requesting login code for ${email} from ${API_URL}/api/request-login-code`);
            
            // Request login code
            const response = await axios.post(`${API_URL}/api/request-login-code`, { email });
            
            console.log("Login code requested successfully:", response.data);
            
            // Set success message
            setMessage('Access code sent successfully! Redirecting to code entry...');
            
            // Store email and a flag indicating we should set authentication after successful verification
            // This avoids trying to pass a function through navigation state
            sessionStorage.setItem('pendingAuth', JSON.stringify({ 
                email,
                source: 'signin',
                shouldAuthenticate: true // A flag to indicate authentication should be set after verification
            }));
            
            // Navigate to access code page after a brief delay
            setTimeout(() => {
                console.log("Navigating to /access page...");
                navigate('/access', { 
                    state: { 
                        email,
                        source: 'signin'
                    }
                });
            }, 1500); // 1.5 second delay for user to see success message
            
        } catch (error) {
            console.error('Error requesting login code:', error);
            
            // Even if there's an API error, there's a chance the email was still sent
            // Set a more user-friendly error message
            setError('We encountered an issue, but an access code might still have been sent to your email. Please check your inbox or try again.');
            
            // Store email info anyway for fallback navigation
            sessionStorage.setItem('pendingAuth', JSON.stringify({ 
                email,
                source: 'signin',
                shouldAuthenticate: true // Add flag here too
            }));
            
            // After a brief delay, proceed to code entry page anyway
            setTimeout(() => {
                console.log("Proceeding to code entry despite error");
                navigate('/access', { 
                    state: { 
                        email,
                        source: 'signin'
                    }
                });
            }, 3000); // 3 second delay to let user read the error message
            
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="m-auto w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Sign In</h1>
                    <p className="mt-2 text-sm text-gray-600">Enter your email to receive an access code</p>
                </div>
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {message && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-green-700">{message}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#3b3992] hover:bg-[#2e2c70] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b3992] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Sending code...' : 'Send access code'}
                        </button>
                    </div>
                    
                    <div className="text-center">
                        <p className="text-sm">
                            Don't have an account?{' '}
                            <a href="/signup" className="font-medium text-[#3b3992] hover:text-[#2e2c70]">
                                Sign up
                            </a>
                        </p>
                    </div>
                </form>
                
                {/* Manual navigation button, more visible when there's an error */}
                <div className="mt-4">
                    <button
                        onClick={() => {
                            console.log("Manual navigation to /access");
                            sessionStorage.setItem('pendingAuth', JSON.stringify({ 
                                email, 
                                source: 'signin',
                                shouldAuthenticate: true // Add flag here too
                            }));
                            navigate('/access', { 
                                state: { 
                                    email, 
                                    source: 'signin'
                                } 
                            });
                        }}
                        className={`text-sm ${error ? 'font-medium text-[#3b3992]' : 'text-gray-600'} hover:text-[#2e2c70]`}
                    >
                        Already have a code? Click here to proceed to code entry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignIn; 