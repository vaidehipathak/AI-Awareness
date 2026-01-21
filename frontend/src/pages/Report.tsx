import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from 'next-themes';
import { Upload, FileText, Image as ImageIcon, Video, Search, AlertTriangle, CheckCircle, Shield, ArrowRight, Eye, Activity, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnalysisResults from '../components/AnalysisResults';

const ReportPage: React.FC = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const darkMode = theme === 'dark';

    const [activeTab, setActiveTab] = useState<'pii' | 'image' | 'video' | 'pdf'>('pii');
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const analyze = async () => {
        setLoading(true);
        setResult(null);
        const formData = new FormData();

        try {
            // All file uploads go to /api/analyze/ - backend router handles file type detection
            const endpoint = 'http://localhost:8000/api/analyze/';

            if (activeTab === 'pii') {
                // Backend requires a file, so we convert text to a .txt file
                if (!text.trim()) { alert('Please enter text to analyze'); setLoading(false); return; }

                const blob = new Blob([text], { type: 'text/plain' });
                formData.append('file', blob, 'pii_scan_input.txt');

            } else {
                if (!file) { alert('Please select a file'); setLoading(false); return; }
                formData.append('file', file);
            }

            const res = await axios.post(endpoint, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('🔍 Raw Backend Response:', res.data);

            // Transform nested response structure to flat structure
            let transformedResult = res.data;

            // Check if response has nested results structure
            if (res.data.results && res.data.results.length > 0 && res.data.results[0].results) {
                console.log('🔄 Transforming nested response structure...');

                const nestedResults = res.data.results[0].results;

                // Extract PII detection results (prioritize over AI_ANALYSIS)
                const piiDetection = nestedResults.find((r: any) => r.type === 'PII_DETECTION');
                const aiAnalysis = nestedResults.find((r: any) => r.type === 'AI_ANALYSIS');

                // Build flattened structure
                transformedResult = {
                    ...res.data,
                    results: nestedResults, // Use the nested results array directly
                    risk_label: res.data.risk_label || res.data.results[0].risk_label,
                    risk_score: res.data.results[0].risk_score || 0,
                    verdict: res.data.results[0].verdict || 'Analysis Complete',
                    explanation: res.data.results[0].explanation || ''
                };

                // If PII was detected with high-risk entities, override risk label
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

                console.log('✅ Transformed Response:', transformedResult);
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

    const TabButton = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
        <button
            onClick={() => { setActiveTab(id as any); setFile(null); setText(''); setResult(null); }}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 w-full md:w-auto justify-center
                ${activeTab === id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                    : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'}`}
        >
            <Icon size={20} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans relative overflow-hidden">
            {/* --- AMBIENT BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="container mx-auto px-4 py-16 relative z-10">

                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/40 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-8 border border-white/20 backdrop-blur-md shadow-sm"
                    >
                        <Activity size={14} /> Diagnostic Center
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
                    >
                        Threat <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-indigo-500">Analysis</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
                    >
                        Upload content to scan for PII, deepfakes, and hidden manipulations using our advanced detection engine.
                    </motion.p>
                </div>

                <div className="max-w-6xl mx-auto">
                    {/* Navigation Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col md:flex-row gap-4 mb-12 p-2 bg-slate-200/50 dark:bg-white/5 backdrop-blur-md rounded-2xl"
                    >
                        <TabButton id="pii" icon={Search} label="Text & PII Scan" />
                        <TabButton id="image" icon={ImageIcon} label="Deepfake Image" />
                        <TabButton id="video" icon={Video} label="Video Forensics" />
                        <TabButton id="pdf" icon={FileText} label="Document Analysis" />
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* INPUT SECTION */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-10 shadow-xl"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg">
                                    {activeTab === 'pii' && <Search size={24} />}
                                    {activeTab === 'image' && <ImageIcon size={24} />}
                                    {activeTab === 'video' && <Video size={24} />}
                                    {activeTab === 'pdf' && <FileText size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {activeTab === 'pii' && 'Text Analysis'}
                                        {activeTab === 'image' && 'Image Forensics'}
                                        {activeTab === 'video' && 'Video Forensics'}
                                        {activeTab === 'pdf' && 'Document Scan'}
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Input data to begin scan</p>
                                </div>
                            </div>

                            {activeTab === 'pii' ? (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <textarea
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="Paste text here to scan for sensitive information..."
                                            className="w-full h-64 p-6 bg-slate-50 dark:bg-black/30 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-0 resize-none transition-all text-lg font-medium"
                                        />
                                        <div className="absolute bottom-4 right-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                            {text.length} Characters
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`relative h-64 border-3 border-dashed rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300
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
                                        accept={
                                            activeTab === 'image' ? 'image/*' :
                                                activeTab === 'video' ? 'video/*' :
                                                    '.pdf'
                                        }
                                    />

                                    {file ? (
                                        <div className="relative z-0">
                                            <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                                                <CheckCircle size={32} />
                                            </div>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg">{file.name}</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ready for analysis</p>
                                        </div>
                                    ) : (
                                        <div className="relative z-0 px-6">
                                            <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Upload size={32} />
                                            </div>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                                                Drag & Drop or Click to Upload
                                            </p>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                                                Supports {activeTab === 'image' ? 'JPG, PNG, WEBP' : activeTab === 'video' ? 'MP4, MOV, AVI' : 'PDF documents'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-8">
                                <button
                                    onClick={analyze}
                                    disabled={loading || (activeTab === 'pii' ? !text : !file)}
                                    className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all
                                        ${loading || (activeTab === 'pii' ? !text : !file)
                                            ? 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02] hover:shadow-indigo-500/30'
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Running Analysis...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Activity size={20} />
                                            <span>Initiate Scan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>

                        {/* RESULTS SECTION */}
                        <AnimatePresence mode='wait'>
                            {result ? (
                                <AnalysisResults
                                    result={{ ...result, type: activeTab }}
                                    onReset={() => { setResult(null); setFile(null); setText(''); }}
                                />
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-indigo-100 dark:border-white/5 rounded-[2.5rem] p-12 text-center border-dashed"
                                >
                                    <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <Activity size={40} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-400 dark:text-slate-500 mb-2">Awaiting Data</h3>
                                    <p className="text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                                        Upload a file or enter text to view comprehensive threat analysis results here.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;
