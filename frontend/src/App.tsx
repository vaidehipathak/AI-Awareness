import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import Home from './pages/Home';
import AwarenessHub from './pages/AwarenessHub';
import Quiz from './pages/Quiz';
import Games from './pages/Games';
import Blog from './pages/Blog';
import Report from './pages/Report';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import OtpEnroll from './pages/OtpEnroll';
import OtpVerify from './pages/OtpVerify';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';

const App: React.FC = () => {
  return (
    <ThemeProvider attribute="class">
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/awareness-hub" element={<AwarenessHub />} />
              <Route path="/blog" element={<Blog />} />
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
              <Route path="/dashboard" element={<Navigate to="/" replace />} /> {/* Placeholder if no user dashboard exists yet, or reuse Home? or maybe Report is the main user action? Let's assume Home is fine or no specific dashboard page was provided. The requirements listed "User dashboard" but I don't see a Dashboard.tsx. I'll point to Home or Report? Actually requirements said "User dashboard", maybe it meant the "Home" or "Report"? I will map /dashboard to Home for now or checking if there is a UserDashboard. I don't see one in file list. I will map /quiz, /games, /report here. */}
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
  );
};

export default App;
