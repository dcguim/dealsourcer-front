import React, { useEffect } from 'react';

const HowItWorks = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-16 text-center">How Deal Sorcerer Works</h2>
        
        <div className="relative">
          {/* Process Steps */}
          <div className="flex flex-col md:flex-row justify-between mb-8 relative">
            {/* Line connecting steps */}
            <div className="hidden md:block absolute h-0.5 bg-gray-300 top-8 left-0 right-0 z-0"></div>
            
            {/* Step 1 */}
            <div className="relative z-10 md:w-1/4 mb-8 md:mb-0 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Define Investment Thesis</h3>
              <p className="text-gray-600 px-4">Explain your criteria, industry focus, and financial requirements to the AI.</p>
            </div>
            
            {/* Step 2 */}
            <div className="relative z-10 md:w-1/4 mb-8 md:mb-0 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2">AI Target Discovery</h3>
              <p className="text-gray-600 px-4">Our platform identifies and ranks potential targets based on your specific criteria.</p>
            </div>
            
            {/* Step 3 */}
            <div className="relative z-10 md:w-1/4 mb-8 md:mb-0 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Financial Analysis</h3>
              <p className="text-gray-600 px-4">Automated assessment of financial statements and performance metrics.</p>
            </div>
            
            {/* Step 4 */}
            <div className="relative z-10 md:w-1/4 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Pipeline Management</h3>
              <p className="text-gray-600 px-4">Track progress and prioritize targets through your acquisition funnel.</p>
            </div>
          </div>
          
          {/* Calendly Inline Widget */}
          <div className="mt-16">
            <div 
              className="calendly-inline-widget" 
              data-url="https://calendly.com/dguim/30min"
              style={{ minWidth: '320px', height: '700px' }} 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
