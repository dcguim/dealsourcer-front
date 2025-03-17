import React from 'react';

const Features = () => {
  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Intelligent Deal Sourcing</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-driven platform transforms how private equity firms identify and evaluate potential acquisition targets in the German market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card p-8">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6">1</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Investment Thesis Translation</h3>
            <p className="text-gray-600">
              Explain your investment criteria to our AI in natural language and watch as it transforms your strategy into actionable search parameters.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card p-8">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6">2</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Financial Statement Analysis</h3>
            <p className="text-gray-600">
              Automatically extract, analyze, and interpret financial statements to identify companies matching your financial criteria.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card p-8">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6">3</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Pipeline Management</h3>
            <p className="text-gray-600">
              Track and prioritize potential targets throughout the acquisition funnel with intelligent scoring and status tracking.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
