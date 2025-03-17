import React from 'react';

const Benefits = () => {
  return (
    <section id="benefits" className="py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Private Equity Firms Choose Deal Sorcerer</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-6 h-6 bg-gray-800 rounded-full flex-shrink-0 mt-1 mr-3"></div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">80% Reduction in Initial Screening Time</h3>
                  <p className="text-gray-600">Focus your team's efforts on high-potential targets, not manual database searches.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-gray-800 rounded-full flex-shrink-0 mt-1 mr-3"></div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">German Market Expertise</h3>
                  <p className="text-gray-600">Specialized in understanding the nuances of Mittelstand companies and German financial reporting.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-gray-800 rounded-full flex-shrink-0 mt-1 mr-3"></div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">3x More Quality Targets</h3>
                  <p className="text-gray-600">Discover hidden gems that match your investment thesis through AI-powered analysis.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="md:w-1/2">
            <div className="bg-gray-100 p-8 rounded-lg">
              <blockquote className="text-xl italic text-gray-700 mb-6">
                "Deal Sourcer transformed our acquisition strategy. We identified three perfect-fit targets in our first month — companies we would have overlooked using traditional methods."
              </blockquote>
              <div className="flex items-center">
                <img 
                  src="/schneider.png" 
                  alt="Michael Schneider"
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <p className="font-bold text-gray-900">Michael Schneider</p>
                  <p className="text-gray-600">Managing Director, Munich Capital Partners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
