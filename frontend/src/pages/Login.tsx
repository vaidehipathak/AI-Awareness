import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  CheckCircle2,
  Mail,
  ArrowRight,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans">

      {/* --- AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row m-4"
      >

        {/* LEFT PANEL: Identity & Value Prop */}
        <div className="w-full md:w-1/2 p-12 bg-indigo-600/5 dark:bg-white/5 relative overflow-hidden flex flex-col justify-between">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                <ShieldCheck size={28} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                AwareX
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                Secure Access to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                  AI Intelligence
                </span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Enter the active defense platform. Analyze deepfakes, detect PII leaks, and train your workforce.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 mt-12 space-y-4">
            {[
              { icon: EyeOff, label: "Privacy First", text: "Zero-retention PII scanning." },
              { icon: Fingerprint, label: "Biometric Auth", text: "Enterprise-grade security." },
              { icon: ShieldAlert, label: "Deepfake Detection", text: "99.8% Accuracy on video." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/5 backdrop-blur-sm"
              >
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <feature.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{feature.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{feature.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Login Form */}
        <div className="w-full md:w-1/2 p-12 bg-white/30 dark:bg-black/20 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Please sign in to your verified account.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3"
                >
                  <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Authentication Failed</h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                  </div>
                </motion.div>
              )}

              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                      placeholder="you@company.com"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity" />

                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying Credentials...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In Securely <ArrowRight size={16} />
                  </span>
                )}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-8 border-t border-slate-200 dark:border-white/10 text-center"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
                >
                  Create verified profile
                </button>
              </p>
            </motion.div>

            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              <Lock size={10} />
              <span>End-to-End Encrypted Session</span>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
