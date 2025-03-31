import React, { useState, useEffect, useRef } from 'react';
import './BirthYearRangeSlider.css';

const BirthYearRangeSlider = ({ onChange, initialMinYear = 1950, initialMaxYear = 1970, disabled = false }) => {
    const [yearRange, setYearRange] = useState({
        minYear: initialMinYear,
        maxYear: initialMaxYear
    });
    
    const isActive = !disabled;
    const skipCallbacks = useRef(false);
    const isFirstRender = useRef(true);
    
    const minPossibleYear = 1900;
    const maxPossibleYear = 2020;
    const MAX_YEAR_DIFFERENCE = 20;
    const rangeSpan = maxPossibleYear - minPossibleYear;
    
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        
        if (skipCallbacks.current) {
            return;
        }
        
        if (onChange) {
            onChange({
                minYear: yearRange.minYear,
                maxYear: yearRange.maxYear,
                isActive: isActive
            });
        }
    }, [yearRange, isActive, onChange]);
    
    const handleMinYearChange = (e) => {
        if (!isActive) return;
        
        const newMinYear = parseInt(e.target.value, 10);
        
        if (newMinYear <= yearRange.maxYear) {
            const currentRange = yearRange.maxYear - newMinYear;
            
            if (currentRange <= MAX_YEAR_DIFFERENCE) {
                setYearRange(prev => ({ ...prev, minYear: newMinYear }));
            } else {
                const newMaxYear = newMinYear + MAX_YEAR_DIFFERENCE;
                const adjustedMaxYear = Math.min(newMaxYear, maxPossibleYear);
                setYearRange({
                    minYear: newMinYear,
                    maxYear: adjustedMaxYear
                });
            }
        }
    };

    const handleMaxYearChange = (e) => {
        if (!isActive) return;
        
        const newMaxYear = parseInt(e.target.value, 10);
        
        if (newMaxYear >= yearRange.minYear) {
            const currentRange = newMaxYear - yearRange.minYear;
            
            if (currentRange <= MAX_YEAR_DIFFERENCE) {
                setYearRange(prev => ({ ...prev, maxYear: newMaxYear }));
            } else {
                const newMinYear = newMaxYear - MAX_YEAR_DIFFERENCE;
                const adjustedMinYear = Math.max(newMinYear, minPossibleYear);
                setYearRange({
                    minYear: adjustedMinYear,
                    maxYear: newMaxYear
                });
            }
        }
    };

    const handleToggle = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (onChange) {
            onChange({
                ...yearRange,
                isActive: !isActive
            });
        }
    };

    const getSliderStyle = () => {
        const minPercent = ((yearRange.minYear - minPossibleYear) / rangeSpan) * 100;
        const maxPercent = ((yearRange.maxYear - minPossibleYear) / rangeSpan) * 100;
        return {
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`
        };
    };

    const generateYearTicks = () => {
        const ticks = [];
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
        <div className={`birth-year-range-slider ${!isActive ? 'slider-disabled' : ''}`}>
            <div className="slider-header">
                <button
                    type="button"
                    onClick={handleToggle}
                    className="toggle-button"
                >
                    {isActive ? 'Disable' : 'Enable'}
                </button>
                <span className="range-value">
                    {yearRange.minYear} - {yearRange.maxYear}
                </span>
            </div>
            
            <div className="slider-container">
                <div className="slider-track">
                    <div className="slider-background-track"></div>
                    <div className="slider-range-highlight" style={getSliderStyle()}></div>
                    <input
                        type="range"
                        min={minPossibleYear}
                        max={maxPossibleYear}
                        value={yearRange.minYear}
                        onChange={handleMinYearChange}
                        className="boundary-slider"
                        disabled={!isActive}
                    />
                    <input
                        type="range"
                        min={minPossibleYear}
                        max={maxPossibleYear}
                        value={yearRange.maxYear}
                        onChange={handleMaxYearChange}
                        className="boundary-slider"
                        disabled={!isActive}
                    />
                </div>
                <div className="year-ticks-container">
                    {generateYearTicks()}
                </div>
            </div>
        </div>
    );
};

export default BirthYearRangeSlider; 