import React, { useState } from 'react';
// import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginHistory from './pages/LoginHistory';
import Dashboard from './pages/Dashboard';
import { loginUser, registerUser, analyzeSentiment } from './api';
import Adminpage from './pages/Adminpage';

function App() {
    const [user, setUser] = useState({ username: '', role: '', token: '' });

    const handleLogin = async (username, password) => {
        const res = await loginUser(username, password);
        console.log(res);
        if (res.access_token) {
            setUser({ username, role: res.role, token: res.access_token });
            localStorage.setItem('token', res.access_token);
            localStorage.setItem('role', res.role);
        }
        return res;
    };

    const handleRegister = async (username, password) => {
        return registerUser(username, password);
    };

    const handleLogout = () => {
        setUser({ username: '', role: '', token: '' });
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
                        role={user.role}
                        onLogout={handleLogout}
                        onAnalyze={handleAnalyze}
                    />
                } />
                <Route path="*" element={
                    <Dashboard
                        username={user.username}
                        token={user.token}
                        role={user.role}
                        onLogout={handleLogout}
                        onAnalyze={handleAnalyze}
                    />
                } />
                <Route path="/allusers" element={
                    <Adminpage />
                } />
            </Routes>
        </Router>
    );
}

export default App;