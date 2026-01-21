import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnalysisResults, { AnalysisResultData } from '../components/AnalysisResults';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, FileImage, Video, Shield, FileSearch, CheckCircle, ScanSearch, FileUp, X, AlertCircle, Loader2, Scan } from 'lucide-react';

interface Metadata {
  source?: string;
  notes?: string;
}

type ToolType = 'PII' | 'IMAGE' | 'VIDEO' | 'PDF' | null;

const Report: React.FC = () => {
  const { logout } = useAuth(); // removed isAuthenticated unused var check if needed
  const navigate = useNavigate();

  const [activeTool, setActiveTool] = useState<ToolType>(null);
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
    // Validate file type based on active tool
    if (activeTool === 'IMAGE' && !selectedFile.type.startsWith('image/')) {
      setError("Please upload an image file (JPG, PNG).");
      return;
    }
    if (activeTool === 'VIDEO' && !selectedFile.type.startsWith('video/')) {
      setError("Please upload a video file (MP4, AVI).");
      return;
    }
    if ((activeTool === 'PII' || activeTool === 'PDF') &&
      selectedFile.type !== 'application/pdf' &&
      selectedFile.type !== 'text/plain' &&
      !selectedFile.type.startsWith('image/')) {
      setError("Please upload a document (PDF, TXT) or image (JPG, PNG).");
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

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (metadata.source || metadata.notes) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const token = localStorage.getItem('auth_token');

      const response = await fetch('http://localhost:8000/api/analyze/', {
        method: 'POST',
        headers: {
          // Send token if we have it
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        setError('This feature currently requires an account. Please login to continue.');
        setTimeout(() => {
          navigate('/login', { state: { from: '/report' } });
        }, 2000);
        return;
      }

      if (!response.ok) {
        setError(data?.error || `Server error: ${response.status}`);
        return;
      }

      // Handle Result Formats
      let analysisResult: AnalysisResultData | null = null;
      if (Array.isArray(data?.results) && data.results.length > 0 && data.results[0]?.results) {
        analysisResult = data.results[0];
      } else {
        analysisResult = data;
      }

      // Inject file metadata if missing
      if (file && analysisResult) {
        analysisResult.file_metadata = {
          name: file.name,
          original_name: file.name,
          size_bytes: file.size,
          file_type: file.type || 'N/A',
        };
      }

      setResult(analysisResult);
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

  const handleBackToMenu = () => {
    handleReset();
    setActiveTool(null);
  };

  // --- RENDER HELPERS ---

  const getToolConfig = () => {
    switch (activeTool) {
      case 'PII': return { title: 'PII Detection', accept: '.pdf,.txt,.jpg,.jpeg,.png', icon: Shield, desc: 'Scans documents and images for sensitive personal information.' };
      case 'IMAGE': return { title: 'AI Image Detector', accept: 'image/*', icon: FileImage, desc: 'Analyzes images for synthetic generation markers.' };
      case 'VIDEO': return { title: 'Deepfake Analysis', accept: 'video/*', icon: Video, desc: 'Examines video frames for facial manipulation.' };
      case 'PDF': return { title: 'PDF Forensics', accept: '.pdf', icon: FileSearch, desc: 'Detailed metadata and structural analysis of PDFs.' };
      default: return { title: 'Upload', accept: '*', icon: Upload, desc: '' };
    }
  };

  const toolConfig = getToolConfig();

  // --- MAIN RENDER ---

  // 1. MENU VIEW
  if (!activeTool && !result) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Detection Tools</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select a specialized tool to verify content authenticity and safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* PII Card */}
          <motion.div whileHover={{ y: -5 }} onClick={() => setActiveTool('PII')} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 cursor-pointer group hover:border-green-500 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield size={100} />
            </div>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center mb-6">
              <FileText size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">PII Detection</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Scan documents (PDF, Text) for personally identifiable information risks.</p>
            <ul className="text-sm text-gray-500 space-y-2 mb-6">
              <li className="flex gap-2"><CheckCircle size={16} className="text-green-500" /> Emails & Phones</li>
              <li className="flex gap-2"><CheckCircle size={16} className="text-green-500" /> Social Security / Govt IDs</li>
            </ul>
            <span className="text-green-600 font-bold flex items-center gap-2">Start Scan <Scan size={16} /></span>
          </motion.div>

          {/* Image Card */}
          <motion.div whileHover={{ y: -5 }} onClick={() => setActiveTool('IMAGE')} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 cursor-pointer group hover:border-blue-500 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileImage size={100} />
            </div>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <ScanSearch size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Image Detector</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Analyze images to determine if they were generated by AI (Midjourney, DALL-E).</p>
            <ul className="text-sm text-gray-500 space-y-2 mb-6">
              <li className="flex gap-2"><CheckCircle size={16} className="text-blue-500" /> Synthetic Pattern Analysis</li>
              <li className="flex gap-2"><CheckCircle size={16} className="text-blue-500" /> Generation Likelihood Score</li>
            </ul>
            <span className="text-blue-600 font-bold flex items-center gap-2">Start Scan <Scan size={16} /></span>
          </motion.div>

          {/* Video Card */}
          <motion.div whileHover={{ y: -5 }} onClick={() => setActiveTool('VIDEO')} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 cursor-pointer group hover:border-red-500 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Video size={100} />
            </div>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Deepfake Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Advanced forensic scanning of videos to detect face manipulation and deepfakes.</p>
            <ul className="text-sm text-gray-500 space-y-2 mb-6">
              <li className="flex gap-2"><CheckCircle size={16} className="text-red-500" /> Frame-by-Frame Inspection</li>
              <li className="flex gap-2"><CheckCircle size={16} className="text-red-500" /> Face Swapping Detection</li>
            </ul>
            <span className="text-red-600 font-bold flex items-center gap-2">Start Scan <Scan size={16} /></span>
          </motion.div>

          {/* PDF Forensics Card */}
          <motion.div whileHover={{ y: -5 }} onClick={() => setActiveTool('PDF')} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 cursor-pointer group hover:border-indigo-500 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileSearch size={100} />
            </div>
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <FileUp size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">PDF Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Deep inspection of PDF structures, metadata, and embedded hidden content.</p>
            <ul className="text-sm text-gray-500 space-y-2 mb-6">
              <li className="flex gap-2"><CheckCircle size={16} className="text-indigo-500" /> Metadata Extraction</li>
              <li className="flex gap-2"><CheckCircle size={16} className="text-indigo-500" /> Suspicious Link Detection</li>
            </ul>
            <span className="text-indigo-600 font-bold flex items-center gap-2">Start Scan <Scan size={16} /></span>
          </motion.div>
        </div>
      </div>
    );
  }

  // 2. UPLOAD VIEW (Specific Tool)
  if (!result) {
    return (
      <div className="container mx-auto max-w-3xl min-h-[calc(100vh-200px)] pt-6">
        <button onClick={handleBackToMenu} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-medium">
          <X size={20} /> Cancel / Back to Tools
        </button>

        <motion.div
          key="upload-form"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 md:p-12"
        >
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
            <div className={`p-3 rounded-xl ${activeTool === 'PII' ? 'bg-green-100 text-green-600' : activeTool === 'IMAGE' ? 'bg-blue-100 text-blue-600' : activeTool === 'VIDEO' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
              <toolConfig.icon size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{toolConfig.title}</h1>
              <p className="text-gray-500">{toolConfig.desc}</p>
            </div>
          </div>

          {/* File Upload Area */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                relative group border border-dashed rounded-3xl p-16 text-center mb-8 transition-all duration-300 overflow-hidden
                ${dragOverRef.current
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-blue-50/30'
              }
                ${!file ? 'cursor-pointer' : ''}
              `}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={toolConfig.accept}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            />

            {!file ? (
              <div className="space-y-6 relative z-10">
                <div className="w-20 h-20 mx-auto bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Upload {activeTool === 'IMAGE' ? 'Image' : activeTool === 'VIDEO' ? 'Video' : 'Document'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-2 uppercase tracking-wide">
                    {toolConfig.accept.replace(/[.]/g, ' ').toUpperCase()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 relative z-10">
                <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4 text-white shadow-lg">
                  <toolConfig.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate px-4">
                  {file.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6 rounded-full">
                  {formatBytes(file.size)}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                >
                  Change File
                </button>
              </div>
            )}
          </motion.div>

          {/* Metadata Inputs (Added from conflict resolution) */}
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
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3 overflow-hidden"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className={`
                  w-full py-4 rounded-xl text-lg font-bold text-white transition-all duration-200
                  ${!file || loading
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg'
                }
                `}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" /> Analyzing...
                </div>
              ) : (
                'Run Analysis'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. RESULTS VIEW
  return (
    <div className="container mx-auto max-w-4xl min-h-[calc(100vh-200px)] pt-6">
      <button onClick={handleReset} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-medium">
        <X size={20} /> Scan Another File
      </button>
      <motion.div
        key="results"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AnalysisResults result={result} onReset={handleReset} />
      </motion.div>
    </div>
  );
};

export default Report;
