import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [sentiment, setSentiment] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        fetchHistory();
    }, [isLoggedIn, navigate]);

    const fetchHistory = async () => {
        if (!user?.token) return;
        try {
            const response = await fetch(`http://localhost:8000/chat-history/${encodeURIComponent(user.email)}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
        }
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!input.trim() || !user?.token) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ text: input })
            });

            if (response.ok) {
                const data = await response.json();
                setSentiment(data.sentiment);
                setHistory(prev => [
                    {
                        text: input,
                        sentiment: data.sentiment,
                        timestamp: data.timestamp
                    },
                    ...prev
                ]);
                setInput('');
            } else {
                setError('Analysis failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during analysis.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isLoggedIn) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-8 gap-8">
            <div className="bg-white shadow-xl rounded-lg p-10 w-full max-w-2xl flex flex-col items-center">
                {/* Header */}
                <div className="w-full flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-blue-700">Sentiment Analyzer</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
                        {user?.role === 'ADMIN' && (
                            <button 
                                onClick={() => navigate('/admin')}
                                className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
                            >
                                Admin Dashboard
                            </button>
                        )}
                        <button 
                            onClick={handleLogout} 
                            className="text-sm bg-[#0cb765] hover:bg-[#0cb765]/90 text-white px-4 py-2 rounded transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Analysis Form */}
                <form onSubmit={handleAnalyze} className="flex flex-col gap-4 w-full">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Enter text to analyze..."
                        className="border border-gray-300 rounded px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                        disabled={loading}
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !input.trim()}
                        className="bg-[#0cb765] hover:bg-[#0cb765]/90 focus:ring-[#0cb765] text-white rounded px-3 py-2 font-semibold transition disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : 'Analyze Sentiment'}
                    </button>
                </form>

                {/* Sentiment Result */}
                {sentiment && (
                    <div className="text-lg mt-4">
                        <span className="font-semibold">Sentiment:</span>{' '}
                        <span className={
                            sentiment === "POSITIVE" ? "text-green-600" : 
                            sentiment === "NEGATIVE" ? "text-red-600" : 
                            "text-gray-700"
                        }>
                            {sentiment}
                        </span>
                    </div>
                )}

                {/* Error Message */}
                {error && <div className="text-red-500 text-sm mt-4">{error}</div>}

                {/* History Section */}
                <div className="w-full mt-10">
                    <h2 className="text-xl font-semibold mb-2 text-blue-700">History</h2>
                    <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {history.length === 0 && (
                            <li className="text-gray-500">No history yet.</li>
                        )}
                        {history.map((item, idx) => (
                            <li key={idx} className="border border-gray-200 rounded p-3 bg-gray-50">
                                <p className="truncate mb-1">{item.text}</p>
                                <div className="flex justify-between items-center text-xs">
                                    <span className={
                                        item.sentiment === "POSITIVE" ? "text-green-600 font-mono" : 
                                        item.sentiment === "NEGATIVE" ? "text-red-600 font-mono" : 
                                        "text-gray-700 font-mono"
                                    }>
                                        {item.sentiment}
                                    </span>
                                    <span className="text-gray-500">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;