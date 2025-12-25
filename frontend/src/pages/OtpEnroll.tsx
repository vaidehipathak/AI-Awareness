import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OtpEnroll: React.FC = () => {
  const { pendingEmail, pendingUserId, requiresEnrollment, enroll2FA, confirmEnrollment } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [deviceId, setDeviceId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'credentials' | 'verify'>('credentials');

  if (!requiresEnrollment || !pendingUserId || !pendingEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">No enrollment session</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Start from the login screen to enroll 2FA.</p>
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

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await enroll2FA(password);
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setBackupCodes(result.backupCodes);
      setDeviceId(result.deviceId);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start 2FA enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId) {
      setError('Missing device information. Please start enrollment again.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await confirmEnrollment(deviceId, otpCode.trim());
      const from = (location.state as any)?.from || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid authentication code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 shadow rounded-lg p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Set up 2FA</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Admin accounts require time-based one-time passwords. Log in with your password, scan the QR code, then
            enter the 6-digit code from your authenticator app.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {step === 'credentials' && (
          <form className="space-y-4" onSubmit={handleEnroll}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
              <input
                disabled
                value={pendingEmail}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-700 dark:text-white"
                placeholder="Enter your admin password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Starting enrollment...' : 'Generate QR code'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">Scan this QR code</p>
              {qrCode ? (
                <div
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4"
                  dangerouslySetInnerHTML={{ __html: qrCode }}
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300">QR code unavailable</p>
              )}
            </div>



            {backupCodes.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-4 border border-yellow-200 dark:border-yellow-700">
                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-100 mb-2">
                  SAVE THESE BACKUP CODES
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, idx) => (
                    <code key={idx} className="text-xs bg-white dark:bg-gray-800 p-1 rounded border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-center select-all">
                      {code}
                    </code>
                  ))}
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                  If you lose your device, these codes are the ONLY way to access your account.
                </p>
              </div>
            )}

            {secret && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">Manual entry code</p>
                <code className="text-sm text-gray-900 dark:text-white">{secret}</code>
              </div>
            )}

            <form className="space-y-3" onSubmit={handleConfirm}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Enter the 6-digit code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-700 dark:text-white"
                placeholder="123456"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Confirm and finish'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtpEnroll;
