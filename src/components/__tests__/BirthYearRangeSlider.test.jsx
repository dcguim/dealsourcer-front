import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BirthYearRangeSlider from '../BirthYearRangeSlider';

describe('BirthYearRangeSlider Component', () => {
  test('renders with default values', () => {
    render(<BirthYearRangeSlider />);
    
    // Check that both sliders are rendered
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
  });
  
  test('displays initial min and max years', () => {
    const initialMinYear = 1945;
    const initialMaxYear = 1995;
    
    render(
      <BirthYearRangeSlider 
        initialMinYear={initialMinYear} 
        initialMaxYear={initialMaxYear} 
      />
    );
    
    const rangeText = screen.getByText(`${initialMinYear} - ${initialMaxYear}`);
    expect(rangeText).toBeInTheDocument();
  });
  
  test('calls onChange when min year slider changes', () => {
    const handleChange = jest.fn();
    render(<BirthYearRangeSlider onChange={handleChange} initialMinYear={1950} initialMaxYear={2000} />);
    
    const minYearSlider = screen.getAllByRole('slider')[0];
    fireEvent.change(minYearSlider, { target: { value: '1960' } });
    
    expect(handleChange).toHaveBeenCalledWith({
      minYear: 1960,
      maxYear: 2000
    });
  });
  
  test('calls onChange when max year slider changes', () => {
    const handleChange = jest.fn();
    render(<BirthYearRangeSlider onChange={handleChange} initialMinYear={1950} initialMaxYear={2000} />);
    
    const maxYearSlider = screen.getAllByRole('slider')[1];
    fireEvent.change(maxYearSlider, { target: { value: '1990' } });
    
    expect(handleChange).toHaveBeenCalledWith({
      minYear: 1950,
      maxYear: 1990
    });
  });
  
  test('prevents min year from exceeding max year', () => {
    const handleChange = jest.fn();
    render(<BirthYearRangeSlider onChange={handleChange} initialMinYear={1950} initialMaxYear={1960} />);
    
    const minYearSlider = screen.getAllByRole('slider')[0];
    fireEvent.change(minYearSlider, { target: { value: '1970' } });
    
    // The change should be ignored
    expect(handleChange).not.toHaveBeenCalledWith({
      minYear: 1970,
      maxYear: 1960
    });
  });
  
  test('prevents max year from going below min year', () => {
    const handleChange = jest.fn();
    render(<BirthYearRangeSlider onChange={handleChange} initialMinYear={1950} initialMaxYear={1960} />);
    
    const maxYearSlider = screen.getAllByRole('slider')[1];
    fireEvent.change(maxYearSlider, { target: { value: '1940' } });
    
    // The change should be ignored
    expect(handleChange).not.toHaveBeenCalledWith({
      minYear: 1950,
      maxYear: 1940
    });
  });
}); 