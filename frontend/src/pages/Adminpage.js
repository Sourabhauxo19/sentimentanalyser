import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const USERS_PER_PAGE = 10;
const STATEMENTS_PER_PAGE = 10;

const Adminpage = () => {
    const location = useLocation();
    const allUsersData = location.state?.allUsersData;
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [userPage, setUserPage] = useState(1);
    const [statementPage, setStatementPage] = useState(1);

    const userEntries = allUsersData ? Object.entries(allUsersData) : [];
    const totalUserPages = Math.ceil(userEntries.length / USERS_PER_PAGE);

    const handleUserClick = (username) => {
        setSelectedUser({ username, statements: allUsersData[username] });
        setShowModal(true);
        setStatementPage(1); // Reset statement page on new user
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    // Pagination for users
    const paginatedUsers = userEntries.slice(
        (userPage - 1) * USERS_PER_PAGE,
        userPage * USERS_PER_PAGE
    );

    // Pagination for statements in modal
    const statementEntries = selectedUser ? Object.entries(selectedUser.statements) : [];
    const totalStatementPages = Math.ceil(statementEntries.length / STATEMENTS_PER_PAGE);
    const paginatedStatements = statementEntries.slice(
        (statementPage - 1) * STATEMENTS_PER_PAGE,
        statementPage * STATEMENTS_PER_PAGE
    );

    return (
        <div>
            <h2>All Users Sentiment Data</h2>
            {allUsersData ? (
                <>
                    <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Number of Statements</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map(([username, statements]) => (
                                <tr key={username} style={{ cursor: 'pointer' }} onClick={() => handleUserClick(username)}>
                                    <td>{username}</td>
                                    <td>{Object.keys(statements).length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* User Pagination Controls */}
                    <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                        <button
                            onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                            disabled={userPage === 1}
                        >Prev</button>
                        <span style={{ margin: '0 1rem' }}>
                            Page {userPage} of {totalUserPages}
                        </span>
                        <button
                            onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                            disabled={userPage === totalUserPages}
                        >Next</button>
                    </div>
                </>
            ) : (
                <p>No data available.</p>
            )}

            {/* Modal */}
            {showModal && selectedUser && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff',
                        padding: '2rem',
                        borderRadius: '12px',
                        minWidth: '1000px',
                        maxWidth: '80vw',
                        minHeight: '400px',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h3>Statements for {selectedUser.username}</h3>
                        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Statement</th>
                                    <th>Sentiment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedStatements.map(([statement, result], idx) => (
                                    <tr key={idx}>
                                        <td>{statement}</td>
                                        <td>{result}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Statement Pagination Controls */}
                        <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                            <button
                                onClick={() => setStatementPage((p) => Math.max(1, p - 1))}
                                disabled={statementPage === 1}
                            >Prev</button>
                            <span style={{ margin: '0 1rem' }}>
                                Page {statementPage} of {totalStatementPages}
                            </span>
                            <button
                                onClick={() => setStatementPage((p) => Math.min(totalStatementPages, p + 1))}
                                disabled={statementPage === totalStatementPages}
                            >Next</button>
                        </div>
                        <button style={{ marginTop: '1rem' }} onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Adminpage;