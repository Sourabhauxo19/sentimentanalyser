import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on app startup
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userEmail) {
      setUser({
        email: userEmail,
        role: userRole || 'USER',
        token: token
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          email: email,
          role: data.role || 'USER',
          token: data.access_token
        };
        
        setUser(userData);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', data.role || 'USER');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email, password) => {
    try {
      const params = new URLSearchParams();
      params.append('email', email);
      params.append('password', password);
      
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      if (response.ok) {
        // After successful signup, automatically login
        return await login(email, password);
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
  };

  const value = {
    user,
    isLoggedIn: !!user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 