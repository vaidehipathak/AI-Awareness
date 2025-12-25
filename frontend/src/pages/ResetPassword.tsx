import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const ResetPassword: React.FC = () => {
    const { completePasswordReset } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const tokenParam = query.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setError('Invalid or missing reset token.');
        }
    }, [location.search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setMessage('');
        setError('');
        setLoading(true);

        try {
            const result = await completePasswordReset(token, newPassword, confirmPassword);
            setMessage(result.message);
            // Wait a bit then redirect
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-xl text-red-600 mb-4">Missing Reset Token</h2>
                    <Link to="/forgot-password" className="text-blue-500 hover:underline">
                        Request a new password reset
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Set New Password</h2>

                {message && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {!message && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Resetting...' : 'Set New Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
