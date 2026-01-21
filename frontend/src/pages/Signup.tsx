import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    Lock,
    EyeOff,
    CheckCircle2,
    Mail,
    ArrowRight,
    ShieldAlert,
    Fingerprint,
    UserPlus
} from 'lucide-react';

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
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans">

            {/* --- AMBIENT BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-5xl bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row m-4"
            >

                {/* LEFT PANEL: Identity & Value Prop (Consistent with Login) */}
                <div className="w-full md:w-1/2 p-12 bg-indigo-600/5 dark:bg-white/5 relative overflow-hidden flex flex-col justify-between">
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
                                Join the <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                                    Defense Network
                                </span>
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                                Create an account to access advanced AI analysis and deepfake detection tools.
                            </p>
                        </motion.div>
                    </div>

                    <div className="relative z-10 mt-12 space-y-4">
                        {[
                            { icon: EyeOff, label: "Private Analysis", text: "Your data never trains our models." },
                            { icon: CheckCircle2, label: "Verified Stats", text: "Track your awareness progress." },
                            { icon: UserPlus, label: "Community", text: "Join thousands of defenders." }
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

                {/* RIGHT PANEL: Signup Form */}
                <div className="w-full md:w-1/2 p-12 bg-white/30 dark:bg-black/20 flex flex-col justify-center relative">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center w-full max-w-sm mx-auto"
                            >
                                <div className="w-20 h-20 bg-green-500/20 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                                    <CheckCircle2 size={40} strokeWidth={3} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">You're In!</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                    Your secure account has been created. Redirecting you to the command center...
                                </p>
                                <div className="w-full bg-slate-200 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2 }}
                                        className="h-full bg-green-500"
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-md mx-auto w-full"
                            >
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                                        Fill in your details to get started.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3"
                                        >
                                            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Registration Error</h3>
                                                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
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
                                                    placeholder="you@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                Password
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                                </div>
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                                                    placeholder="At least 8 characters"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                                </div>
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                                                    placeholder="Confirm your password"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:shadow-lg transition-all shadow-md overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity" />

                                        {loading ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Setting up...
                                            </div>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Initialize Account <ArrowRight size={16} />
                                            </span>
                                        )}
                                    </motion.button>
                                </form>

                                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/10 text-center">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Already have an account?{' '}
                                        <Link
                                            to="/login"
                                            className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
                                        >
                                            Sign in instead
                                        </Link>
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                    <Fingerprint size={10} />
                                    <span>Secure Registration Protocol</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </motion.div>
        </div>
    );
};

export default Signup;
