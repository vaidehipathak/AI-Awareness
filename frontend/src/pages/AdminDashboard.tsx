import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchReports = async (page: number = 1) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:9000/api/admin/reports/?page=${page}&page_size=${pageSize}`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setReports(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetail = async (reportId: number) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:9000/api/admin/reports/${reportId}/`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSelectedReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report detail');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: number, newStatus: string) => {
    if (!token) return;
    
    setUpdating(true);
    setUpdateError(null);
    
    try {
      const response = await fetch(
        `http://localhost:9000/api/admin/reports/${reportId}/status/`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSelectedReport(data);
      
      // Update the list to reflect status change
      setReports(
        reports.map((r) =>
          r.report_id === reportId ? { ...r, status: newStatus } : r
        )
      );
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, [token]);

  const getRiskColor = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'LOW':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'MEDIUM':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'HIGH':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'REVIEWED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'FLAGGED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

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

  if (selectedReport) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedReport(null)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Reports
        </button>

        {/* Report Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Report #{selectedReport.report_id}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Submitted by: {selectedReport.submitted_by} at {formatDate(selectedReport.submitted_at)}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedReport.overall_risk)}`}>
                Risk: {selectedReport.overall_risk}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReport.status)}`}>
                {selectedReport.status}
              </span>
            </div>
          </div>
        </div>

        {/* File Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">File Metadata</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">File Name</p>
              <p className="text-gray-900 dark:text-white font-medium break-all">
                {selectedReport.file_metadata.original_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">File Size</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {formatBytes(selectedReport.file_metadata.size_bytes)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Content Type</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {selectedReport.file_metadata.content_type || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {formatDate(selectedReport.file_metadata.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Detector Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detector Results ({selectedReport.detector_results.length})
          </h3>
          <div className="space-y-4">
            {selectedReport.detector_results.map((result, idx) => (
              <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {result.detector_name}
                  </h4>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confidence: {(result.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {result.short_explanation}
                </p>
                {result.flags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.flags.map((flag, fidx) => (
                      <span
                        key={fidx}
                        className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status Update Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Status</h3>
          {updateError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded">
              {updateError}
            </div>
          )}
          <div className="flex gap-2">
            {['PENDING', 'REVIEWED', 'FLAGGED'].map((status) => (
              <button
                key={status}
                onClick={() => updateReportStatus(selectedReport.report_id, status)}
                disabled={updating || selectedReport.status === status}
                className={`px-4 py-2 rounded font-medium transition ${
                  selectedReport.status === status
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Review and manage AI analysis reports</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Reports Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-400">Loading reports...</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">No reports available</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Submitted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    File Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {reports.map((report) => (
                  <tr key={report.report_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{report.report_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {report.submitted_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {report.file_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(report.overall_risk)}`}>
                        {report.overall_risk}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(report.submitted_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => fetchReportDetail(report.report_id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchReports(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchReports(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
