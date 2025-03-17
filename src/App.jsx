import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HeroThreeJS from './components/HeroThreeJS';
import Features from './components/Features';
import Benefits from './components/Benefits';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Navbar />
      <HeroThreeJS />
      <Features />
      <Benefits />
      <HowItWorks />
      <Footer />
    </div>
  );
}

export default App; 