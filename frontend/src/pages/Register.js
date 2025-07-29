import React, { useState } from 'react';
import RegisterForm from '../components/RegisterForm';

const Register = ({ onRegister }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState(''); // 'success' or 'error'

  const handleRegister = async (username, password) => {
    try {
      const result = await onRegister(username, password);

      if (result?.success) {
        setMessage(result.msg || 'Registration successful!');
        setType('success');
      } else {
        const msg = result?.msg || result?.detail || 'Registration failed';
        setMessage(msg);
        setType('error');
      }

      return result;
    } catch (err) {
      const errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.detail ||
        err?.message ||
        'An error occurred';

      setMessage(errorMsg);
      setType('error');
      return { success: false, msg: errorMsg };
    }
  };

  return (
    <RegisterForm
      onRegister={handleRegister}
      message={message}
      messageType={type}
    />
  );
};

export default Register;
