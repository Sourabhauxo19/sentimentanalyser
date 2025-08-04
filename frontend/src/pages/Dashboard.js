import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SentimentForm from '../components/SentimentForm';
import { getLoginHistory, getSentimentEntries, getAllUsersSentiments } from '../api';
import '../styles/Dashboard.css';

const Dashboard = ({ username, token, role, onLogout, onAnalyze }) => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [highlightedResult, setHighlightedResult] = useState(null);
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);

  useEffect(() => {
    if (username) {
      getLoginHistory(username).then(setLoginHistory);
      getSentimentEntries(username).then(setChatHistory);
    }
  }, [username]);
  
  const navigate = useNavigate();

  const handleAnalyze = async (text) => {
    const result = await onAnalyze(text);
    if (result && result.sentiment) {
      const timestamp = new Date().toLocaleString();
      const newEntry = {
        sentiment: result.sentiment,
        text,
        timestamp,
      };

      setHighlightedResult(newEntry);

      setTimeout(() => {
        setHighlightedResult(null);
        setChatHistory((prev) => [newEntry, ...prev]);
      }, 3000);
    }
  };

  const handleViewAllUsers = async () => {
    try {
      const data = await getAllUsersSentiments(token);
      navigate('/allusers', { state: { allUsersData: data } });
    } catch (err) {
      alert('Failed to fetch users data');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {username}</h2>
        <button className="logout-button" onClick={onLogout}>Logout</button>
      </div>
      {role === 'ADMIN' && (
        <button className="admin-button" onClick={handleViewAllUsers}>
          View All Users
        </button>
      )}
      <SentimentForm onAnalyze={handleAnalyze} />

      {highlightedResult && (
        <div className="temp-result">
          <strong>{highlightedResult.sentiment}</strong>: {highlightedResult.text}
        </div>
      )}

      <div className="section">
        <h3
          className="accordion-header"
          onClick={() => setShowLoginHistory((prev) => !prev)}
          style={{ cursor: 'pointer' }}
        >
          Login History {showLoginHistory ? '▲' : '▼'}
        </h3>
        {showLoginHistory && (
          <ul className="history-list">
            {loginHistory.map((item, i) => (
              <li key={i}>{item.login_time}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="section">
        <h3
          className="accordion-header"
          onClick={() => setShowChatHistory((prev) => !prev)}
          style={{ cursor: 'pointer' }}
        >
          Chat History {showChatHistory ? '▲' : '▼'}
        </h3>
        {showChatHistory && (
          <ul className="history-list">
            {chatHistory.map((item, i) => (
              <li key={i}>
                <b>{item.sentiment}</b>: {item.text} <i>({item.timestamp})</i>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;