import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from 'next-themes';
import { 
    Upload, FileText, Search, AlertTriangle, CheckCircle, Shield, 
    ArrowRight, Eye, Activity, Lock, Sliders, RefreshCw, Trash2, 
    Flag, Check, X, Download, Copy, ExternalLink, User, Calendar, 
    Sparkles, ShieldAlert, FileCheck, HelpCircle, Layers, Radio
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnalysisResults from '../components/AnalysisResults';
import { API_BASE_URL } from '../config';

const ReportPage: React.FC = () => {
    const { user, token } = useAuth();
    const { theme } = useTheme();
    const darkMode = theme === 'dark';
    const isAdmin = user?.role === 'ADMIN';

    // Navigation Tab (Admin view)
    const [activeTab, setActiveTab] = useState<'scanner' | 'radar'>('scanner');

    // Scanner States
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [dragActive, setDragActive] = useState(false);

    // Admin Scanner Controls
    const [strictMode, setStrictMode] = useState(false);
    const [detectors, setDetectors] = useState({
        pii: true,
        deepfake: true,
        promptInjection: true,
        phishing: true
    });

    // Admin Radar / Global Audit States
    const [reports, setReports] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        total_reports: 0,
        high_risk_reports: 0,
        pending_review: 0
    });
    const [loadingReports, setLoadingReports] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [riskFilter, setRiskFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Document Inspector Modal State
    const [inspectingReport, setInspectingReport] = useState<any | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [copied, setCopied] = useState(false);

    // Fetch Global Reports for Admin
    const fetchReports = async () => {
        if (!isAdmin) return;
        setLoadingReports(true);
        try {
            const activeToken = localStorage.getItem('auth_token') || token;
            const headers = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
            const params: any = {};
            if (riskFilter !== 'ALL') params.risk = riskFilter;
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const res = await axios.get(`${API_BASE_URL}/api/analysis/admin/reports/`, { headers, params });
            if (res.data.results) {
                setReports(res.data.results);
                if (res.data.stats) setStats(res.data.stats);
            } else if (Array.isArray(res.data)) {
                setReports(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch admin reports", err);
        } finally {
            setLoadingReports(false);
        }
    };

    useEffect(() => {
        if (isAdmin && activeTab === 'radar') {
            fetchReports();
        }
    }, [isAdmin, activeTab, riskFilter, statusFilter]);

    // Handle Inspect Document Click
    const handleInspect = async (reportId: number) => {
        setLoadingDetail(true);
        try {
            const activeToken = localStorage.getItem('auth_token') || token;
            const headers = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
            const res = await axios.get(`${API_BASE_URL}/api/analysis/admin/reports/${reportId}/`, { headers });
            setInspectingReport(res.data);
        } catch (err) {
            console.error("Failed to fetch report detail", err);
            alert("Failed to load full document details.");
        } finally {
            setLoadingDetail(false);
        }
    };

    // Handle Update Status
    const handleUpdateStatus = async (reportId: number, newStatus: 'PENDING' | 'REVIEWED' | 'FLAGGED') => {
        try {
            const activeToken = localStorage.getItem('auth_token') || token;
            const headers = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
            await axios.patch(`${API_BASE_URL}/api/analysis/admin/reports/${reportId}/status/`, { status: newStatus }, { headers });
            
            // Update local state
            setReports(prev => prev.map(r => r.report_id === reportId ? { ...r, status: newStatus } : r));
            if (inspectingReport && inspectingReport.report_id === reportId) {
                setInspectingReport({ ...inspectingReport, status: newStatus });
            }
        } catch (err) {
            console.error("Status update failed", err);
        }
    };

    // Handle Delete Report
    const handleDeleteReport = async (reportId: number) => {
        if (!window.confirm(`Are you sure you want to delete scan record #${reportId}?`)) return;
        try {
            const activeToken = localStorage.getItem('auth_token') || token;
            const headers = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
            await axios.delete(`${API_BASE_URL}/api/analysis/admin/reports/${reportId}/`, { headers });
            setReports(prev => prev.filter(r => r.report_id !== reportId));
            if (inspectingReport?.report_id === reportId) {
                setInspectingReport(null);
            }
        } catch (err) {
            console.error("Failed to delete report", err);
            alert("Delete failed.");
        }
    };

    // Keyboard listener for Inspector modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setInspectingReport(null);
        };
        if (inspectingReport) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inspectingReport]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setText('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setText('');
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        if (e.target.value) setFile(null);
    };

    const analyze = async () => {
        setLoading(true);
        setResult(null);
        const formData = new FormData();

        try {
            const endpoint = `${API_BASE_URL}/api/analyze/`;

            if (file) {
                formData.append('file', file);
            } else if (text.trim()) {
                const blob = new Blob([text], { type: 'text/plain' });
                formData.append('file', blob, 'smart_scan_input.txt');
            } else {
                alert('Please enter text OR select a file');
                setLoading(false);
                return;
            }

            // Include Admin configuration in metadata
            const metadataPayload = {
                strict_mode: strictMode,
                detectors_enabled: detectors
            };
            formData.append('metadata', JSON.stringify(metadataPayload));

            const res = await axios.post(endpoint, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            let transformedResult = res.data;
            if (res.data.results && res.data.results.length > 0 && res.data.results[0].results) {
                const nestedResults = res.data.results[0].results;
                const piiDetection = nestedResults.find((r: any) => r.type === 'PII_DETECTION');
                transformedResult = {
                    ...res.data,
                    results: nestedResults,
                    risk_label: res.data.risk_label || res.data.results[0].risk_label,
                    risk_score: res.data.results[0].risk_score || 0,
                    verdict: res.data.results[0].verdict || 'Analysis Complete',
                    explanation: res.data.results[0].explanation || ''
                };

                if (piiDetection && piiDetection.found && piiDetection.entities) {
                    const highRiskPII = ['AADHAAR', 'VID', 'PAN', 'CREDIT_DEBIT_CARD', 'CVV', 'BANK_ACCOUNT'];
                    const hasHighRisk = piiDetection.entities.some((e: any) => highRiskPII.includes(e.type));
                    if (hasHighRisk) {
                        transformedResult.risk_label = 'HIGH';
                        transformedResult.risk_score = 0.9;
                    } else if (piiDetection.risk_score_weighted >= 6) {
                        transformedResult.risk_label = 'MEDIUM';
                        transformedResult.risk_score = 0.6;
                    }
                }
            }

            setResult(transformedResult);
        } catch (err: any) {
            console.error("Analysis Error:", err);
            const msg = err.response?.data?.error || err.message || 'Analysis failed';
            alert(`Analysis failed: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans relative overflow-hidden pb-20">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <div className="container mx-auto px-4 pt-12 relative z-10">

                {/* Header Title */}
                <div className="text-center max-w-3xl mx-auto mb-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
                        <Shield className="w-3.5 h-3.5" />
                        {isAdmin ? 'Admin Threat Intelligence Center' : 'AI Security & Threat Scanner'}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        Threat <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-indigo-500 to-purple-500">Analysis</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {isAdmin 
                            ? 'Run deep security forensics, configure detector engines, and monitor real-time user document submissions.' 
                            : 'Upload documents or paste text to scan for sensitive PII, prompt injections, and hidden security risks.'}
                    </p>
                </div>

                {/* --- ADMIN MODE NAVIGATION SWITCHER --- */}
                {isAdmin && (
                    <div className="max-w-xl mx-auto mb-10">
                        <div className="p-1.5 bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl flex items-center shadow-lg">
                            <button
                                onClick={() => setActiveTab('scanner')}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
                                    activeTab === 'scanner'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Activity className="w-4 h-4" />
                                <span>Live Deep Scanner</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('radar')}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all relative ${
                                    activeTab === 'radar'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                                <span>Platform Scan Radar</span>
                                {stats.high_risk_reports > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                                        {stats.high_risk_reports} High
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 1: SCANNER VIEW (Both Admin & Normal Users) */}
                {/* ========================================================================= */}
                {(!isAdmin || activeTab === 'scanner') && (
                    <div className="max-w-6xl mx-auto">
                        
                        {/* Admin Scanner Settings Toolbar */}
                        {isAdmin && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-5 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-lg"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                        <Sliders className="w-4 h-4 text-indigo-500" />
                                        <span>Detection Engine Settings</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Strict Forensic Mode:</span>
                                        <button
                                            type="button"
                                            onClick={() => setStrictMode(!strictMode)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${strictMode ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${strictMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${strictMode ? 'bg-red-500/15 text-red-500 border border-red-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                            {strictMode ? 'Paranoia Mode' : 'Standard'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={detectors.pii}
                                            onChange={e => setDetectors({ ...detectors, pii: e.target.checked })}
                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <span>PII & Secrets Redaction</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={detectors.deepfake}
                                            onChange={e => setDetectors({ ...detectors, deepfake: e.target.checked })}
                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <span>Deepfake & ViT Forensics</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={detectors.promptInjection}
                                            onChange={e => setDetectors({ ...detectors, promptInjection: e.target.checked })}
                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <span>Prompt Injection Guard</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={detectors.phishing}
                                            onChange={e => setDetectors({ ...detectors, phishing: e.target.checked })}
                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <span>Phishing / Malicious Links</span>
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid lg:grid-cols-2 gap-10 items-start">
                            {/* Input Form Section */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-xl"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            Smart Analysis
                                        </h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs">Input data or upload document to initiate scan</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Text Input Block */}
                                    <div className={`transition-all duration-300 ${file ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Option 1: Paste Text</span>
                                        </div>
                                        <textarea
                                            value={text}
                                            onChange={handleTextChange}
                                            placeholder="Paste text here to scan for sensitive information, credentials, or prompt injections..."
                                            className="w-full h-32 p-4 bg-slate-50 dark:bg-black/30 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-0 resize-none transition-all text-sm font-mono"
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">OR</span>
                                        <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
                                    </div>

                                    {/* File Input Block */}
                                    <div className={`transition-all duration-300 ${text ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Option 2: Upload File</span>
                                        </div>
                                        <div
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            className={`relative h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300
                                                ${dragActive
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10'
                                                    : file
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                                                        : 'border-slate-300 dark:border-white/10 hover:border-indigo-400 bg-slate-50/50 dark:bg-white/5'
                                                }`}
                                        >
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={handleFileChange}
                                                accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
                                            />

                                            {file ? (
                                                <div className="relative z-0">
                                                    <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-green-500/30">
                                                        <CheckCircle size={20} />
                                                    </div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{file.name}</p>
                                                    <p className="text-slate-500 dark:text-slate-400 text-xs">{(file.size / 1024).toFixed(1)} KB • Ready for scan</p>
                                                </div>
                                            ) : (
                                                <div className="relative z-0 px-6">
                                                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                        <Upload size={20} />
                                                    </div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">
                                                        Click to Upload or Drag File
                                                    </p>
                                                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                                                        PDF, TXT, DOCX, PNG, JPG supported
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={analyze}
                                        disabled={loading || (!text && !file)}
                                        className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl transition-all
                                            ${loading || (!text && !file)
                                                ? 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:scale-[1.01] hover:shadow-indigo-500/30 active:scale-95'
                                            }`}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Running Threat Forensics...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Activity size={18} />
                                                <span>Initiate Threat Scan</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Scan Results Display */}
                            <AnimatePresence mode="wait">
                                {result ? (
                                    <AnalysisResults
                                        result={{ ...result, type: 'smart_scan' }}
                                        onReset={() => { setResult(null); setFile(null); setText(''); }}
                                    />
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="h-full min-h-[480px] flex flex-col items-center justify-center bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-indigo-100 dark:border-white/5 rounded-[2.5rem] p-12 text-center border-dashed"
                                    >
                                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600">
                                            <Activity size={36} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-400 dark:text-slate-500 mb-2">Awaiting Data</h3>
                                        <p className="text-slate-400 dark:text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
                                            Upload a document or enter text to view comprehensive threat analysis and PII breakdown here.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: PLATFORM SCAN RADAR & USER SUBMISSIONS (Admin Only) */}
                {/* ========================================================================= */}
                {isAdmin && activeTab === 'radar' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-6xl mx-auto space-y-8"
                    >
                        {/* Stat Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Platform Scans</span>
                                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white">
                                    {stats.total_reports || reports.length}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Total documents submitted across AwareX</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-red-500/20 shadow-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-red-500">High Risk Incidents</span>
                                    <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                                        <ShieldAlert className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-red-600 dark:text-red-400">
                                    {stats.high_risk_reports || reports.filter(r => r.overall_risk === 'HIGH').length}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Contains critical PII or malicious payloads</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-amber-500/20 shadow-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Pending Review</span>
                                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                                    {stats.pending_review || reports.filter(r => r.status === 'PENDING').length}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Submissions awaiting SecOps sign-off</p>
                            </div>
                        </div>

                        {/* Search, Filter & Refresh Bar */}
                        <div className="p-5 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-lg flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by user email, file, or text..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && fetchReports()}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                {/* Risk Filter */}
                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                                    {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setRiskFilter(r)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                riskFilter === r
                                                    ? r === 'HIGH' ? 'bg-red-500 text-white' : r === 'MEDIUM' ? 'bg-amber-500 text-black' : r === 'LOW' ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white text-xs font-medium focus:outline-none cursor-pointer"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="PENDING">Pending Review</option>
                                    <option value="REVIEWED">Reviewed</option>
                                    <option value="FLAGGED">Flagged</option>
                                </select>

                                {/* Refresh Button */}
                                <button
                                    onClick={fetchReports}
                                    disabled={loadingReports}
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                    title="Refresh Scan Radar"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loadingReports ? 'animate-spin text-indigo-500' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Live User Submissions Table */}
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden">
                            <div className="p-5 px-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <FileCheck className="w-5 h-5 text-indigo-500" />
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                                        Live User Uploads & Scan Submissions ({reports.length})
                                    </h3>
                                </div>
                                <span className="text-xs text-slate-400">Click on any row or "Inspect" to view exact document</span>
                            </div>

                            {loadingReports ? (
                                <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                                    <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm font-medium">Loading user submission logs...</span>
                                </div>
                            ) : reports.length === 0 ? (
                                <div className="p-16 text-center text-slate-400">
                                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
                                    <h4 className="font-bold text-lg text-slate-600 dark:text-slate-400">No Scan Records Found</h4>
                                    <p className="text-xs text-slate-500 mt-1">Try changing search keywords or risk filters.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                <th className="p-4 pl-6">ID & Timestamp</th>
                                                <th className="p-4">User</th>
                                                <th className="p-4">Document / File</th>
                                                <th className="p-4">Content Snippet</th>
                                                <th className="p-4">Risk Rating</th>
                                                <th className="p-4">Review Status</th>
                                                <th className="p-4 pr-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                                            {reports.map(r => (
                                                <tr
                                                    key={r.report_id}
                                                    onClick={() => handleInspect(r.report_id)}
                                                    className="hover:bg-indigo-500/5 transition-colors cursor-pointer group"
                                                >
                                                    <td className="p-4 pl-6">
                                                        <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                                            #{r.report_id}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400">
                                                            {new Date(r.submitted_at).toLocaleDateString()} {new Date(r.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                                {(r.submitted_by || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                                                                {r.submitted_by}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                                                                {r.file_type || 'TXT'}
                                                            </span>
                                                            <span className="font-medium text-slate-900 dark:text-white text-xs truncate max-w-[140px]" title={r.file_metadata?.original_name}>
                                                                {r.file_metadata?.original_name || 'smart_scan_input.txt'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px]" title={r.preview_snippet}>
                                                            {r.preview_snippet || 'No text extracted'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider ${
                                                            r.overall_risk === 'HIGH'
                                                                ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20'
                                                                : r.overall_risk === 'MEDIUM'
                                                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                                                    : 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${r.overall_risk === 'HIGH' ? 'bg-red-500' : r.overall_risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'}`} />
                                                            {r.overall_risk}
                                                        </span>
                                                    </td>
                                                    <td className="p-4" onClick={e => e.stopPropagation()}>
                                                        <select
                                                            value={r.status || 'PENDING'}
                                                            onChange={e => handleUpdateStatus(r.report_id, e.target.value as any)}
                                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none ${
                                                                r.status === 'FLAGGED'
                                                                    ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                                                                    : r.status === 'REVIEWED'
                                                                        ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
                                                                        : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                                                            }`}
                                                        >
                                                            <option value="PENDING">PENDING</option>
                                                            <option value="REVIEWED">REVIEWED</option>
                                                            <option value="FLAGGED">FLAGGED</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-4 pr-6 text-right" onClick={e => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => handleInspect(r.report_id)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                                                                title="Inspect Full Document & AI Findings"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteReport(r.report_id)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                                title="Delete Record"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

            </div>

            {/* ========================================================================= */}
            {/* DOCUMENT INSPECTOR MODAL */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {inspectingReport && (
                    <div 
                        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
                        onClick={() => setInspectingReport(null)}
                    >
                        <div 
                            className="bg-white dark:bg-[#0f1015] rounded-3xl shadow-2xl w-full max-w-4xl h-[88vh] max-h-[760px] flex flex-col border border-slate-200 dark:border-white/10 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Pinned Modal Header */}
                            <div className="p-5 px-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-900/80 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-2xl ${
                                        inspectingReport.overall_risk === 'HIGH'
                                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                            : inspectingReport.overall_risk === 'MEDIUM'
                                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                    }`}>
                                        <ShieldAlert className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                                                Document & Threat Forensics #{inspectingReport.report_id}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                inspectingReport.overall_risk === 'HIGH'
                                                    ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20'
                                                    : inspectingReport.overall_risk === 'MEDIUM'
                                                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                                        : 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20'
                                            }`}>
                                                {inspectingReport.overall_risk} RISK
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Submitted by <span className="font-semibold text-slate-700 dark:text-slate-300">{inspectingReport.submitted_by}</span> on {new Date(inspectingReport.submitted_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setInspectingReport(null)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                                    title="Close (Esc)"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Inspection Body */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    
                                    {/* Left Column (7 cols): Exact Document Content Viewer */}
                                    <div className="lg:col-span-7 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-indigo-500" />
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                                    Exact Uploaded Content / Document Text
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(inspectingReport.extracted_text || inspectingReport.file_metadata?.original_name || '');
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 2000);
                                                    }}
                                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                    {copied ? 'Copied!' : 'Copy Text'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-900 text-slate-100 p-4 font-mono text-xs leading-relaxed max-h-[380px] overflow-y-auto shadow-inner">
                                            {inspectingReport.extracted_text ? (
                                                <pre className="whitespace-pre-wrap font-mono text-slate-200">
                                                    {inspectingReport.extracted_text}
                                                </pre>
                                            ) : (
                                                <div className="text-slate-500 italic p-6 text-center">
                                                    No direct text extracted (Binary/Image file: {inspectingReport.file_metadata?.original_name}).
                                                </div>
                                            )}
                                        </div>

                                        {/* File Metadata Info Box */}
                                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 grid grid-cols-3 gap-2 text-xs">
                                            <div>
                                                <span className="text-slate-400 block text-[10px] uppercase">File Name</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                                                    {inspectingReport.file_metadata?.original_name}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px] uppercase">Content Type</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {inspectingReport.file_metadata?.content_type || 'text/plain'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px] uppercase">Size</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {((inspectingReport.file_metadata?.size_bytes || 0) / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column (5 cols): AI Detection Findings & Telemetry */}
                                    <div className="lg:col-span-5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-purple-500" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                                AI Detector Findings
                                            </span>
                                        </div>

                                        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                                            {inspectingReport.detector_results && inspectingReport.detector_results.length > 0 ? (
                                                inspectingReport.detector_results.map((dr: any, idx: number) => (
                                                    <div 
                                                        key={idx}
                                                        className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                                                                {dr.detector_name.replace(/_/g, ' ')}
                                                            </span>
                                                            <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">
                                                                Confidence: {Math.round((dr.confidence_score || 0) * 100)}%
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 dark:text-slate-300">
                                                            {dr.short_explanation || 'Detector executed without anomalies.'}
                                                        </p>

                                                        {/* High Risk Entities Pill List */}
                                                        {dr.flags && dr.flags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 pt-1">
                                                                {dr.flags.map((f: string, fidx: number) => (
                                                                    <span key={fidx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20">
                                                                        {f}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-50 dark:bg-white/5 rounded-2xl">
                                                    No specific detector anomalies reported.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pinned Footer with Action Controls */}
                            <div className="p-4 px-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap justify-between items-center gap-3 bg-slate-50 dark:bg-slate-900/80 shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-500">Update Incident Status:</span>
                                    <button
                                        onClick={() => handleUpdateStatus(inspectingReport.report_id, 'REVIEWED')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                            inspectingReport.status === 'REVIEWED'
                                                ? 'bg-green-600 text-white shadow-md'
                                                : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                                        }`}
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Mark Reviewed</span>
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(inspectingReport.report_id, 'FLAGGED')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                            inspectingReport.status === 'FLAGGED'
                                                ? 'bg-red-600 text-white shadow-md'
                                                : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                                        }`}
                                    >
                                        <Flag className="w-3.5 h-3.5" />
                                        <span>Flag Incident</span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inspectingReport, null, 2));
                                            const downloadAnchor = document.createElement('a');
                                            downloadAnchor.setAttribute("href", dataStr);
                                            downloadAnchor.setAttribute("download", `AwareX_Incident_Report_${inspectingReport.report_id}.json`);
                                            document.body.appendChild(downloadAnchor);
                                            downloadAnchor.click();
                                            downloadAnchor.remove();
                                        }}
                                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-white/20 flex items-center gap-1.5 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Export JSON</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteReport(inspectingReport.report_id)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReportPage;
