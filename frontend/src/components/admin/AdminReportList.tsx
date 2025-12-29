import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCcw, FileText, Eye } from 'lucide-react';

interface FileMetadata {
    original_name: string;
}

interface Report {
    report_id: number;
    submitted_at: string;
    submitted_by: string;
    file_type: string;
    file_metadata: FileMetadata;
    overall_risk: string;
    status: string;
}

const AdminReportList: React.FC<{ onViewDetail: (id: number) => void }> = ({ onViewDetail }) => {
    const { token } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [search, setSearch] = useState('');
    const [riskFilter, setRiskFilter] = useState('');
    const [sort, setSort] = useState('date_desc');

    const fetchReports = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:8000/api/admin/reports/', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page,
                    search: search || undefined,
                    risk: riskFilter || undefined,
                    sort: sort || undefined
                }
            });
            setReports(response.data.results);
            setTotalPages(Math.ceil(response.data.count / 20));
        } catch (err) {
            console.error(err);
            setError('Failed to fetch reports.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchReports();
        }, 300); // 300ms debounce for search
        return () => clearTimeout(timeoutId);
    }, [page, token, search, riskFilter, sort]);

    const handleSearchCheck = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchReports(); // Trigger immediate
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'HIGH': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'LOW': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                    All Analysis Reports
                </h2>
                <button onClick={fetchReports} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    <RefreshCcw className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search file, username, or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        value={riskFilter}
                        onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                        <option value="">All Risks</option>
                        <option value="HIGH">High Risk</option>
                        <option value="MEDIUM">Medium Risk</option>
                        <option value="LOW">Low Risk</option>
                    </select>
                </div>
                <div className="w-full md:w-48">
                    <select
                        value={sort}
                        onChange={(e) => { setSort(e.target.value); setPage(1); }}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                        <option value="date_desc">Newest First</option>
                        <option value="date_asc">Oldest First</option>
                        <option value="risk_desc">Risk (High-Low)</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">File / User</th>
                            <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Risk</th>
                            <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Date</th>
                            <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Status</th>
                            <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading reports...</td></tr>
                        ) : reports.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No reports found.</td></tr>
                        ) : (
                            reports.map(report => (
                                <tr key={report.report_id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => onViewDetail(report.report_id)}>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={report.file_metadata.original_name}>
                                                {report.file_metadata.original_name}
                                            </span>
                                            <span className="text-xs text-slate-400">{report.submitted_by}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getRiskColor(report.overall_risk)}`}>
                                            {report.overall_risk}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                        {new Date(report.submitted_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-medium uppercase text-slate-500">
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
            </div>
        </div>
    );
};

export default AdminReportList;
