import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, ShieldCheck, Activity, BrainCircuit, Fingerprint, FileText } from 'lucide-react';

interface AttackCard {
    attack_name: string;
    result: string; // 'DETECTED' | 'BYPASSED'
    risk_impact: string; // 'LOW' | 'MEDIUM' | 'CRITICAL'
    delta_desc: string;
}

interface VerdictData {
    overall_risk_score: number;
    risk_summary: {
        identity_manipulation: string;
        ai_detection_evasion: string;
        deepfake_potential: string;
    };
    attack_cards: AttackCard[];
    delta_message: string;
    actionable_awareness: string[];
    evidence?: {
        original_pdf: string;
        attacked_pdf: string;
    };
}

interface ZKATTVerdictProps {
    data: VerdictData;
}

const ZKATTVerdict: React.FC<ZKATTVerdictProps> = ({ data }) => {
    // Robust default handling
    const safeData = data || {};
    const riskScore = safeData.overall_risk_score || 0;
    const isCritical = riskScore > 70;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">

            {/* Top Analysis Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Forensic Intelligence Reports</h2>
                <div className="flex justify-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><BrainCircuit className="w-4 h-4 text-indigo-400" /> AI Engine Analysis</span>
                    <span className="flex items-center gap-1"><Activity className="w-4 h-4 text-cyan-400" /> Real-time Simulation</span>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Risk Score - Hero Card */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className={`absolute top-0 inset-x-0 h-1 ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6">Aggregate Vulnerability</h3>

                    <div className="relative">
                        <svg className="w-48 h-48 transform -rotate-90">
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                                strokeDasharray={552}
                                strokeDashoffset={552 - (552 * riskScore) / 100}
                                className={`${isCritical ? 'text-rose-500 animate-pulse' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-bold text-white tracking-tighter">{riskScore}</span>
                            <span className="text-sm text-slate-400 font-medium">/ 100</span>
                        </div>
                    </div>

                    <div className={`mt-6 px-4 py-1.5 rounded-full text-sm font-bold border ${isCritical ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                        {isCritical ? "CRITICAL RISK DETECTED" : "MODERATE SAFETY LEVEL"}
                    </div>
                </div>

                {/* 2. Risk Factors Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Insights Panel */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-slate-200 font-semibold mb-6 flex items-center gap-2">
                            <Fingerprint className="w-5 h-5 text-indigo-400" />
                            Key Risk Vectors
                        </h3>
                        <div className="space-y-5">
                            <RiskBar label="Identity Manipulation Potential" level={safeData.risk_summary?.identity_manipulation || 'UNKNOWN'} />
                            <RiskBar label="AI Detection Evasion Capability" level={safeData.risk_summary?.ai_detection_evasion || 'UNKNOWN'} />
                            <RiskBar label="Synthetic Deepfake Reuse" level={safeData.risk_summary?.deepfake_potential || 'UNKNOWN'} />
                        </div>
                    </div>

                    {/* AI Delta Analysis */}
                    <div className="bg-gradient-to-r from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BrainCircuit className="w-24 h-24 text-indigo-400" />
                        </div>
                        <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Forensic AI Insight
                        </h4>
                        <p className="text-slate-300 text-lg leading-relaxed italic">
                            "{safeData.delta_message || "No specific analysis details available."}"
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. Attack Simulation Cards */}
            <div>
                <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" /> Attack Simulation Results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(safeData.attack_cards || []).map((attack, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors">{attack.attack_name}</h4>
                                <Badge level={attack.risk_impact} />
                            </div>

                            <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">
                                {attack.delta_desc}
                            </p>

                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                                {attack.result === 'BYPASSED' ? (
                                    <span className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
                                        <XCircle className="w-4 h-4" /> Vulnerable
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                                        <ShieldCheck className="w-4 h-4" /> Defense Hold
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {(!safeData.attack_cards || safeData.attack_cards.length === 0) && (
                        <div className="col-span-full text-center py-8 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed text-slate-500 italic">
                            No granular attack vectors could be isolated from this simulation run.
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Recommendations */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-950/30 px-6 py-4 border-b border-slate-800">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        Remediation Steps
                    </h3>
                </div>
                <div className="divide-y divide-slate-800">
                    {(safeData.actionable_awareness || []).map((tip, i) => (
                        <div key={i} className="px-6 py-4 flex gap-4 hover:bg-slate-800/20 transition-colors">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                                {i + 1}
                            </span>
                            <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
                        </div>
                    ))}
                    {(!safeData.actionable_awareness || safeData.actionable_awareness.length === 0) && (
                        <div className="px-6 py-8 text-center text-slate-500 italic">
                            No specific remediation steps generated.
                        </div>
                    )}
                </div>
            </div>

            {/* 5. Evidence Downloads */}
            {safeData.evidence && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6 border-t border-slate-800">
                    <a href={safeData.evidence.original_pdf} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        Download Generic Twin
                    </a>
                    <a href={safeData.evidence.attacked_pdf} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-rose-900/20 hover:bg-rose-900/30 text-rose-300 rounded-lg transition-colors border border-rose-800/30">
                        <FileText className="w-5 h-5 text-rose-500" />
                        Download Attacked Variant
                    </a>
                </div>
            )}
        </div>
    );
};

const RiskBar = ({ label, level }: { label: string, level: string }) => {
    let width = '10%';
    let color = 'bg-slate-600';
    if (level === 'LOW') { width = '25%'; color = 'bg-emerald-500'; }
    if (level === 'MEDIUM') { width = '60%'; color = 'bg-yellow-500'; }
    if (level === 'HIGH' || level === 'CRITICAL') { width = '95%'; color = 'bg-rose-500'; }

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs uppercase tracking-wider font-semibold">
                <span className="text-slate-400">{label}</span>
                <span className={level === 'CRITICAL' ? 'text-rose-400' : 'text-slate-400'}>{level}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width }} />
            </div>
        </div>
    );
}

const Badge = ({ level }: { level: string }) => {
    const styles = level === 'CRITICAL' || level === 'HIGH'
        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        : level === 'MEDIUM'
            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${styles}`}>
            {level}
        </span>
    );
}

export default ZKATTVerdict;
