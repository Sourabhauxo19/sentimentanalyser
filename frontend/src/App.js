import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Adminpage from './pages/Adminpage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, loading } = useAuth();
    
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { isLoggedIn, loading, user } = useAuth();
    
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    
    if (user?.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const { isLoggedIn, loading } = useAuth();
    
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    return isLoggedIn ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <AdminRoute>
                        <Adminpage />
                    </AdminRoute>
                } />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;