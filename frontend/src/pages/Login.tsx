import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Lock, EyeOff, CheckCircle2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      const from = (location.state as any)?.from || '/';

      if (result.status === 'authenticated') {
        navigate(from);
      }

      if (result.status === 'requires_enrollment') {
        navigate('/otp-enroll', { state: { from } });
      }

      if (result.status === 'requires_otp') {
        navigate('/otp-verify', { state: { from } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-900">

      {/* LEFT / TOP: Platform Identity & Trust */}
      <div className="flex w-full lg:w-1/2 bg-gray-50 dark:bg-gray-800/50 p-8 lg:p-12 flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Awareness.io
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            A cybersecurity awareness and AI-powered incident analysis platform.
          </p>
        </div>

        <div className="space-y-6 mt-8 lg:mt-0">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <EyeOff className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Privacy-first</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  We detect sensitive data types without storing the actual content.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Secure authentication</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  Protected by industry-standard encryption and optional MFA.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">No content misuse</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  Your data is never used to train public models or shared with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block text-sm text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Awareness.io Platform. All rights reserved.
        </div>
      </div>

      {/* RIGHT / CENTER: Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to access reporting, analysis, and awareness tools.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                        Authentication Failed
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
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm"></div>
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Forgot your password?
                  </button>
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
                      Verifying credentials...
                    </div>
                  ) : (
                    'Sign in securely'
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
                    Protected by Awareness.io Analysis Engine
                  </span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm"
                >
                  Sign up
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <Lock className="w-3 h-3" />
              <span>Your credentials are encrypted. We never share your data.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
