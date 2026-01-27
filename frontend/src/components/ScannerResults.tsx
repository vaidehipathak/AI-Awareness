import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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

interface ScannerResultsProps {
    scan: ScanResult;
}

const ScannerResults: React.FC<ScannerResultsProps> = ({ scan }) => {
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

    if (scan.status !== 'completed' || !scan.results) {
        return null; // Or some other fallback, but usage implies completed scan
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-6 rounded-2xl border ${getRiskBgColor(scan.risk_score)}`}>
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">RISK SCORE</div>
                    <div className={`text-4xl font-black ${getRiskColor(scan.risk_score)}`}>
                        {scan.risk_score}/100
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-white/10">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">VULNERABILITIES</div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white">
                        {scan.vulnerability_count}
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-white/10">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">TESTS RUN</div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white">
                        {scan.results.tests ? scan.results.tests.length : 0}
                    </div>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 custom-scrollbar">
                {scan.results.tests && scan.results.tests.map((test: any, index: number) => (
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
    );
};

export default ScannerResults;
