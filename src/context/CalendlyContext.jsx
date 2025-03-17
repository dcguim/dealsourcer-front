import React, { createContext, useContext, useEffect, useState } from 'react';

const CalendlyContext = createContext();

export const CalendlyProvider = ({ children }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (!document.getElementById('calendly-script')) {
      const script = document.createElement('script');
      script.id = 'calendly-script';
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    } else if (window.Calendly) {
      setIsScriptLoaded(true);
    }
  }, []);

  const openCalendly = () => {
    if (window.Calendly && isScriptLoaded) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/dguim'
      });
    }
  };

  return (
    <CalendlyContext.Provider value={{ openCalendly, isScriptLoaded }}>
      {children}
    </CalendlyContext.Provider>
  );
};

export const useCalendly = () => {
  const context = useContext(CalendlyContext);
  if (!context) {
    throw new Error('useCalendly must be used within a CalendlyProvider');
  }
  return context;
}; 