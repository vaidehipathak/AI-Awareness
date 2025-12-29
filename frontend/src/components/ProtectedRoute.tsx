import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { isAuthenticated, user, loading, isFullyAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // 1. Basic Auth Check
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. MFA Enrollment Check
  // If user is authenticated but has NOT enabled MFA yet, force enrollment.
  if (user && !user.mfa_enabled) {
    return <Navigate to="/otp-enroll" state={{ from: location }} replace />;
  }

  // 3. MFA Verification  // 2. MFA Check
  // If user is authenticated but MFA is not enabled (Mandatory for ALL),
  // redirect to Enrollment
  if (user && !user.mfa_enabled) {
    return <Navigate to="/otp-enroll" state={{ from: location }} replace />;
  }

  // If user is authenticated, MFA enabled, but not verified in this session
  if (user?.mfa_enabled && !user?.mfa_verified) {
    return <Navigate to="/otp-verify" state={{ from: location }} replace />;
  }

  // 3. Role Check
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">403</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Admin access required
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
