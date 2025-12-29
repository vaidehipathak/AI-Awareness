
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldAlert,
  FileText,
  Users,
  Activity,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Lock
} from 'lucide-react';
import AdminUserManagement from '../components/admin/AdminUserManagement';

interface ReportListItem {
  report_id: number;
  submitted_at: string;
  submitted_by: string;
  file_type: string;
  overall_risk: string;
  status: string;
}

interface Report {
  report_id: number;
  submitted_at: string;
  submitted_by: string;
  file_type: string;
  file_metadata: {
    file_id: number;
    original_name: string;
    content_type: string;
    size_bytes: number;
    created_at: string;
  };
  detector_results: Array<{
    detector_name: string;
    confidence_score: number;
    flags: string[];
    short_explanation: string;
    full_output: Record<string, any>;
  }>;
  overall_risk: string;
  detectors_executed: string[];
  status: string;
}

interface AuditLog {
  id: number;
  actor: {
    id: number;
    username: string;
    email: string;
  } | null;
  action: string;
  target: string;
  metadata: Record<string, any>;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'audit' | 'users'>('overview');

  // Reports State
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);
  const [currentReportPage, setCurrentReportPage] = useState(1);
  const [totalReportPages, setTotalReportPages] = useState(1);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [currentAuditPage, setCurrentAuditPage] = useState(1);
  const [totalAuditPages, setTotalAuditPages] = useState(1);

  // Stats
  const [stats, setStats] = useState({
    total_files: 0,
    high_risk_count: 0,
    pending_review: 0,
    last_24h_activity: 0,
    lastScan: 'Never' // Keeping this for now, though renderOverview uses last_24h_activity
  });

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [reEnrollLoading, setReEnrollLoading] = useState(false);
  const [reEnrollError, setReEnrollError] = useState<string | null>(null);
  const [showReEnrollConfirm, setShowReEnrollConfirm] = useState(false);

  // --- Helpers ---
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'LOW': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'MEDIUM': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'HIGH': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'REVIEWED': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'FLAGGED': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const renderRiskBadge = (risk: string) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(risk)}`}>
      {risk}
    </span>
  );

  // --- Fetch Data ---
  const fetchStats = async () => {
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:8000/api/admin/stats/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };



  const fetchReports = async (page: number = 1) => {
    if (!token) return;
    setLoadingReports(true);
    try {
      const res = await fetch(`http://localhost:8000/api/admin/reports/?page=${page}&page_size=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReports(data.results || []);
      setTotalReportPages(Math.ceil((data.count || 0) / 20));
      setCurrentReportPage(page);

      // Removed manual stats update as fetchStats is now separate and comprehensive
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchAuditLogs = async (page: number = 1) => {
    if (!token) return;
    setLoadingAudit(true);
    try {
      const res = await fetch(`http://localhost:8000/auth/admin/audit-logs/?page=${page}&page_size=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAuditLogs(data.results || []);
      setTotalAuditPages(Math.ceil((data.count || 0) / 20));
      setCurrentAuditPage(page);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoadingAudit(false);
    }
  };

  const fetchReportDetail = async (reportId: number) => {
    if (!token) return;
    setLoadingReports(true); // Overlay spinner
    try {
      const res = await fetch(`http://localhost:8000/api/admin/reports/${reportId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSelectedReport(data);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Failed to load detail');
    } finally {
      setLoadingReports(false);
    }
  };

  const updateReportStatus = async (reportId: number, newStatus: string) => {
    if (!token) return;
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:8000/api/admin/reports/${reportId}/status/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setSelectedReport(data);
      setReports(reports.map(r => r.report_id === reportId ? { ...r, status: newStatus } : r));
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchReports(1);
    fetchAuditLogs(1);
  }, [token]);

  const handleReEnroll = async () => {
    if (!token) return;
    setReEnrollError(null);
    setReEnrollLoading(true);
    try {
      const res = await fetch('http://localhost:8000/auth/admin/mfa/re-enroll/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.detail || `HTTP ${res.status}`);
      }

      // Persist pending enrollment so OtpEnroll can continue
      sessionStorage.setItem('otp_pending', JSON.stringify({
        stage: 'enroll',
        userId: data.user_id,
        email: data.email,
        tempToken: null,
      }));

      // Clear any cached MFA state for the current user session
      if (user) {
        const updatedUser = { ...user, mfa_enabled: false, mfa_verified: false };
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }

      navigate('/otp-enroll', { replace: true, state: { from: '/admin/dashboard' } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start MFA re-enrollment';
      setReEnrollError(msg);
    } finally {
      setReEnrollLoading(false);
      setShowReEnrollConfirm(false);
    }
  };

  // --- Render Sections ---

  const renderReportsTable = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Analysis Reports</h3>
        {/* Placeholder for filters could go here */}
      </div>

      {loadingReports && !selectedReport ? (
        <div className="p-12 text-center text-gray-500">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No reports found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Report ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User / File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map(report => (
                <tr
                  key={report.report_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => fetchReportDetail(report.report_id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{report.report_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{report.file_type}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{report.submitted_by}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(report.overall_risk)}`}>
                      {report.overall_risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(report.submitted_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">View Details</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalReportPages > 1 && (
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-400">
            Page {currentReportPage} of {totalReportPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); fetchReports(Math.max(1, currentReportPage - 1)); }}
              disabled={currentReportPage === 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); fetchReports(Math.min(totalReportPages, currentReportPage + 1)); }}
              disabled={currentReportPage === totalReportPages}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderAuditLogs = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Audit Logs</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Read-only view of security-critical actions.
        </p>
      </div>

      {loadingAudit ? (
        <div className="p-12 text-center text-gray-500">Loading logs...</div>
      ) : auditLogs.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No logs found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Metadata</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {log.actor?.username || 'System'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {log.target}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination for Audit */}
      {totalAuditPages > 1 && (
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-400">
            Page {currentAuditPage} of {totalAuditPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchAuditLogs(Math.max(1, currentAuditPage - 1))}
              disabled={currentAuditPage === 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => fetchAuditLogs(Math.min(totalAuditPages, currentAuditPage + 1))}
              disabled={currentAuditPage === totalAuditPages}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderDetailModal = () => {
    if (!selectedReport) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Report #{selectedReport.report_id} Detail</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Submitted by {selectedReport.submitted_by} on {formatDate(selectedReport.submitted_at)}
              </p>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Status & Risk Banner */}
            <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Risk Level</span>
                  <span className={`mt-1 inline-flex px-3 py-1 rounded-full text-sm font-bold w-fit ${getRiskColor(selectedReport.overall_risk)}`}>
                    {selectedReport.overall_risk}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Current Status</span>
                  <span className={`mt-1 inline-flex px-3 py-1 rounded-full text-sm font-bold w-fit ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Status Actions */}
                {['PENDING', 'REVIEWED', 'FLAGGED'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateReportStatus(selectedReport.report_id, s)}
                    disabled={updating || selectedReport.status === s}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition ${selectedReport.status === s
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-default'
                      : 'bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* File Info */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> File Metadata
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">File Name</p>
                  <p className="font-medium text-gray-900 dark:text-white truncate" title={selectedReport.file_metadata.original_name}>
                    {selectedReport.file_metadata.original_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Size</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatBytes(selectedReport.file_metadata.size_bytes)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedReport.file_metadata.content_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Uploaded</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedReport.file_metadata.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Detector Results */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" /> Analysis Results
              </h4>
              <div className="space-y-3">
                {selectedReport.detector_results.map((res, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-gray-800 dark:text-gray-200">{res.detector_name}</h5>
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Conf: {(res.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{res.short_explanation}</p>

                    {res.flags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {res.flags.map((flag, fidx) => (
                          <span key={fidx} className="text-xs bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded border border-red-100 dark:border-red-800">
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Show extracted PII counts if available in full_output */}
                    {res.detector_name === 'PII Detector' && res.full_output?.pii_detected && (
                      <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Detected Entities:</span>
                        <div className="grid grid-cols-2 gap-x-4 mt-1">
                          {Object.entries(res.full_output.pii_detected).map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace('_', ' ')}:</span>
                              <span className="font-mono">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 4 Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-4 bottom-4 w-1 bg-blue-500 rounded-r"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Reports</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats?.total_files || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-4 bottom-4 w-1 bg-red-500 rounded-r"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">High Risk</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats?.high_risk_count || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-4 bottom-4 w-1 bg-amber-500 rounded-r"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Review</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats?.pending_review || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-4 bottom-4 w-1 bg-green-500 rounded-r"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Scan</p>
          <div className="mt-1">
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {stats?.last_24h_activity && stats.last_24h_activity > 0 ? "Active recently" : "No recent scans"}
            </p>
            <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Analysis Reports */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Analysis Reports</h2>
          </div>
          <div className="flex-1 overflow-x-auto">
            {/* Re-use table render logic but strictly top 5 or 10 */}
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">FILE / USER</th>
                  <th className="px-6 py-4 font-medium">RISK</th>
                  <th className="px-6 py-4 font-medium">DATE</th>
                  <th className="px-6 py-4 font-medium text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {reports.slice(0, 5).map(report => (
                  <tr key={report.report_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{report.file_type}</div>
                      <div className="text-xs text-slate-500">{report.submitted_by}</div>
                    </td>
                    <td className="px-6 py-4">{renderRiskBadge(report.overall_risk)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(report.submitted_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { fetchReportDetail(report.report_id); }}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No recent reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Security Status & Audit */}
        <div className="space-y-6">
          {/* Security Status Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Your Security Status</h3>

            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600 dark:text-slate-300">MFA Status</span>
              <div className="flex items-center text-green-600 font-medium text-sm">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Enabled & Verified
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-600 dark:text-slate-300">Last Session Cert</span>
              <span className="text-slate-500 text-sm">Active</span>
            </div>

            <button
              onClick={() => setShowReEnrollConfirm(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
            >
              Rotate MFA Keys (Re-enroll) <span className="ml-1">→</span>
            </button>
          </div>

          {/* Recent Audit Logs (Mini) */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Audit Logs</h3>
            <div className="space-y-4">
              {auditLogs.slice(0, 3).map(log => (
                <div key={log.id} className="flex gap-3">
                  <div className="mt-1 min-w-[4px] h-4 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                  <div>
                    <div className="text-xs uppercase font-bold text-slate-500 mb-0.5">{log.action}</div>
                    <div className="text-sm text-slate-800 dark:text-slate-200">
                      <span className="font-medium">{log.actor?.username || 'System'}</span> <span className="text-slate-500">act on</span> {log.target}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{formatDate(log.created_at)}</div>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && <p className="text-sm text-slate-500">No logs found.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Security Control Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Monitor threats, review incidents, and audit system access.
          </p>
        </div>

        {/* Global Error */}
        {(reportError || auditError) && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            <p>{reportError || auditError}</p>
          </div>
        )}

        {reEnrollError && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            <p>{reEnrollError}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'reports'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'audit'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Full Audit Logs
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              User Management
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'reports' && renderReportsTable()}
          {activeTab === 'audit' && renderAuditLogs()}
          {activeTab === 'users' && <AdminUserManagement />}
        </div>

      </div>

      {/* Detail Modal Overlay */}
      {selectedReport && renderDetailModal()}

      {/* Re-enroll Confirmation Modal */}
      {showReEnrollConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Re-enroll MFA?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  This will revoke your current TOTP secret and backup codes. You must scan a new QR and finish MFA setup before continuing.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReEnrollConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReEnroll}
                disabled={reEnrollLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {reEnrollLoading ? 'Revoking…' : 'Confirm & Re-enroll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

