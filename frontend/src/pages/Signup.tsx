import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Lock, EyeOff, CheckCircle2 } from 'lucide-react';

const Signup: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            await signup(email, password, confirmPassword);
            setSuccess(true);
            // Redirect to login after short delay or immediately? 
            // Requirement: "Show success message", "Redirect to /login"
            // I'll show success state briefly then redirect.
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Created!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Your account has been successfully created. You will be redirected to the login page shortly.
                    </p>
                    <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-white dark:bg-gray-900">

            {/* LEFT / TOP: Platform Identity & Trust (Reused from Login) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-50 dark:bg-gray-800/50 p-12 flex-col justify-between border-r border-gray-200 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        AI AwareX
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        A cybersecurity awareness and AI-powered incident analysis platform.
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <EyeOff className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Privacy-First Analysis</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                                    We detect sensitive data types without storing the actual content. Your PII never leaves the secure analysis pipeline.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Secure Authentication</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                                    Protected by industry-standard encryption and optional multi-factor authentication (MFA).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Trusted by Professionals</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                                    Designed for compliance, auditability, and reliable incident reporting.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-gray-400 dark:text-gray-500">
                    © {new Date().getFullYear()} AI AwareX Platform. All rights reserved.
                </div>
            </div>

            {/* RIGHT / CENTER: Signup Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Create an account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Create an account to access reporting, analysis, and awareness tools.
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                                                Registration Failed
                                            </h3>
                                            <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                                                <p>{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email address
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Confirm Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating account...
                                        </div>
                                    ) : (
                                        'Create account'
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                    Sign in instead
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <Lock className="w-3 h-3" />
                            <span>Credentials encrypted. We ensure strict data isolation.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
