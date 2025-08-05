import React, { useEffect, useState } from 'react';
import { getLoginHistory } from '../api';
// import './LoginHistory.css';

const LoginHistoryPage = ({ email }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (email) {
            getLoginHistory(email).then(setHistory);
        }
    }, [email]);

    return (
        <div className="login-history-container">
            <h2>Login History for {email}</h2>
            <ul className="login-list">
                {history.map((item, i) => (
                    <li key={i}>{new Date(item.login_time).toLocaleString()}</li>
                ))}
            </ul>
        </div>
    );
};

export default LoginHistoryPage;
