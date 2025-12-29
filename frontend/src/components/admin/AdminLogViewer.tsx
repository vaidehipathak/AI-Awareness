import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, ChevronLeft, ChevronRight, AlertCircle, RefreshCcw } from 'lucide-react';

interface AuditLog {
    id: number;
    actor: {
        id: number;
        username: string;
        email: string;
    } | null;
    action: string;
    target: string;
    metadata: any;
    created_at: string;
}

const AdminLogViewer: React.FC = () => {
    const { token } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:8000/auth/admin/audit-logs/', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page,
                    search: search || undefined,
                    action: actionFilter || undefined
                }
            });
            setLogs(response.data.results);
            setTotalPages(Math.ceil(response.data.count / 20)); // Assuming 20 page size
        } catch (err) {
            console.error(err);
            setError('Failed to fetch logs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter, token]); // Search triggers manually or debounced? Manual for now via button or Enter

    const handleSearchCheck = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchLogs();
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                    System Audit Logs
                </h2>
                <button onClick={fetchLogs} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    <RefreshCcw className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <form onSubmit={handleSearchCheck} className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search user, email, or target..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </form>
                <div className="relative min-w-[200px]">
                    <Filter className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    <select
                        value={actionFilter}
                        onChange={(e) => {
                            setActionFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="">All Actions</option>
                        <option value="LOGIN_SUCCESS">Login Success</option>
                        <option value="LOGIN_FAILED">Login Failed</option>
                        <option value="USER_REGISTERED">User Registered</option>
                        <option value="ACCOUNT_LOCKED">Account Locked</option>
                        <option value="MFA_VERIFIED">MFA Verified</option>
                        <option value="MFA_FAILED">MFA Failed</option>
                        <option value="MFA_ENROLL_STARTED">MFA Enrollment</option>
                        <option value="PASSWORD_RESET_COMPLETED">Password Reset</option>
                        <option value="USER_DISABLED">User Disabled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Time</th>
                            <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Action</th>
                            <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Actor</th>
                            <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Target</th>
                            <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Metadata</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading logs...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={5} className="p-8 text-center text-red-500 flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" />{error}</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No logs found.</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${log.action.includes('SUCCESS') || log.action.includes('VERIFIED') || log.action === 'USER_ENABLED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                log.action.includes('FAILED') || log.action.includes('LOCKED') || log.action === 'USER_DISABLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-700 dark:text-slate-200">
                                        {log.actor ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium">{log.actor.username}</span>
                                                <span className="text-xs text-slate-400">{log.actor.email}</span>
                                            </div>
                                        ) : <span className="text-slate-400 italic">System / Unknown</span>}
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono text-xs">
                                        {log.target || '-'}
                                    </td>
                                    <td className="p-4 text-xs text-slate-500 font-mono max-w-xs break-all">
                                        {JSON.stringify(log.metadata)}
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

export default AdminLogViewer;
