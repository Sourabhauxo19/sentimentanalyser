import axios from 'axios';
const API_URL = 'http://localhost:8000';

export const registerUser = async (email, password) => {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    const response = await axios.post(`${API_URL}/register`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data; 
};

export const loginUser = async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);  // OAuth2 expects 'username' field
    params.append('password', password);
    const response = await axios.post(`${API_URL}/login`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
};

export const loginUserJson = async (email, password) => {
    const response = await axios.post(`${API_URL}/login-json`, { email, password });
    return response.data;
};

export const analyzeSentiment = async (text, token) => {
    const response = await axios.post(`${API_URL}/analyze`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getLoginHistory = async (email) => {
    const response = await axios.get(`${API_URL}/login-history/${email}`);
    return response.data;
};

export const getSentimentEntries = async (email) => {
    const response = await axios.get(`${API_URL}/chat-history/${email}`);
    return response.data;
};

export const getAllUsersSentiments = async (token) => {
  const response = await axios.get(`${API_URL}/admin/all-users-sentiments`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

