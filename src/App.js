// src/App.js
import React from 'react';
import './App.css'; // Make sure this CSS file is imported
import DRDetector from './components/DRDetector'; // Ensure path is correct

function App() {
  return (
    // --- Main App Container ---
    // REMOVED the inline style for background here
    // Added overflow-hidden to contain the blurred edges if scaled
    <div className="App min-h-screen flex flex-col items-center justify-center p-4 relative w-full overflow-hidden">

      {/* --- Optional Overlay for Legibility --- */}
      {/* z-0 ensures it's above the ::before pseudo-element (which will have z-index: -1) */}
      {/* <div className="absolute inset-0 bg-black/30 z-0"></div> */}

      {/* --- Main Content Area --- */}
      {/* z-10 ensures it's above the background and overlay */}
      <main className="w-full max-w-6xl relative z-10 text-center flex justify-center items-center">
        <DRDetector />
      </main>

      {/* Optional Footer */}
      {/* Uncomment if needed */}
      {/*
      <footer className="text-center text-xs text-gray-200 mt-4 relative z-10">
        <p>© 2025 Aryan Kashyap & Deepak C Nayak - Project</p>
      </footer>
      */}
    </div>
  );
}

export default App;