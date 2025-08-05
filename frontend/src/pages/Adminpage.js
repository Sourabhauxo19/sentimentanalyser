import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const USERS_PER_PAGE = 10;
const STATEMENTS_PER_PAGE = 10;

const Adminpage = () => {
    const { user, isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const [allUsersData, setAllUsersData] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [userPage, setUserPage] = useState(1);
    const [statementPage, setStatementPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (user?.role !== 'ADMIN') {
            navigate('/dashboard');
            return;
        }

        fetchAllUsersData();
    }, [isLoggedIn, user, navigate]);

    const fetchAllUsersData = async () => {
        if (!user?.token) return;
        
        try {
            const response = await fetch('http://localhost:8000/admin/all-users-sentiments', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setAllUsersData(data);
            } else if (response.status === 403) {
                setError('Admin access required');
            } else {
                setError('Failed to fetch admin data');
            }
        } catch (err) {
            setError('An error occurred while fetching admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (email) => {
        setSelectedUser({ email, statements: allUsersData[email] });
        setShowModal(true);
        setStatementPage(1);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userEntries = allUsersData ? Object.entries(allUsersData) : [];
    const totalUserPages = Math.ceil(userEntries.length / USERS_PER_PAGE);
    const paginatedUsers = userEntries.slice(
        (userPage - 1) * USERS_PER_PAGE,
        userPage * USERS_PER_PAGE
    );

    const statementEntries = selectedUser ? Object.entries(selectedUser.statements) : [];
    const totalStatementPages = Math.ceil(statementEntries.length / STATEMENTS_PER_PAGE);
    const paginatedStatements = statementEntries.slice(
        (statementPage - 1) * STATEMENTS_PER_PAGE,
        statementPage * STATEMENTS_PER_PAGE
    );

    if (!isLoggedIn || user?.role !== 'ADMIN') return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading admin data...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-8">
            <div className="bg-white shadow-xl rounded-lg p-10 w-full max-w-6xl">
                {/* Header */}
                <div className="w-full flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-blue-700">Admin Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Admin: {user?.email}</span>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                        >
                            Back to Dashboard
                        </button>
                        <button 
                            onClick={handleLogout} 
                            className="text-sm bg-[#0cb765] hover:bg-[#0cb765]/90 text-white px-4 py-2 rounded transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <h2 className="text-2xl font-semibold mb-6 text-gray-800">All Users Sentiment Data</h2>
                
                {allUsersData ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Number of Statements</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers.map(([email, statements]) => (
                                        <tr 
                                            key={email} 
                                            className="hover:bg-gray-50 cursor-pointer border-b border-gray-200"
                                            onClick={() => handleUserClick(email)}
                                        >
                                            <td className="border border-gray-300 px-4 py-2">{email}</td>
                                            <td className="border border-gray-300 px-4 py-2">{Object.keys(statements).length}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* User Pagination Controls */}
                        {totalUserPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-6">
                                <button
                                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                                    disabled={userPage === 1}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                                >
                                    Previous
                                </button>
                                <span className="text-gray-600">
                                    Page {userPage} of {totalUserPages}
                                </span>
                                <button
                                    onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                                    disabled={userPage === totalUserPages}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-gray-500 text-center py-8">No data available.</p>
                )}

                {/* Modal */}
                {showModal && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Statements for {selectedUser.email}</h3>
                                <button 
                                    onClick={closeModal}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 px-4 py-2 text-left">Statement</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Sentiment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedStatements.map(([statement, result], idx) => (
                                            <tr key={idx} className="border-b border-gray-200">
                                                <td className="border border-gray-300 px-4 py-2 max-w-md truncate">{statement}</td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <span className={
                                                        result === "POSITIVE" ? "text-green-600 font-semibold" : 
                                                        result === "NEGATIVE" ? "text-red-600 font-semibold" : 
                                                        "text-gray-600 font-semibold"
                                                    }>
                                                        {result}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Statement Pagination Controls */}
                            {totalStatementPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-6">
                                    <button
                                        onClick={() => setStatementPage((p) => Math.max(1, p - 1))}
                                        disabled={statementPage === 1}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-gray-600">
                                        Page {statementPage} of {totalStatementPages}
                                    </span>
                                    <button
                                        onClick={() => setStatementPage((p) => Math.min(totalStatementPages, p + 1))}
                                        disabled={statementPage === totalStatementPages}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Adminpage;