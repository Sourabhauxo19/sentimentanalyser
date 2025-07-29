import React, { useState } from 'react';
// import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginHistory from './pages/LoginHistory';
import Dashboard from './pages/Dashboard';
import { loginUser, registerUser, analyzeSentiment } from './api';

function App() {
    const [user, setUser] = useState({ username: '', token: '' });

    const handleLogin = async (username, password) => {
        const res = await loginUser(username, password);
        if (res.access_token) {
            setUser({ username, token: res.access_token });
            localStorage.setItem('token', res.access_token);
        }
        return res;
    };

    const handleRegister = async (username, password) => {
        return registerUser(username, password);
    };

    const handleLogout = () => {
        setUser({ username: '', token: '' });
        localStorage.removeItem('token');
    };

    const handleAnalyze = async (text) => {
        return analyzeSentiment(text, user.token);
    };

    if (!user.token) {
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/register" element={<Register onRegister={handleRegister} />} />
                    {/* <Route path="/login-history" element={<LoginHistory username={username} />} /> */}
                </Routes>
            </Router>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/dashboard" element={
                    <Dashboard
                        username={user.username}
                        token={user.token}
                        onLogout={handleLogout}
                        onAnalyze={handleAnalyze}
                    />
                } />
                <Route path="*" element={
                    <Dashboard
                        username={user.username}
                        token={user.token}
                        onLogout={handleLogout}
                        onAnalyze={handleAnalyze}
                    />
                } />
            </Routes>
        </Router>
    );
}

export default App;