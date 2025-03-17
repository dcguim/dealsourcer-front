import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#3b3992] text-white py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <h2 className="text-2xl font-bold mb-4">Deal Sourcer</h2>
            <p className="text-white/80 max-w-md">
              AI-powered deal sourcing platform designed specifically for private equity firms operating in the German market.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Team</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/60">
          <p>&copy; {new Date().getFullYear()} Deal Sourcer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
