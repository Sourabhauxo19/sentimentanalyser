import React, { useState, useEffect } from 'react';
import '../styles/Register.css';

const RegisterForm = ({ onRegister, message, messageType }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState('');
  const [localType, setLocalType] = useState('');

  useEffect(() => {
    if (message) {
      setLocalMessage(message);
      setLocalType(messageType === 'success' ? 'success' : 'error');
    }
  }, [message, messageType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalMessage('');
    setLocalType('');

    try {
      const result = await onRegister(username, password);

      if (result?.msg) {
        setLocalMessage(
          result.msg + (result.registered_at ? ` at ${result.registered_at}` : '')
        );
        setLocalType('success');
      } else if (result?.detail) {
        setLocalMessage(result.detail);
        setLocalType('error');
      } else {
        setLocalMessage('Registration successful!');
        setLocalType('success');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errMsg =
        err.response?.data?.detail || err.message || 'Registration failed';
      setLocalMessage(errMsg);
      setLocalType('error');
    }

    setLoading(false);
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Register</h2>

      <input
        className="form-input"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        className="form-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {localMessage && (
        <div className={`form-message ${localType === 'success' ? 'success' : 'error'}`}>
          {localMessage}
        </div>
      )}

      <button className="form-button" type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;
