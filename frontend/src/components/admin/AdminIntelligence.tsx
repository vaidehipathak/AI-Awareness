import React from 'react';
import { PieChart, Shield, FileText, Database } from 'lucide-react';

interface IntelligenceProps {
    stats: any;
    loading: boolean;
}

const AdminIntelligence: React.FC<IntelligenceProps> = ({ stats, loading }) => {
    if (loading) return <div className="text-center p-10 text-slate-500">Loading intelligence...</div>;
    if (!stats) return <div className="text-center p-10 text-slate-500">No data available</div>;

    const { risk_distribution, file_type_distribution } = stats;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <Database className="w-6 h-6 text-indigo-500" /> System Intelligence
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Risk Distribution Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-red-500" />
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">Risk Distribution</h3>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(risk_distribution || {}).map(([risk, count]: [string, any]) => (
                            <div key={risk} className="relative">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{risk}</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{count}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${risk === 'HIGH' ? 'bg-red-500' : risk === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                        style={{ width: `${(count / (stats.total_files || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* File Type Distribution Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">File Type Distribution</h3>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(file_type_distribution || {}).map(([type, count]: [string, any]) => (
                            <div key={type} className="relative">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{type}</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{count}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                    <div
                                        className="h-2.5 rounded-full bg-blue-500"
                                        style={{ width: `${(count / (stats.total_files || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminIntelligence;
