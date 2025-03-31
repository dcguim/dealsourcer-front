import React, { useState, useEffect } from 'react';
import './SearchResults.css';

// Format name helper function
const formatName = (name) => {
    // If name is already a string, return it
    if (typeof name === 'string') return name;
    
    // If name is an object, format it
    if (typeof name === 'object' && name !== null) {
        const nameParts = [];
        
        // Add title if present
        if (name.title) nameParts.push(name.title);
        
        // Add prefix if present
        if (name.prefix) nameParts.push(name.prefix);
        
        // Add first name if present
        if (name.first_name) nameParts.push(name.first_name);
        
        // Add last name if present
        if (name.last_name) nameParts.push(name.last_name);
        
        // Add birth name if different from last name
        if (name.birth_name && name.birth_name !== name.last_name) {
            nameParts.push(`(née ${name.birth_name})`);
        }
        
        // Add other names if present
        if (name.other_names) {
            if (typeof name.other_names === 'string') {
                nameParts.push(name.other_names);
            } else if (Array.isArray(name.other_names)) {
                nameParts.push(name.other_names.join(' '));
            }
        }
        
        // Add extra info if present
        if (name.extra) nameParts.push(name.extra);
        
        // Join all parts
        return nameParts.filter(Boolean).join(' ');
    }
    
    // Fallback
    return 'Unknown';
};

// Create a completely isolated ResultCard component with its own state
const ResultCard = ({ org, formatDate, onSave, onViewDetails }) => {
    // Each card has its own independent expansion state
    const [expanded, setExpanded] = useState(false);
    
    // Simplify the toggle function to be more direct and reliable
    const toggleExpand = (e) => {
        // Make sure to stop propagation
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        
        // Toggle with functional update
        setExpanded(prev => !prev);
        console.log("Expanded state changed to:", !expanded);
    };
    
    // Extract participants from the API response
    const extractParticipants = () => {
        // Check for participations array with participant objects
        if (org.participations && Array.isArray(org.participations)) {
            return org.participations.map(participation => {
                const participant = participation.participant || {};
                const roles = participation.roles || [];
                
                // Handle case where name is an object
                const participantName = formatName(participant.name);
                
                // Extract phone information from phone_infos array
                const contactInfo = extractPhoneInfo(participant);
                
                return {
                    name: participantName,
                    roles: roles.map(role => {
                        // Handle case where role.name might be an object
                        return typeof role.name === 'object' ? formatName(role.name) : role.name;
                    }).filter(Boolean).join(', ') || 'No role specified',
                    birth_year: participant.birth_year,
                    birth_date: participant.birth_date,
                    city: participant.seat?.city || 
                          (participant.addresses && participant.addresses.length > 0 ? 
                           participant.addresses[0].city : 'Unknown location'),
                    email: contactInfo.email || participant.email,
                    phone: contactInfo.phone || participant.phone || participant.telephone,
                    fax: contactInfo.fax || participant.fax,
                    website: participant.website
                };
            });
        }
        
        // Fallback to participants array if it exists and handle complex names
        if (org.participants && Array.isArray(org.participants)) {
            return org.participants.map(participant => {
                // Extract phone information from phone_infos array
                const contactInfo = extractPhoneInfo(participant);
                
                // Ensure phone and other contact fields are properly copied
                return {
                    ...participant,
                    name: formatName(participant.name),
                    roles: participant.role || participant.roles || '',
                    phone: contactInfo.phone || participant.phone || participant.telephone,
                    email: contactInfo.email || participant.email || participant.email_address,
                    fax: contactInfo.fax || participant.fax,
                    website: participant.website || participant.homepage
                };
            });
        }
        
        return [];
    };
    
    // Extract phone information from phone_infos array
    const extractPhoneInfo = (participant) => {
        const contactInfo = {
            phone: null,
            fax: null,
            email: null
        };
        
        // Check if participant has phone_infos array
        if (participant.phone_infos && Array.isArray(participant.phone_infos)) {
            participant.phone_infos.forEach(info => {
                if (info.phone_type === 'Telefon') {
                    contactInfo.phone = info.phone_number;
                } else if (info.phone_type === 'Fax') {
                    contactInfo.fax = info.phone_number;
                } else if (info.phone_type === 'E-Mail') {
                    contactInfo.email = info.phone_number;
                }
            });
        }
        
        return contactInfo;
    };
    
    const participants = extractParticipants();
    
    // Get contact information from organization
    const getOrgContactInfo = () => {
        const contactInfo = [];
        
        // Check for phone_infos array first
        if (org.phone_infos && Array.isArray(org.phone_infos)) {
            org.phone_infos.forEach(info => {
                if (info.phone_type === 'Telefon') {
                    contactInfo.push({ type: 'Phone', value: info.phone_number });
                } else if (info.phone_type === 'Fax') {
                    contactInfo.push({ type: 'Fax', value: info.phone_number });
                } else if (info.phone_type === 'E-Mail') {
                    contactInfo.push({ type: 'Email', value: info.phone_number });
                }
            });
        }
        
        // Fallback to direct properties if not found in phone_infos
        if (!contactInfo.some(info => info.type === 'Email') && org.email) {
            contactInfo.push({ type: 'Email', value: org.email });
        }
        
        if (!contactInfo.some(info => info.type === 'Phone') && (org.phone || org.telephone)) {
            contactInfo.push({ type: 'Phone', value: org.phone || org.telephone });
        }
        
        if (!contactInfo.some(info => info.type === 'Fax') && org.fax) {
            contactInfo.push({ type: 'Fax', value: org.fax });
        }
        
        if (org.website) {
            contactInfo.push({ type: 'Website', value: org.website });
        }
        
        return contactInfo;
    };
    
    const orgContactInfo = getOrgContactInfo();
    
    // Get the city from seat or addresses
    const getLocation = () => {
        if (org.seat && org.seat.city) {
            return `${org.seat.city}${org.seat.zip_code ? `, ${org.seat.zip_code}` : ''}`;
        } else if (org.addresses && org.addresses.length > 0) {
            const address = org.addresses[0];
            return `${address.city || ''}${address.zip_code ? `, ${address.zip_code}` : ''}`;
        }
        return 'Location unknown';
    };
    
    return (
        <div className={`result-card ${expanded ? 'expanded' : ''}`}>
            {/* Make entire header clickable with improved accessibility */}
            <div 
                className="result-header" 
                onClick={toggleExpand}
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        toggleExpand(e);
                    }
                }}
            >
                <h3>{typeof org.name === 'object' ? formatName(org.name) : org.name}</h3>
                <div className="result-meta">
                    <span className="legal-form">{org.legal_form}</span>
                    <span className={`status ${org.status === 'aktiv' ? 'active' : 'inactive'}`}>
                        {org.status === 'aktiv' ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div className="expand-icon" aria-hidden="true">
                    {expanded ? '−' : '+'}
                </div>
            </div>
            
            <div className="result-details" style={{ display: expanded ? 'block' : 'none' }}>
                <div className="detail-section">
                    <h4>Organization Details</h4>
                    <div className="detail-grid">
                        {org.register_number && (
                            <div className="detail-item">
                                <span className="detail-label">Registration Number:</span>
                                <span className="detail-value">{org.register_number}</span>
                            </div>
                        )}
                        
                        {org.register_type && (
                            <div className="detail-item">
                                <span className="detail-label">Register Type:</span>
                                <span className="detail-value">{org.register_type}</span>
                            </div>
                        )}
                        
                        {org.register_court && (
                            <div className="detail-item">
                                <span className="detail-label">Register Court:</span>
                                <span className="detail-value">{org.register_court}</span>
                            </div>
                        )}
                        
                        <div className="detail-item">
                            <span className="detail-label">Location:</span>
                            <span className="detail-value">{getLocation()}</span>
                        </div>
                        
                        {org.date_founded && (
                            <div className="detail-item">
                                <span className="detail-label">Founded On:</span>
                                <span className="detail-value">{formatDate(org.date_founded)}</span>
                            </div>
                        )}
                        
                        {org.jurisdiction && (
                            <div className="detail-item">
                                <span className="detail-label">Jurisdiction:</span>
                                <span className="detail-value">{org.jurisdiction}</span>
                            </div>
                        )}
                        
                        {org.registered_on && (
                            <div className="detail-item">
                                <span className="detail-label">Registered On:</span>
                                <span className="detail-value">{formatDate(org.registered_on)}</span>
                            </div>
                        )}
                        
                        {org.last_updated && (
                            <div className="detail-item">
                                <span className="detail-label">Last Updated:</span>
                                <span className="detail-value">{formatDate(org.last_updated)}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {orgContactInfo.length > 0 && (
                    <div className="detail-section">
                        <h4>Contact Information</h4>
                        <div className="contact-info-grid">
                            {orgContactInfo.map((contact, index) => (
                                <div key={index} className="contact-info-item">
                                    <span className="detail-label">{contact.type}:</span>
                                    {contact.type === 'Email' ? (
                                        <a href={`mailto:${contact.value}`} className="contact-link">{contact.value}</a>
                                    ) : contact.type === 'Website' ? (
                                        <a href={contact.value.startsWith('http') ? contact.value : `https://${contact.value}`} 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           className="contact-link">{contact.value}</a>
                                    ) : contact.type === 'Phone' ? (
                                        <a href={`tel:${contact.value}`} className="contact-link">{contact.value}</a>
                                    ) : (
                                        <span className="detail-value">{contact.value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {org.addresses && org.addresses.length > 0 && (
                    <div className="detail-section">
                        <h4>Address</h4>
                        <div className="address-display">
                            {org.addresses.map((address, index) => (
                                <div key={index} className="address-card">
                                    <div className="address-type">{address.address_type || 'Primary Address'}</div>
                                    <div className="address-line">
                                        {address.street} {address.house_number}
                                    </div>
                                    <div className="address-line">
                                        {address.zip_code} {address.city}
                                        {address.country_code ? `, ${address.country_code}` : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {org.description && (
                    <div className="detail-section">
                        <h4>Description</h4>
                        <p className="org-description">{org.description}</p>
                    </div>
                )}
                
                {org.capital && org.capital.length > 0 && (
                    <div className="detail-section">
                        <h4>Capital</h4>
                        <div className="capital-list">
                            {org.capital.map((capital, index) => (
                                <div key={index} className="capital-item">
                                    <span className="capital-amount">
                                        {capital.amount.toLocaleString()} {capital.currency}
                                    </span>
                                    {capital.details && <span className="capital-details">{capital.details}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {participants && participants.length > 0 && (
                    <div className="detail-section">
                        <h4>Participants</h4>
                        <div className="participants-list">
                            {participants.map((participant, index) => (
                                <div key={index} className="participant-card">
                                    <div className="participant-name">{participant.name}</div>
                                    
                                    {participant.roles && (
                                        <div className="participant-role">{participant.roles}</div>
                                    )}
                                    
                                    <div className="participant-details">
                                        {participant.birth_date && (
                                            <div className="participant-birth">
                                                <span className="detail-label">Birth Date:</span> {formatDate(participant.birth_date)}
                                            </div>
                                        )}
                                        
                                        {!participant.birth_date && participant.birth_year && (
                                            <div className="participant-birth">
                                                <span className="detail-label">Born:</span> {participant.birth_year}
                                            </div>
                                        )}
                                        
                                        {participant.city && (
                                            <div className="participant-city">
                                                <span className="detail-label">City:</span> {participant.city}
                                            </div>
                                        )}
                                        
                                        {/* Only display contact section if any contact information exists */}
                                        {(participant.email || participant.phone || participant.fax || participant.website) && (
                                            <div className="participant-contact-section">
                                                {participant.email && (
                                                    <div className="participant-contact">
                                                        <span className="detail-label">Email:</span>
                                                        <a href={`mailto:${participant.email}`} className="contact-link">{participant.email}</a>
                                                    </div>
                                                )}
                                                
                                                {participant.phone && (
                                                    <div className="participant-contact">
                                                        <span className="detail-label">Phone:</span>
                                                        <a href={`tel:${participant.phone}`} className="contact-link">{participant.phone}</a>
                                                    </div>
                                                )}
                                                
                                                {participant.fax && (
                                                    <div className="participant-contact">
                                                        <span className="detail-label">Fax:</span>
                                                        <span className="detail-value">{participant.fax}</span>
                                                    </div>
                                                )}
                                                
                                                {participant.website && (
                                                    <div className="participant-contact">
                                                        <span className="detail-label">Website:</span>
                                                        <a href={participant.website.startsWith('http') ? participant.website : `https://${participant.website}`} 
                                                           target="_blank" 
                                                           rel="noopener noreferrer"
                                                           className="contact-link">{participant.website}</a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="detail-actions">
                    <button 
                        className="btn btn-outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSave(org);
                        }}
                    >
                        Save Company
                    </button>
                    <button 
                        className="btn btn-outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(org);
                        }}
                    >
                        View Full Details
                    </button>
                </div>
            </div>
        </div>
    );
};

// Pagination component
const Pagination = ({ currentPage, totalResults, resultsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    
    return (
        <div className="pagination">
            <button 
                className="pagination-button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>
            
            <div className="pagination-info">
                Page {currentPage} of {totalPages}
            </div>
            
            <button 
                className="pagination-button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                Next
            </button>
        </div>
    );
};

const SearchResults = ({ results, loading, totalResults = 0, currentPage = 1, resultsPerPage = 10, onPageChange = () => {} }) => {
    if (loading && (!results || results.length === 0)) {
        return (
            <div className="search-results-loading">
                <div className="loading-spinner"></div>
                <p>Searching for organizations...</p>
            </div>
        );
    }
    
    if (!results) {
        return (
            <div className="no-results">
                <p>Error: No results data available.</p>
            </div>
        );
    }

    if (!Array.isArray(results)) {
        return (
            <div className="no-results">
                <p>Error: Invalid results format.</p>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="no-results">
                <p>No organizations found. Try adjusting your search criteria.</p>
            </div>
        );
    }
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };
    
    // Handle save company action
    const handleSaveCompany = (org) => {
        console.log('Save company:', org);
        alert(`Company "${typeof org.name === 'object' ? formatName(org.name) : org.name}" has been saved!`);
    };
    
    // Handle view full details action
    const handleViewFullDetails = (org) => {
        console.log('View full details for:', org);
        const orgName = formatName(org.name);
        const details = `
            Company: ${orgName}
            Legal Form: ${org.legal_form}
            Registration Number: ${org.register_number || 'N/A'}
            Status: ${org.status === 'aktiv' ? 'Active' : 'Inactive'}
            Location: ${org.seat?.city || (org.addresses && org.addresses[0]?.city) || 'N/A'}
            Founded: ${org.date_founded ? formatDate(org.date_founded) : 'N/A'}
            Participants: ${org.participations ? org.participations.length : 'None'}
            ${org.email ? `Email: ${org.email}` : ''}
            ${org.phone || org.telephone ? `Phone: ${org.phone || org.telephone}` : ''}
            ${org.website ? `Website: ${org.website}` : ''}
        `;
        alert(`Full Details:\n${details.trim()}`);
    };
    
    return (
        <div className="search-results-container">
            <div className="search-results-info">
                <p>
                    Showing {(currentPage - 1) * resultsPerPage + 1}-{Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
                </p>
            </div>
            
            <div className="search-results">
                {results.map((org, index) => (
                    <ResultCard 
                        key={`${org.id || index}-${currentPage}`}
                        org={org} 
                        formatDate={formatDate}
                        onSave={handleSaveCompany}
                        onViewDetails={handleViewFullDetails}
                    />
                ))}
            </div>
            
            {/* Always show pagination if we have results */}
            {results.length > 0 && (
                <Pagination 
                    currentPage={currentPage}
                    totalResults={totalResults}
                    resultsPerPage={resultsPerPage}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
};

export default SearchResults; 