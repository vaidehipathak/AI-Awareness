import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  mfa_enabled: boolean;
  mfa_verified: boolean;
}

type LoginResult =
  | { status: 'authenticated' }
  | { status: 'requires_enrollment'; userId: number; email: string }
  | { status: 'requires_otp' };

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
  isFullyAuthenticated: boolean;
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

  const API_BASE_URL = "http://127.0.0.1:8000";

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
    mfa_enabled?: boolean;
    mfa_verified?: boolean;
  }) => {
    const accessToken = data.access;
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1] || ''));
      const derivedEmail = data.email || payload.email || '';
      const derivedRole = (data.role as 'ADMIN' | 'USER') || payload.role || 'USER';
      const derivedId = payload.user_id || payload.id;
      const derivedUsername = payload.username || (derivedEmail ? derivedEmail.split('@')[0] : '');
      const derivedMfaEnabled = data.mfa_enabled !== undefined ? data.mfa_enabled : (payload.mfa_enabled || false);
      const derivedMfaVerified = data.mfa_verified !== undefined ? data.mfa_verified : (payload.mfa_verified || false);

      const userData: User = {
        id: derivedId,
        email: derivedEmail,
        username: derivedUsername,
        role: derivedRole,
        mfa_enabled: derivedMfaEnabled,
        mfa_verified: derivedMfaVerified,
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

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      const storedPending = sessionStorage.getItem('otp_pending');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.clear();
        }
      }

      if (storedPending) {
        try {
          setPending2FA(JSON.parse(storedPending));
        } catch (e) {
          sessionStorage.removeItem('otp_pending');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const safeFetch = async (endpoint: string, options: RequestInit) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...options.headers } as any;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (response.status === 204) return { ok: true, data: {}, status: 204 };
        throw new Error(`Server returned ${contentType || 'unknown content type'} instead of JSON`);
      }
      const data = await response.json();
      return { ok: response.ok, data, status: response.status };
    } catch (err) {
      throw err;
    }
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
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

      if (data.access) {
        const mfaEnabled = data.mfa_enabled === true;

        setSessionFromTokens({
          access: data.access,
          refresh: data.refresh,
          role: data.role,
          email: email,
          mfa_enabled: mfaEnabled,
          mfa_verified: false
        });

        persistPending2FA({ stage: null, userId: null, email: null, tempToken: null });

        if (mfaEnabled) {
          return { status: 'requires_otp' };
        }
        return { status: 'authenticated' };
      }

      if (data.requires_otp) {
        const tempToken = data.temp_token || data.tempToken;
        persistPending2FA({
          stage: 'verify',
          userId: data.user_id ?? data.userId ?? null,
          email,
          tempToken,
        });
        return { status: 'requires_otp' };
      }

      throw new Error('Unexpected login response');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const enroll2FA = async (password: string) => {
    if (!pending2FA.userId || !pending2FA.email) {
      if (!user) throw new Error('No pending enrollment session found');
    }

    const { ok, data } = await safeFetch('/auth/otp/enroll/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: pending2FA.userId || user?.id,
        email: pending2FA.email || user?.email,
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
    const userId = pending2FA.userId || user?.id;
    if (!userId) throw new Error('No user context found');

    const { ok, data } = await safeFetch('/auth/otp/confirm-enroll/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        device_id: deviceId,
        otp: tokenValue,
      }),
    });

    if (!ok) {
      throw new Error(data.error || data.detail || 'Failed to confirm 2FA enrollment');
    }

    if (data.access) {
      setSessionFromTokens({
        access: data.access,
        refresh: data.refresh,
        role: data.role,
        email: data.email || pending2FA.email || user?.email,
        mfa_enabled: true,
        mfa_verified: true
      });
    }
    persistPending2FA({ stage: null, userId: null, email: null, tempToken: null });
  };

  const verifyOtp = async (otpValue: string, type: 'otp' | 'backup' = 'otp') => {
    const payload: any = {};
    if (type === 'backup') {
      payload.backup_code = otpValue;
    } else {
      payload.otp = otpValue;
    }

    if (pending2FA.tempToken) {
      payload.temp_token = pending2FA.tempToken;
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

    if (data.access) {
      setSessionFromTokens({
        access: data.access,
        refresh: data.refresh,
        role: data.role,
        email: data.email || user?.email || pending2FA.email,
        mfa_enabled: true,
        mfa_verified: true,
      });
    } else {
      if (user) {
        const updatedUser = { ...user, mfa_verified: true };
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }
    }
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

  const isFullyAuthenticated = !!user && !!token && (!user.mfa_enabled || user.mfa_verified);

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isFullyAuthenticated,
    isAdmin: user?.role === 'ADMIN',
    requiresEnrollment: pending2FA.stage === 'enroll',
    requiresOtp: pending2FA.stage === 'verify' || (!!user?.mfa_enabled && !user?.mfa_verified),
    pendingEmail: pending2FA.email || user?.email || null,
    pendingUserId: pending2FA.userId || user?.id || null,
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
