import React, { useState } from 'react';
import ZKATTInput from '../../components/zkatt/ZKATTInput';
import ZKATTConsole from '../../components/zkatt/ZKATTConsole';
import ZKATTVerdict from '../../components/zkatt/ZKATTVerdict';
import { RefreshCcw, ShieldAlert, FileText, Fingerprint } from 'lucide-react';

const ZKATTPage: React.FC = () => {
    const [step, setStep] = useState<'INPUT' | 'SIMULATING' | 'VERDICT'>('INPUT');
    const [logs, setLogs] = useState<string[]>([]);
    const [verdictData, setVerdictData] = useState<any>(null);

    const handleInitiate = async (description: string, options: any) => {
        setStep('SIMULATING');
        setLogs(["INITIALIZING Z-KATT CORE SYSTEM...", "CONNECTING TO LOCAL LLM CLUSTER..."]);

        // Simulated Logs for UX (runs in parallel with actual fetch)
        const logSequence = [
            "Analyzing Intent: " + description,
            "Researching Branding Profile...",
            "Compiling Synthetic Twin Template...",
            "SUCCESS: Twin Generated in memory.",
            "Loading Adversarial Modules [Masker, Manipulator]...",
            "Injecting PII Permutations...",
            "Simulating AI Detection Layer...",
            "Analyzing Forensic Delta...",
            "Calculating Risk Score..."
        ];

        let logIndex = 0;
        const logInterval = setInterval(() => {
            if (logIndex < logSequence.length) {
                setLogs(prev => [...prev, logSequence[logIndex]]);
                logIndex++;
            }
        }, 45000); // 45s per log step (CPU Inference Speed)

        // Timeout Safety Valve (600 Seconds / 10 Minutes)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600000);

        try {
            const response = await fetch('/api/zkatt/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, ...options }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Server Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            clearInterval(logInterval);
            console.log("DEBUG: Full API Response:", data);

            if (data.error) {
                setLogs(prev => [...prev, "ERROR: " + data.error]);
                return;
            }

            if (!data.risk_verdict) {
                console.error("DEBUG: Missing risk_verdict in response!", data);
                setLogs(prev => [...prev, "ERROR: Invalid Backend Response (Missing Verdict Data)"]);
                return;
            }

            setLogs(prev => [...prev, "SUCCESS: VULNERABILITY REPORT GENERATED."]);

            // Artificial delay to let user see "Success"
            setTimeout(() => {
                // Merge evidence links into the verdict data object
                const finalData = {
                    ...data.risk_verdict,
                    evidence: data.evidence
                };
                setVerdictData(finalData);
                setStep('VERDICT');
            }, 1000);

        } catch (error: any) {
            clearInterval(logInterval);
            console.error("DEBUG: Fetch/Parse Error:", error);

            if (error.name === 'AbortError') {
                setLogs(prev => [...prev, "ERROR: TIMEOUT - Backend took too long to respond."]);
            } else {
                setLogs(prev => [...prev, `CRITICAL ERROR: ${error.message || "Connection Failed"}`]);
            }
        }
    };

    const handleReset = () => {
        setStep('INPUT');
        setLogs([]);
        setVerdictData(null);
    };

    return (
        <div className="min-h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans selection:bg-indigo-500 selection:text-white">

            {/* Ambient Background - Matching Home Page */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[80px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[80px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-500/10 rounded-full blur-[80px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Page Header */}
            <div className="relative z-10 pt-24 pb-12 px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                    <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-600 dark:text-slate-300">
                        Zero-Knowledge Adversarial Twin Toolkit
                    </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">
                    Forensic <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Simulation</span> Engine
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                    Simulate AI-driven attacks on documents and generate synthetic evidence for educational purposes.
                </p>

                {/* What You'll Learn Section */}
                <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <ShieldAlert className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Understand AI Vulnerabilities</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            See how AI can manipulate documents and learn to identify synthetic alterations in real-world scenarios.
                        </p>
                    </div>

                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Forensic Analysis Skills</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Develop critical thinking to detect document fraud, PII leaks, and adversarial attacks on sensitive data.
                        </p>
                    </div>

                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                            <Fingerprint className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Privacy Protection Awareness</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Learn how personal information can be exploited and understand best practices for data security.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 px-4 pb-24 flex flex-col items-center justify-center">
                {step === 'INPUT' && (
                    <div className="animate-in fade-in zoom-in duration-500 w-full">
                        <ZKATTInput onInitiate={handleInitiate} isLoading={false} />
                    </div>
                )}

                {step === 'SIMULATING' && (
                    <div className="w-full max-w-4xl space-y-6">
                        <div className="text-center p-6 rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse">
                                Running Forensic Simulation...
                            </h2>
                        </div>
                        <ZKATTConsole logs={logs} />
                    </div>
                )}

                {step === 'VERDICT' && (
                    <div className="w-full space-y-8">
                        {verdictData ? (
                            <ZKATTVerdict data={verdictData} />
                        ) : (
                            <div className="max-w-2xl mx-auto text-center p-8 rounded-3xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl shadow-xl">
                                <h3 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400">Rendering Error</h3>
                                <p className="text-slate-600 dark:text-slate-400">Simulation completed, but result data is missing.</p>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <button
                                onClick={handleReset}
                                className="group relative px-8 py-4 bg-white dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-full font-bold backdrop-blur-md hover:bg-slate-100 dark:hover:bg-white/20 transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105"
                            >
                                <RefreshCcw className="w-5 h-5" />
                                Run New Simulation
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZKATTPage;

