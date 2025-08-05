import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4 text-[#0cb765]">💬 Sentiment Analyzer</h1>
        <p className="text-gray-600 mb-8">
          Understand your thoughts in real time using AI-powered sentiment analysis.
        </p>
        
        {isLoggedIn ? (
          <div className="space-y-4">
            <p className="text-green-600 font-medium">You are logged in!</p>
            <Link 
              to="/dashboard" 
              className="block w-full bg-[#0cb765] hover:bg-[#0cb765]/90 text-white rounded px-4 py-2 font-semibold transition"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <Link 
              to="/login" 
              className="block w-full bg-[#0cb765] hover:bg-[#0cb765]/90 text-white rounded px-4 py-2 font-semibold transition"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="block w-full border border-[#0cb765] text-[#0cb765] hover:bg-[#0cb765] hover:text-white rounded px-4 py-2 font-semibold transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
