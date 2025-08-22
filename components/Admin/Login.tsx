



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const AdminLogin: React.FC = () => {
    const { adminUsers, login, loggedInUser } = useAppContext();
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (loggedInUser) {
            navigate('/admin', { replace: true });
        }
    }, [loggedInUser, navigate]);

    useEffect(() => {
        // Pre-select the first user if available
        if (adminUsers.length > 0 && !selectedUserId) {
            setSelectedUserId(adminUsers[0].id);
        }
    }, [adminUsers, selectedUserId]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedUserId || !pin) {
            setError('Please select a user and enter your PIN.');
            return;
        }

        const user = login(selectedUserId, pin);

        if (!user) {
            setError('Invalid user or PIN. Please try again.');
            setPin(''); // Clear PIN field on error
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-gray-100 dark:bg-gray-800 p-10 rounded-2xl shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                        Admin Portal
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md space-y-4">
                        <div>
                            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select User</label>
                            <select
                                id="user-select"
                                name="user"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-gray-800 focus:border-gray-800 focus:z-10 sm:text-sm shadow-sm bg-white dark:bg-gray-700"
                                required
                            >
                                {adminUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName} {user.isMainAdmin ? '(Main Admin)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="pin-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN</label>
                            <input
                                id="pin-input"
                                name="pin"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-gray-800 focus:border-gray-800 focus:z-10 sm:text-sm shadow-sm bg-white dark:bg-gray-700"
                                placeholder="Enter 4-Digit PIN"
                                maxLength={4}
                                pattern="\d{4}"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-500 text-center pt-2">{error}</p>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                        >
                            Log In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;