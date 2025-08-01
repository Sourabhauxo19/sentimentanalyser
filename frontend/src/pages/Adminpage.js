import React from 'react';
import { useLocation } from 'react-router-dom';

const Adminpage = () => {
    const location = useLocation();
    const allUsersData = location.state?.allUsersData;

    return (
        <div>
            <h2>All Users Sentiment Data</h2>
            {allUsersData ? (
                Object.entries(allUsersData).map(([username, statements]) => (
                    <div key={username} style={{ marginBottom: '2rem' }}>
                        <h3>{username}</h3>
                        <ul>
                            {Object.entries(statements).map(([statement, result], idx) => (
                                <li key={idx}>
                                    <b>{statement}</b>: <span>{result}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>No data available.</p>
            )}
        </div>
    );
};

export default Adminpage;