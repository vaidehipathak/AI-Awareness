import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface ZKATTConsoleProps {
    logs: string[];
}

const ZKATTConsole: React.FC<ZKATTConsoleProps> = ({ logs }) => {
    // Extract unique stages from logs to prevent duplicate flicker
    // We map logs to "Stages" for a cleaner UI
    const stages = [
        { id: 'init', label: 'Initializing Z-KATT Core System', match: 'INITIALIZING' },
        { id: 'intent', label: 'Analyzing Intent & Context', match: 'Intent' },
        { id: 'twin', label: 'Generating Synthetic Twin Template', match: 'Twin' },
        { id: 'attack', label: 'Simulating Adversarial Attacks', match: 'Injecting' },
        { id: 'detection', label: 'Running AI Detection Layers', match: 'Detection' },
        { id: 'forensic', label: 'Calculating Forensic Risk Score', match: 'Risk' },
    ];

    const isComplete = logs.some(l => l?.includes && l.includes("REPORT GENERATED"));

    // --- PROGRESS SIMULATION ---
    // Since backend is synchronous (60s+), we simulate progress step-by-step
    // to give feedback, then snap to finish when real response arrives.
    const [simulatedStage, setSimulatedStage] = useState(0);

    useEffect(() => {
        if (isComplete) {
            setSimulatedStage(stages.length); // All Done
            return;
        }

        // Auto-advance step every 12 seconds
        // This roughly matches the 60-70s backend pipeline
        const timer = setInterval(() => {
            setSimulatedStage((prev) => {
                if (prev < stages.length - 1) return prev + 1;
                return prev; // Stay on last step until complete
            });
        }, 90000);

        return () => clearInterval(timer);
    }, [isComplete]);

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-slate-950/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-slate-200 font-semibold flex items-center gap-2">
                        <Loader2 className={`w-4 h-4 text-indigo-500 ${!isComplete ? 'animate-spin' : ''}`} />
                        Simulation Pipeline
                    </h3>
                    <span className="text-xs font-mono text-slate-500">v2.4.0-stable</span>
                </div>

                <div className="p-6 space-y-6">
                    {stages.map((stage, idx) => {
                        // Status Logic
                        let status = 'pending'; // pending, active, completed, error

                        // Error check (Real log)
                        const hasError = logs.some(l => l?.includes && (l.includes("ERROR") || l.includes("FAILED")));

                        if (isComplete) {
                            status = 'completed';
                        } else if (hasError) {
                            // If error, show error at current visual step
                            if (idx === simulatedStage) status = 'error';
                            else if (idx < simulatedStage) status = 'completed';
                        } else {
                            // Standard Progress
                            if (idx < simulatedStage) status = 'completed';
                            else if (idx === simulatedStage) status = 'active';
                            else status = 'pending';
                        }

                        return (
                            <div key={stage.id} className="flex items-center gap-4 group">
                                <div className="relative flex items-center justify-center">
                                    {status === 'completed' && (
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                    {status === 'active' && (
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </div>
                                    )}
                                    {status === 'error' && (
                                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                    )}
                                    {status === 'pending' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700 text-slate-600">
                                            <Circle className="w-5 h-5" />
                                        </div>
                                    )}

                                    {/* Connector Line */}
                                    {idx !== stages.length - 1 && (
                                        <div className={`absolute top-8 w-0.5 h-6 ${status === 'completed' ? 'bg-emerald-900/50' :
                                            status === 'error' ? 'bg-red-900/50' :
                                                'bg-slate-800'
                                            }`} />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p className={`font-medium ${status === 'active' ? 'text-indigo-300' :
                                        status === 'completed' ? 'text-slate-400' :
                                            status === 'error' ? 'text-red-400' :
                                                'text-slate-600'
                                        }`}>
                                        {stage.label}
                                    </p>
                                    {status === 'active' && (
                                        <p className="text-xs text-indigo-400/60 animate-pulse">
                                            Processing phase... ({Math.round((idx + 1) / stages.length * 100)}%)
                                        </p>
                                    )}
                                    {status === 'error' && (
                                        <p className="text-xs text-red-400/60">
                                            Process terminated unexpectedly. Check backend connection.
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default ZKATTConsole;
