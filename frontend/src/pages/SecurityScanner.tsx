import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, AlertTriangle, CheckCircle, Loader, Clock, Target, Search, History, ExternalLink, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface ScanResult {
    scan_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    target_url: string;
    results?: any;
    vulnerability_count: number;
    risk_score: number;
    error_message?: string;
    created_at: string;
    completed_at?: string;
}

const SecurityScanner: React.FC = () => {
    const { user } = useAuth();
    const [url, setUrl] = useState('');
    const [scanning, setScanning] = useState(false);
    const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
    const [error, setError] = useState('');
    const [selectedHistoryScan, setSelectedHistoryScan] = useState<ScanResult | null>(null);

    // Get auth token from localStorage
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        if (user) {
            fetchScanHistory();
        }
    }, [user]);

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        if (currentScan && currentScan.status === 'running') {
            pollInterval = setInterval(async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:8000/api/scanner/status/${currentScan.scan_id}/`,
                        { headers: getAuthHeaders() }
                    );
                    setCurrentScan(response.data);

                    if (response.data.status === 'completed' || response.data.status === 'failed') {
                        setScanning(false);
                        fetchScanHistory();
                        clearInterval(pollInterval);
                    }
                } catch (err) {
                    console.error('Error polling scan status:', err);
                }
            }, 3000);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [currentScan]);

    const fetchScanHistory = async () => {
        try {
            const response = await axios.get(
                'http://localhost:8000/api/scanner/history/',
                { headers: getAuthHeaders() }
            );
            setScanHistory(response.data.scans || []);
        } catch (err) {
            console.error('Error fetching scan history:', err);
        }
    };

    const startScan = async () => {
        if (!url.trim()) {
            setError('Please enter a URL');
            return;
        }

        setError('');
        setScanning(true);
        setCurrentScan(null);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/scanner/scan/',
                { url },
                { headers: getAuthHeaders() }
            );
            setCurrentScan(response.data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.details || 'Failed to start scan. Please try again.';
            setError(errorMessage);
            setScanning(false);
        }
    };

    const getRiskColor = (score: number) => {
        if (score >= 70) return 'text-red-500';
        if (score >= 40) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getRiskBgColor = (score: number) => {
        if (score >= 70) return 'bg-red-500/10 border-red-500/20';
        if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/20';
        return 'bg-green-500/10 border-green-500/20';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="container mx-auto px-4 py-12 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/40 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-8 border border-white/20 backdrop-blur-md shadow-sm">
                        <Shield className="w-4 h-4" /> Security Analysis
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Vulnerability <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Scanner</span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Comprehensive security auditing with 30+ vulnerability tests including SSL/TLS, XSS, security headers, and more.
                    </p>
                </motion.div>

                {/* Scan Input */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-4xl mx-auto mb-12"
                >
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2rem] p-8 shadow-lg">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !scanning && startScan()}
                                    placeholder="Enter website URL (e.g., https://example.com)"
                                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400"
                                    disabled={scanning}
                                />
                            </div>
                            <button
                                onClick={startScan}
                                disabled={scanning || !url.trim()}
                                className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all transform shadow-xl ${scanning || !url.trim()
                                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:scale-105 hover:shadow-indigo-500/40'
                                    }`}
                            >
                                {scanning ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5" />
                                        Start Scan
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400"
                            >
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-medium">{error}</span>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Current Scan Results */}
                <AnimatePresence>
                    {currentScan && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-6xl mx-auto mb-12"
                        >
                            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2rem] p-8 shadow-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Current Scan</h2>
                                    <div className={`px-4 py-2 rounded-full text-sm font-bold ${currentScan.status === 'completed' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                        currentScan.status === 'failed' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                            'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                        }`}>
                                        {currentScan.status.toUpperCase()}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                                        <Target className="w-4 h-4" />
                                        <span className="font-medium">Target:</span>
                                    </div>
                                    <a
                                        href={currentScan.target_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-2"
                                    >
                                        {currentScan.target_url}
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>

                                {currentScan.status === 'running' && (
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                        <Loader className="w-5 h-5 animate-spin text-indigo-500" />
                                        <span>Performing security analysis... This may take several minutes.</span>
                                    </div>
                                )}

                                {currentScan.status === 'completed' && currentScan.results && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className={`p-6 rounded-2xl border ${getRiskBgColor(currentScan.risk_score)}`}>
                                                <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">RISK SCORE</div>
                                                <div className={`text-4xl font-black ${getRiskColor(currentScan.risk_score)}`}>
                                                    {currentScan.risk_score}/100
                                                </div>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-white/10">
                                                <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">VULNERABILITIES</div>
                                                <div className="text-4xl font-black text-slate-900 dark:text-white">
                                                    {currentScan.vulnerability_count}
                                                </div>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-white/10">
                                                <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">TESTS RUN</div>
                                                <div className="text-4xl font-black text-slate-900 dark:text-white">
                                                    {currentScan.results.tests ? currentScan.results.tests.length : 0}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="max-h-96 overflow-y-auto space-y-3">
                                            {currentScan.results.tests && currentScan.results.tests.map((test: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className={`p-5 rounded-xl border transition-all ${test?.vulnerable
                                                            ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                                                            : 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            {test?.vulnerable ? (
                                                                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                                            ) : (
                                                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                                            )}
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                                        {test.test}
                                                                    </span>
                                                                    {test.severity && test.severity !== 'info' && (
                                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${test.severity === 'critical' ? 'bg-red-600 text-white' :
                                                                                test.severity === 'high' ? 'bg-orange-500 text-white' :
                                                                                    test.severity === 'medium' ? 'bg-yellow-500 text-white' :
                                                                                        'bg-blue-500 text-white'
                                                                            }`}>
                                                                            {test.severity.toUpperCase()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                                    {test.details}
                                                                </p>
                                                                {test.recommendation && (
                                                                    <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                                                        <div className="flex items-start gap-2">
                                                                            <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                                                            <div>
                                                                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                                                                                    💡 HOW TO FIX
                                                                                </div>
                                                                                <p className="text-xs text-slate-700 dark:text-slate-300">
                                                                                    {test.recommendation}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`text-sm font-bold whitespace-nowrap ml-3 ${test?.vulnerable ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                                            }`}>
                                                            {test?.vulnerable ? 'VULNERABLE' : 'SECURE'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentScan.status === 'failed' && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span className="font-medium">{currentScan.error_message || 'Scan failed'}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scan History */}
                {scanHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-6xl mx-auto"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <History className="w-6 h-6 text-indigo-500" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Scan History</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {scanHistory.map((scan) => (
                                <motion.div
                                    key={scan.scan_id}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    onClick={() => setSelectedHistoryScan(scan)}
                                    className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${scan.status === 'completed' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                            scan.status === 'failed' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                                'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                            }`}>
                                            {scan.status}
                                        </div>
                                        {scan.status === 'completed' && (
                                            <div className={`text-2xl font-black ${getRiskColor(scan.risk_score)}`}>
                                                {scan.risk_score}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Target</div>
                                        <div className="text-slate-900 dark:text-white font-bold truncate">
                                            {new URL(scan.target_url).hostname}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <Clock className="w-4 h-4" />
                                        {new Date(scan.created_at).toLocaleDateString()} {new Date(scan.created_at).toLocaleTimeString()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SecurityScanner;
