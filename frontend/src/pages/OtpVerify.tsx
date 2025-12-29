import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OtpVerify: React.FC = () => {
  const { requiresOtp, otpTempToken, pendingEmail, verifyOtp, isAuthenticated, user } = useAuth();
  const [otp, setOtp] = useState('');
  const [isBackup, setIsBackup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have a valid session for OTP:
  // Either a temp token (legacy/unauthenticated flow) OR a partial auth session (token + mfa_enabled).

  if (!requiresOtp || (!otpTempToken && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">No OTP session</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Start from the login screen to verify your code.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(otp.trim(), isBackup ? 'backup' : 'otp');
      const from = (location.state as any)?.from || (user?.role === 'ADMIN' ? '/admin/dashboard' : '/');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid authentication code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow rounded-lg p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isBackup ? 'Enter Backup Code' : 'Enter 2FA Code'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {pendingEmail
              ? `Account: ${pendingEmail}`
              : `Enter the code from your ${isBackup ? 'saved list' : 'authenticator app'}.`
            }
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {isBackup ? 'Backup Code' : '6-digit code'}
            </label>
            <input
              type="text"
              inputMode={isBackup ? 'text' : 'numeric'}
              pattern={isBackup ? undefined : "[0-9]*"}
              maxLength={isBackup ? 20 : 6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-700 dark:text-white"
              placeholder={isBackup ? "Enter backup code" : "123456"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify and continue'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsBackup(!isBackup);
                setOtp('');
                setError('');
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isBackup ? 'Use Authenticator App' : 'I lost my device / Use Backup Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerify;
