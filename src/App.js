import React from 'react';
import './App.css';
import DRDetector from './components/DRDetector';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>DR Web</h1>
        <p>Diabetic Retinopathy Detection System</p>
      </header>
      <main>
        <DRDetector />
      </main>
      <footer>
        <p>&copy; 2025 Aryan Kashyap Naveen - MIT License</p>
      </footer>
    </div>
  );
}

export default App;