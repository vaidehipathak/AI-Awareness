import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnalysisResults, { AnalysisResultData } from '../components/AnalysisResults';

interface Metadata {
  source?: string;
  notes?: string;
}

const Report: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<Metadata>({ source: '', notes: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const dragOverRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (selectedFile: File) => {
    const allowedExtensions = ['txt', 'pdf', 'png', 'jpg', 'jpeg'];
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError('This file type is not supported yet.');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = true;
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = false;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = false;
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!isAuthenticated) {
      setError('Please login to submit reports');
      setTimeout(() => {
        navigate('/login', { state: { from: '/report' } });
      }, 1500);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const combinedMetadata = {
        ...metadata,
        run_pii: 'true'
      };

      formData.append('metadata', JSON.stringify(combinedMetadata));

      const token = localStorage.getItem('auth_token');

      const response = await fetch('http://localhost:8000/api/analyze/', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `Server error: ${response.status}`);
        return;
      }

      setResult(data);
      setFile(null);
      setMetadata({ source: '', notes: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error or server is down');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
    setMetadata({ source: '', notes: '' });
  };

  return (
    <div className="container mx-auto max-w-4xl min-h-[calc(100vh-200px)]">

      {!result ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight">
              Start Analysis
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Safe, private AI evaluation for your documents and images.
            </p>
          </div>

          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative group border-2 border-dashed rounded-xl p-12 text-center mb-8 transition-all duration-200
              ${dragOverRef.current
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }
              ${!file ? 'cursor-pointer' : ''}
            `}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".txt,.pdf,.png,.jpg,.jpeg"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            />

            {!file ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Drop your file here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    or click to browse from your device
                  </p>
                </div>
                <div className="flex gap-2 justify-center text-xs text-gray-400 uppercase tracking-wide">
                  <span>PDF</span>
                  <span>•</span>
                  <span>TXT</span>
                  <span>•</span>
                  <span>Images</span>
                </div>
              </div>
            ) : (
              <div className="py-2">
                <div className="w-16 h-16 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xl font-medium text-gray-900 dark:text-white mb-1">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  {formatBytes(file.size)}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 hover:underline"
                >
                  Remove file
                </button>
              </div>
            )}
          </div>

  /* Metadata Fields */
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source Reference
              </label>
              <input
                type="text"
                value={metadata.source || ''}
                onChange={(e) => setMetadata({ ...metadata, source: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="e.g. Email attachment, Social media"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Context Notes
              </label>
              <input
                value={metadata.notes || ''}
                onChange={(e) => setMetadata({ ...metadata, notes: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Brief context..."
              />
            </div>
          </div>


          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className={`
                w-full md:w-auto px-10 py-3.5 rounded-lg text-lg font-semibold text-white transition-all duration-200
                ${!file || loading
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5'
                }
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Run Analysis'
              )}
            </button>
          </div>
        </div>
      ) : (
        <AnalysisResults result={result} onReset={handleReset} />
      )}
    </div>
  );
};

export default Report;