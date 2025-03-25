import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../App';
import './Settings.css';

const Settings = () => {
    const [profile, setProfile] = useState({
        email: '',
        firstName: '',
        lastName: '',
        company: '',
        jobTitle: '',
        notificationPreferences: {
            newCompanyAlerts: true,
            weeklyDigest: true,
            marketUpdates: false
        }
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    useEffect(() => {
        // This would fetch user profile from API
        // For now we'll simulate with timeout and session storage
        const fetchProfile = async () => {
            setLoading(true);
            try {
                // In a real app, we would fetch from the API
                // const response = await axios.get(`${API_URL}/user/profile`);
                // setProfile(response.data);
                
                // For now, we'll get the email from session storage and simulate a delay
                setTimeout(() => {
                    const email = sessionStorage.getItem('email') || 'user@example.com';
                    setProfile(prevProfile => ({
                        ...prevProfile,
                        email
                    }));
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setMessage({
                    text: 'Failed to load profile. Please try again.',
                    type: 'error'
                });
                setLoading(false);
            }
        };
        
        fetchProfile();
    }, []);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            [name]: value
        });
    };
    
    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setProfile({
            ...profile,
            notificationPreferences: {
                ...profile.notificationPreferences,
                [name]: checked
            }
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });
        
        try {
            // In a real app, we would update the profile via API
            // await axios.put(`${API_URL}/user/profile`, profile);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setMessage({
                text: 'Profile updated successfully!',
                type: 'success'
            });
            
            // Clear message after 5 seconds
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 5000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({
                text: 'Failed to update profile. Please try again.',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) {
        return (
            <div className="settings-loading">
                <div className="loading-spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }
    
    return (
        <div className="settings">
            <h1>Account Settings</h1>
            
            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                    {message.text}
                </div>
            )}
            
            <div className="settings-container">
                <form onSubmit={handleSubmit}>
                    <div className="settings-section">
                        <h2>Personal Information</h2>
                        
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={profile.email}
                                readOnly
                                className="read-only"
                            />
                            <small>Email cannot be changed. Contact support if needed.</small>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={profile.firstName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your first name"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={profile.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your last name"
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="company">Company</label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={profile.company}
                                    onChange={handleInputChange}
                                    placeholder="Enter your company name"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="jobTitle">Job Title</label>
                                <input
                                    type="text"
                                    id="jobTitle"
                                    name="jobTitle"
                                    value={profile.jobTitle}
                                    onChange={handleInputChange}
                                    placeholder="Enter your job title"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="settings-section">
                        <h2>Notification Preferences</h2>
                        <p className="section-description">
                            Control what types of notifications you receive from Deal Sourcer.
                        </p>
                        
                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="newCompanyAlerts"
                                    checked={profile.notificationPreferences.newCompanyAlerts}
                                    onChange={handleNotificationChange}
                                />
                                <span className="checkbox-text">
                                    New Company Alerts
                                    <small>Get notified when new companies matching your criteria are added</small>
                                </span>
                            </label>
                            
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="weeklyDigest"
                                    checked={profile.notificationPreferences.weeklyDigest}
                                    onChange={handleNotificationChange}
                                />
                                <span className="checkbox-text">
                                    Weekly Digest
                                    <small>Receive a weekly summary of your saved companies and market activity</small>
                                </span>
                            </label>
                            
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="marketUpdates"
                                    checked={profile.notificationPreferences.marketUpdates}
                                    onChange={handleNotificationChange}
                                />
                                <span className="checkbox-text">
                                    Market Updates
                                    <small>Stay informed about general market trends and news</small>
                                </span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="settings-section">
                        <h2>Security</h2>
                        
                        <div className="security-actions">
                            <button type="button" className="btn btn-outline">
                                Change Password
                            </button>
                            
                            <button type="button" className="btn btn-outline">
                                Enable Two-Factor Authentication
                            </button>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings; 