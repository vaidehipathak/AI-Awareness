import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
}

type LoginResult =
  | { status: 'authenticated' }
  | { status: 'requires_enrollment'; userId: number; email: string }
  | { status: 'requires_otp'; tempToken: string; email: string };

interface Pending2FAState {
  stage: 'enroll' | 'verify' | null;
  userId: number | null;
  email: string | null;
  tempToken: string | null;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  requiresEnrollment: boolean;
  requiresOtp: boolean;
  pendingEmail: string | null;
  pendingUserId: number | null;
  otpTempToken: string | null;
  enroll2FA: (password: string) => Promise<{ qrCode: string; secret: string; deviceId: number; backupCodes: string[] }>;
  confirmEnrollment: (deviceId: number, token: string) => Promise<void>;
  verifyOtp: (token: string, type?: 'otp' | 'backup') => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ message: string }>;
  completePasswordReset: (token: string, newPassword: string, confirmPassword: string) => Promise<{ message: string }>;
  signup: (email: string, password: string, passwordConfirm: string) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ... (existing state) ...
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending2FA, setPending2FA] = useState<Pending2FAState>({
    stage: null,
    userId: null,
    email: null,
    tempToken: null,
  });

  const API_BASE_URL = "http://localhost:9000";

  const persistPending2FA = (state: Pending2FAState) => {
    setPending2FA(state);
    if (state.stage) {
      sessionStorage.setItem('otp_pending', JSON.stringify(state));
    } else {
      sessionStorage.removeItem('otp_pending');
    }
  };

  const setSessionFromTokens = (data: {
    access: string;
    refresh?: string;
    role?: 'ADMIN' | 'USER';
    email?: string;
  }) => {
    const accessToken = data.access;
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1] || ''));
      const derivedEmail = data.email || payload.email || '';
      const derivedRole = (data.role as 'ADMIN' | 'USER') || payload.role || 'USER';
      const derivedId = payload.user_id || payload.id;
      const derivedUsername = payload.username || (derivedEmail ? derivedEmail.split('@')[0] : '');

      const userData: User = {
        id: derivedId,
        email: derivedEmail,
        username: derivedUsername,
        role: derivedRole,
      };

      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      if (data.refresh) {
        localStorage.setItem('auth_refresh', data.refresh);
      }

      setToken(accessToken);
      setUser(userData);
    } catch (err) {
      console.error('Failed to decode access token', err);
      throw new Error('Unable to decode access token');
    }
  };

  // ... (useEffect same as before, assume it's there or just update around it if needed, but replace_file_content needs exact context. I'll stick to replacing methods if possible, or large chunk.)
  // Actually, I'll just replace the methods to be safer and not miss context.

  // ... (safeFetch same) ...
  const safeFetch = async (endpoint: string, options: RequestInit) => {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${contentType || 'unknown content type'} instead of JSON`);
      }
      const data = await response.json();
      return { ok: response.ok, data, status: response.status };
    } catch (err) {
      throw err;
    }
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    // ... (login logic remains mostly same, just ensuring it sets state correctly)
    setLoading(true);
    setError(null);

    try {
      const { ok, data } = await safeFetch('/auth/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!ok) {
        throw new Error(data.detail || data.error || 'Login failed');
      }

      if (data.requires_enrollment) {
        const userId = data.user_id ?? data.userId ?? null;
        if (!userId) {
          throw new Error('Missing user id for enrollment');
        }
        persistPending2FA({
          stage: 'enroll',
          userId,
          email,
          tempToken: null,
        });
        return { status: 'requires_enrollment', userId, email };
      }

      if (data.requires_otp) {
        const tempToken = data.temp_token || data.tempToken;
        persistPending2FA({
          stage: 'verify',
          userId: data.user_id ?? data.userId ?? null,
          email,
          tempToken,
        });
        return { status: 'requires_otp', tempToken, email };
      }

      if (!data.access) {
        throw new Error('Unexpected login response');
      }

      setSessionFromTokens({ access: data.access, refresh: data.refresh, role: data.role, email });
      persistPending2FA({ stage: null, userId: null, email: null, tempToken: null });
      return { status: 'authenticated' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      const displayError = errorMessage.includes('Server returned')
        ? 'Service unavailable. Please try again later.'
        : errorMessage;

      setError(displayError);
      throw new Error(displayError);
    } finally {
      setLoading(false);
    }
  };

  const enroll2FA = async (password: string) => {
    if (!pending2FA.userId || !pending2FA.email) {
      throw new Error('No pending enrollment session found');
    }

    const { ok, data } = await safeFetch('/auth/otp/enroll/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: pending2FA.userId,
        email: pending2FA.email,
        password,
      }),
    });

    if (!ok) {
      throw new Error(data.error || 'Failed to enroll 2FA');
    }

    return {
      qrCode: data.qr_code as string,
      secret: data.secret as string,
      deviceId: data.device_id as number,
      backupCodes: (data.backup_codes as string[]) || [],
    };
  };

  const confirmEnrollment = async (deviceId: number, tokenValue: string) => {
    if (!pending2FA.userId || !pending2FA.email) {
      throw new Error('No pending enrollment session found');
    }

    const { ok, data } = await safeFetch('/auth/otp/confirm-enroll/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: pending2FA.userId,
        device_id: deviceId,
        otp: tokenValue,
      }),
    });

    if (!ok) {
      throw new Error(data.error || data.detail || 'Failed to confirm 2FA enrollment');
    }

    setSessionFromTokens({
      access: data.access,
      refresh: data.refresh,
      role: data.role,
      email: data.email || pending2FA.email,
    });
    persistPending2FA({ stage: null, userId: null, email: null, tempToken: null });
  };

  const verifyOtp = async (token: string, type: 'otp' | 'backup' = 'otp') => {
    if (!pending2FA.tempToken) {
      throw new Error('No pending OTP session found');
    }

    const payload: any = {
      temp_token: pending2FA.tempToken,
    };

    if (type === 'backup') {
      payload.backup_code = token;
    } else {
      payload.otp = token;
    }

    const { ok, data } = await safeFetch('/auth/otp/verify/', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!ok) {
      throw new Error(data.error || data.detail || 'OTP verification failed');
    }

    setSessionFromTokens({
      access: data.access,
      refresh: data.refresh,
      role: data.role,
      email: data.email || pending2FA.email || '',
    });
    persistPending2FA({ stage: null, userId: null, email: null, tempToken: null });
  };

  const requestPasswordReset = async (email: string) => {
    const { ok, data } = await safeFetch('/auth/forgot-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!ok) {
      throw new Error(data.error || 'Failed to request password reset');
    }
    return { message: data.message };
  };

  const completePasswordReset = async (token: string, newPassword: string, confirmPassword: string) => {
    const { ok, data } = await safeFetch('/auth/reset-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword, confirm_password: confirmPassword }),
    });

    if (!ok) {
      throw new Error(data.error || data.detail || 'Failed to reset password');
    }
    return { message: data.message };
  };

  const signup = async (email: string, password: string, passwordConfirm: string) => {
    // Map email to username as required by backend
    const payload = {
      username: email,
      email,
      password,
      password_confirm: passwordConfirm,
    };

    const { ok, data } = await safeFetch('/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!ok) {
      // Extract error message from backend response
      let errorMessage = 'Registration failed';
      if (data.username) errorMessage = `Username error: ${data.username[0]}`;
      else if (data.email) errorMessage = `Email error: ${data.email[0]}`;
      else if (data.password) errorMessage = `Password error: ${data.password[0]}`;
      else if (data.detail) errorMessage = data.detail;
      else if (typeof data === 'string') errorMessage = data;

      throw new Error(errorMessage);
    }

    return { message: 'Account created successfully.' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_refresh');
    persistPending2FA({ stage: null, userId: null, email: null, tempToken: null });
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    requiresEnrollment: pending2FA.stage === 'enroll',
    requiresOtp: pending2FA.stage === 'verify',
    pendingEmail: pending2FA.email,
    pendingUserId: pending2FA.userId,
    otpTempToken: pending2FA.tempToken,
    enroll2FA,
    confirmEnrollment,
    verifyOtp,
    requestPasswordReset,
    completePasswordReset,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
