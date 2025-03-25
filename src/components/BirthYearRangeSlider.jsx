import React, { useState, useEffect, useRef } from 'react';
import './BirthYearRangeSlider.css';

const BirthYearRangeSlider = ({ onChange, initialMinYear = 1940, initialMaxYear = 2000 }) => {
    const [yearRange, setYearRange] = useState({
        minYear: initialMinYear,
        maxYear: initialMaxYear
    });
    const [isActive, setIsActive] = useState(true);
    
    // Skip all callbacks
    const skipCallbacks = useRef(false);
    
    // Track if this is the first render
    const isFirstRender = useRef(true);
    
    // Min/max year constants
    const minPossibleYear = 1900;
    const maxPossibleYear = 2020;
    const rangeSpan = maxPossibleYear - minPossibleYear;
    
    /**
     * Only notify parent when year range sliders move - NEVER for toggle status
     */
    useEffect(() => {
        // Skip entirely on first render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        
        // NEVER notify if we're skipping callbacks
        if (skipCallbacks.current) {
            return;
        }
        
        // ONLY notify about slider movements - never about active state
        if (onChange) {
            onChange(yearRange);
        }
    }, [yearRange, onChange]);
    
    // Simplified year change handlers that do nothing when inactive
    const handleMinYearChange = (e) => {
        if (!isActive) return;
        const newMinYear = parseInt(e.target.value, 10);
        if (newMinYear <= yearRange.maxYear) {
            setYearRange({ ...yearRange, minYear: newMinYear });
        }
    };

    const handleMaxYearChange = (e) => {
        if (!isActive) return;
        const newMaxYear = parseInt(e.target.value, 10);
        if (newMaxYear >= yearRange.minYear) {
            setYearRange({ ...yearRange, maxYear: newMaxYear });
        }
    };

    // STANDALONE TOGGLE FUNCTION that does not use form elements
    const standaloneToggle = (e) => {
        // Prevent any possible form submission or event bubbling
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Block any notifications
        skipCallbacks.current = true;
        
        // Toggle the visual state
        setIsActive(!isActive);
        
        // Unblock after a delay
        setTimeout(() => {
            skipCallbacks.current = false;
        }, 500);
    };

    // Calculate range highlight for the slider
    const getHighlightStyle = () => {
        const minPercent = ((yearRange.minYear - minPossibleYear) / rangeSpan) * 100;
        const maxPercent = ((yearRange.maxYear - minPossibleYear) / rangeSpan) * 100;
        return {
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`
        };
    };

    // Generate year ticks with 10-year increments
    const generateYearTicks = () => {
        const ticks = [];
        // Start at 1900 and go up by 10 years
        for (let year = minPossibleYear; year <= maxPossibleYear; year += 10) {
            const percent = ((year - minPossibleYear) / rangeSpan) * 100;
            ticks.push(
                <div 
                    key={year} 
                    className="year-tick" 
                    style={{ left: `${percent}%` }}
                >
                    <div className="tick-line"></div>
                    <span className="tick-label">{year}</span>
                </div>
            );
        }
        return ticks;
    };

    return (
        <div className={isActive ? "birth-year-range-slider" : "birth-year-range-slider slider-disabled"} style={{ 
            padding: '10px 12px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            marginBottom: '10px'
        }}>
            <div className="slider-wrapper" style={{ width: '100%' }}>
                {/* Range info and toggle button in one row */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '12px'
                }}>
                    <span className="range-value" style={{ 
                        fontWeight: '400', 
                        color: '#666',
                        fontSize: '13px',
                        paddingLeft: '8px'
                    }}>
                        {yearRange.minYear} - {yearRange.maxYear}
                    </span>
                    <button
                        type="button"
                        onClick={standaloneToggle}
                        className="btn btn-primary"
                        style={{ 
                            fontSize: '12px', 
                            padding: '4px 8px',
                            lineHeight: '1.2',
                            marginRight: '8px'
                        }}
                    >
                        {isActive ? "Disable" : "Enable"}
                    </button>
                </div>
                
                <div className="slider-container" style={{ padding: '0 8px' }}>
                    <div className="slider-track">
                        {/* Background track */}
                        <div className="slider-background-track"></div>
                        
                        {/* Range highlight */}
                        <div 
                            className="slider-range-highlight"
                            style={getHighlightStyle()}
                        ></div>
                        
                        {/* Sliders */}
                        <input
                            type="range"
                            value={yearRange.minYear}
                            onChange={handleMinYearChange}
                            min={minPossibleYear}
                            max={maxPossibleYear}
                            disabled={!isActive}
                            className="boundary-slider min-slider"
                            aria-label="Minimum birth year"
                        />
                        
                        <input
                            type="range"
                            value={yearRange.maxYear}
                            onChange={handleMaxYearChange}
                            min={minPossibleYear}
                            max={maxPossibleYear}
                            disabled={!isActive}
                            className="boundary-slider max-slider"
                            aria-label="Maximum birth year"
                        />
                    </div>
                    
                    {/* Year tickers with 10-year increments */}
                    <div className="year-tickers" style={{ marginTop: '2px', paddingBottom: '5px' }}>
                        {generateYearTicks()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BirthYearRangeSlider; 