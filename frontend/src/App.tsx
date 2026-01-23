import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import ConditionalLayout from './layouts/ConditionalLayout';
import Home from './pages/Home';
import AwarenessHub from './pages/AwarenessHub';
import Quiz from './pages/Quiz';
import Games from './pages/Games';
import Blog from './pages/Blog';
import Report from './pages/Report';
import SecurityScanner from './pages/SecurityScanner';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import OtpEnroll from './pages/OtpEnroll';
import OtpVerify from './pages/OtpVerify';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';
import LanguageSwitcher from './components/LanguageSwitcher';

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageSwitcher />
      <ThemeProvider attribute="class">
        <AuthProvider>
          <HashRouter>
            <Routes>
              {/* Conditional Layout Routes - Show sidebar when logged in, navbar only when logged out */}
              <Route element={<ConditionalLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/awareness-hub" element={<AwarenessHub />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/security-scanner" element={<SecurityScanner />} />
              </Route>

              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/login" element={<Login />} />
                {/* OTP pages are technically part of auth flow so kept public but they have internal state checks */}
                <Route path="/otp-enroll" element={<OtpEnroll />} />
                <Route path="/otp-verify" element={<OtpVerify />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/signup" element={<Signup />} />
              </Route>

              {/* Authenticated User Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/games" element={<Games />} />
                <Route path="/report" element={<Report />} />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <UserLayout />
                  </AdminRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                {/* Add more admin routes here as needed */}
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;
