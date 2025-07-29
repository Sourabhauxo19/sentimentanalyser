import React, { useEffect, useState } from 'react';
import { getLoginHistory } from '../api';
// import './LoginHistory.css';

const LoginHistoryPage = ({ username }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (username) {
            getLoginHistory(username).then(setHistory);
        }
    }, [username]);

    return (
        <div className="login-history-container">
            <h2>Login History for {username}</h2>
            <ul className="login-list">
                {history.map((item, i) => (
                    <li key={i}>{new Date(item.login_time).toLocaleString()}</li>
                ))}
            </ul>
        </div>
    );
};

export default LoginHistoryPage;
