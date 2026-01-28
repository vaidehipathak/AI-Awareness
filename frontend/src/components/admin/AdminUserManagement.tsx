import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Search, ChevronLeft, ChevronRight, AlertCircle, RefreshCcw, ShieldCheck, ShieldAlert, UserX, UserCheck, KeyRound, Lock, GripHorizontal, Trash2 } from 'lucide-react';

interface UserData {
    id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    mfa_enabled: boolean;
    last_login: string | null;
    date_joined: string;
}

const AdminUserManagement: React.FC = () => {
    const { token, user: currentUser } = useAuth(); // rename user to avoid conflict
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null); // ID of user being acted upon
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [confirmAction, setConfirmAction] = useState<{ userId: number; action: string; message: string } | null>(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:8000/auth/admin/users/', {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, search: search || undefined }
            });
            setUsers(response.data.results);
            setTotalPages(Math.ceil(response.data.count / 20));
        } catch (err) {
            console.error(err);
            setError('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, token]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const performAction = async (userId: number, action: string) => {
        setActionLoading(userId);
        setError('');
        setSuccessMsg('');

        try {
            const response = await axios.post(`http://localhost:8000/auth/admin/users/${userId}/${action}/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMsg(response.data.message);
            fetchUsers(); // Refresh list to show status changes
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Action failed.');
        } finally {
            setActionLoading(null);
            setConfirmAction(null);
            setTimeout(() => setSuccessMsg(''), 3000); // Clear success msg
        }
    };

    return (
        <>
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200 dark:border-white/10 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                        User Management
                    </h2>
                    <button onClick={fetchUsers} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <RefreshCcw className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {successMsg && (
                    <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" /> {successMsg}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search username or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        />
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">User</th>
                                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Role</th>
                                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Status</th>
                                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">MFA</th>
                                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td></tr>
                            ) : (
                                users.map(user => {
                                    const isSelf = currentUser?.id === user.id;
                                    return (
                                        <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800 dark:text-white">{user.username} {isSelf && "(You)"}</span>
                                                    <span className="text-xs text-slate-400">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-400'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {user.is_active ? (
                                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                                                        <ShieldCheck className="w-4 h-4" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                                                        <ShieldAlert className="w-4 h-4" /> Disabled
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {user.mfa_enabled ? (
                                                    <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 text-sm">
                                                        <Lock className="w-4 h-4" /> Enabled
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-slate-400 text-sm">
                                                        <GripHorizontal className="w-4 h-4" /> Off
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setConfirmAction({ userId: user.id, action: 'toggle_active', message: `Are you sure you want to ${user.is_active ? 'DISABLE' : 'ENABLE'} this user?` })}
                                                        disabled={actionLoading === user.id || isSelf}
                                                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${user.is_active
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40'
                                                            : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40'
                                                            }`}
                                                        title={isSelf ? "Cannot disable yourself" : (user.is_active ? "Disable User" : "Enable User")}
                                                    >
                                                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>

                                                    <button
                                                        onClick={() => setConfirmAction({ userId: user.id, action: 'reset_mfa', message: 'User will be forced to re-enroll MFA on next login.' })}
                                                        disabled={actionLoading === user.id || !user.mfa_enabled}
                                                        className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Reset MFA"
                                                    >
                                                        <KeyRound className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setConfirmAction({ userId: user.id, action: 'delete_user', message: 'DANGER: Are you sure you want to PERMANENTLY DELETE this user?' })}
                                                        disabled={actionLoading === user.id || isSelf}
                                                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title={isSelf ? "Cannot delete yourself" : "Delete User"}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
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

            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-white/10">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-amber-500 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Confirm Action</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{confirmAction.message}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => performAction(confirmAction.userId, confirmAction.action)}
                                disabled={actionLoading === confirmAction.userId}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {actionLoading === confirmAction.userId ? 'Working…' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminUserManagement;
