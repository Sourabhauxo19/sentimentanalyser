import React from 'react';
import LoginForm from '../components/LoginForm';

const Login = ({ onLogin }) => (
    <div>
        <LoginForm onLogin={onLogin} />
    </div>
);

export default Login;