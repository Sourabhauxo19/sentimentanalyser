import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <div className="home-container">
      <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <div className="home-content">
        <h1 className="home-title">💬 Sentiment Analyzer</h1>
        <p className="home-subtitle">Understand your thoughts in real time using AI-powered sentiment analysis.</p>
        <div className="link-group">
          <Link to="/login" className="home-button">Login</Link>
          <Link to="/register" className="home-button outline">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
