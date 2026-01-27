import React, { useState } from 'react';
import { Shield, Fingerprint, FileText, Sparkles } from 'lucide-react';

interface ZKATTInputProps {
    onInitiate: (description: string, options: any) => void;
    isLoading: boolean;
}

const ZKATTInput: React.FC<ZKATTInputProps> = ({ onInitiate, isLoading }) => {
    const [description, setDescription] = useState('');
    const [piiDensity, setPiiDensity] = useState(50);
    const [visualComplexity, setVisualComplexity] = useState(50);

    const handleSubmit = () => {
        if (!description.trim()) return;
        onInitiate(description, { piiDensity, visualComplexity });
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Main Input Card - Glassmorphism */}
            <div className="bg-white/80 dark:bg-white/5 border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl space-y-8">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Document Description
                    </label>
                    <textarea
                        placeholder="Describe the document (e.g., 'Bank of India statement with transaction table')..."
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 min-h-[160px] text-base text-slate-900 dark:text-slate-200 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-400"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2 text-xs pt-2">
                        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 font-medium">Bank Statement</span>
                        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 font-medium">Medical Bill</span>
                        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 font-medium">Government ID</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PII Density Slider */}
                    <div className="space-y-4 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                                <Fingerprint className="w-5 h-5 text-cyan-500" /> PII Density
                            </label>
                            <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/30 px-3 py-1 rounded-full">
                                {piiDensity}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0" max="100" step="10"
                            value={piiDensity}
                            onChange={(e) => setPiiDensity(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
                        />
                    </div>

                    {/* Visual Complexity Slider */}
                    <div className="space-y-4 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                                <FileText className="w-5 h-5 text-indigo-500" /> Complexity
                            </label>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/30 px-3 py-1 rounded-full">
                                {visualComplexity}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0" max="100" step="10"
                            value={visualComplexity}
                            onChange={(e) => setVisualComplexity(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!description.trim() || isLoading}
                    className="group relative w-full px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                        <Shield className="w-6 h-6" />
                        {isLoading ? 'Initializing...' : 'Launch Simulation'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                <p className="text-center text-xs text-slate-500 dark:text-slate-600">
                    Zero-Knowledge Protocol active. Your description is never stored permanently.
                </p>
            </div>
        </div>
    );
};

export default ZKATTInput;
