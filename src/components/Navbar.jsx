import React from 'react';

const Navbar = () => {
  const scrollToCalendar = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">Deal Sourcer</h1>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
          <a href="#benefits" className="text-gray-600 hover:text-gray-900 font-medium">Benefits</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">How It Works</a>
        </div>
        <button 
          onClick={scrollToCalendar}
          className="bg-[#3b3992] hover:bg-[#3b3992]/80 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Request Demo
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
