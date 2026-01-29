import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Binary,
  Fingerprint,
  Zap // New icon for AI/Perplexity
} from 'lucide-react';

// ... (Interfaces remain the same) ...
interface DetectorFinding {
  type?: 'AI_ANALYSIS' | 'PII_DETECTION' | string;
  score?: number;
  confidence_score?: number;
  label?: string;
  entities?: any[];
  explanation?: string;
  flags?: string[];
  short_explanation?: string;
  risk_label?: string;
  found?: boolean;
  privacy_tips?: string[];
}

export interface AnalysisResultData {
  file_metadata?: {
    name?: string;
    original_name?: string;
    content_type?: string;
    size_bytes?: number;
    file_type?: string;
  };
  detectors_executed?: string[];
  results?: DetectorFinding[];
  risk_label?: string;
  risk_score?: number; // This holds the AI Score from your backend!
  verdict?: string;
}

interface AnalysisResultsProps {
  result: AnalysisResultData;
  onReset: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onReset }) => {

  const finalRiskLabel = result?.risk_label || result.results?.[0]?.label || 'UNKNOWN';
  
  // Keep all results for rendering below, except the wrapper
  const finalResultObject = result.results && result.results.length > 0
    ? result.results.filter(r => r.type?.toUpperCase() !== 'WRAPPER')
    : [];

  // Check for high-risk PII
  const piiDetection = result.results?.find(r => r.type?.toUpperCase() === 'PII_DETECTION');
  const highRiskPII = ['AADHAAR', 'VID', 'PAN', 'CREDIT_DEBIT_CARD', 'CVV', 'BANK_ACCOUNT'];
  const hasHighRiskPII = piiDetection?.entities?.some((e: any) => highRiskPII.includes(e.type)) || false;

  // Extract AI Data (Using overall risk_score as the primary AI indicator for simplicity)
  const aiScore = result.risk_score || 0;
  
  // Find the specific AI_ANALYSIS card for detailed explanation
  const aiAnalysisCard = result.results?.find((r: DetectorFinding) => r.type?.toUpperCase() === 'AI_ANALYSIS');
  
  // Determine AI Label based on score (simplified to match your image's 'Medium Risk' logic)
  const getAILabel = (score: number) => {
      if (score >= 0.8) return 'HIGH'; // Very high risk
      if (score >= 0.5) return 'MEDIUM'; // Medium risk
      return 'LOW';
  }
  const aiLabel = aiAnalysisCard?.label?.toUpperCase() || getAILabel(aiScore);


  // --- HELPER FUNCTION FOR FILE NAME ---
  const getFileName = (metadata?: { name?: string; original_name?: string }) => {
    return metadata?.name ?? metadata?.original_name ?? 'Unknown file';
  };

  const getRiskStyles = (label?: string) => {
    switch (label?.toUpperCase()) {
      case 'LOW':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/10',
          border: 'border-emerald-200 dark:border-emerald-800',
          text: 'text-emerald-800 dark:text-emerald-200',
          icon: <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
          label: 'Low Risk'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/10',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-800 dark:text-amber-200',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
          label: 'Medium Risk'
        };
      case 'HIGH':
        return {
          bg: 'bg-rose-50 dark:bg-rose-900/10',
          border: 'border-rose-200 dark:border-rose-800',
          text: 'text-rose-800 dark:text-rose-200',
          icon: <ShieldCheck className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
          label: 'High Risk'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-200',
          icon: <Binary className="w-6 h-6 text-gray-500" />,
          label: 'Unknown Risk'
        };
    }
  };

  const riskStyle = getRiskStyles(finalRiskLabel);

  const getDetectorIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
      case 'PII_DETECTION':
        return <Fingerprint className="w-5 h-5" />;
      case 'AI_ANALYSIS':
      case 'PDF_TEXT_AI':
        return <FileText className="w-5 h-5" />;
      case 'IMAGE_DEEPFAKE':
        return <ImageIcon className="w-5 h-5" />;
      default:
        return <Binary className="w-5 h-5" />;
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const maskPIIValue = (value: string) => {
    if (!value || value.length <= 4) return value;
    const cleanValue = value.replace(/[\s-]/g, '');
    const last4 = cleanValue.slice(-4);
    const masked = '*'.repeat(Math.max(0, cleanValue.length - 4));
    if (value.includes(' ')) {
      return masked.replace(/(....)/g, '$1 ').trim() + ' ' + last4;
    }
    return masked + last4;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* TOP SUMMARY (Analysis Complete Box) */}
      <div className={`p-6 rounded-xl border ${riskStyle.bg} ${riskStyle.border} flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            {riskStyle.icon}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analysis Complete</h2>
            <p className={`font-medium ${riskStyle.text}`}>
              Overall Assessment: {riskStyle.label}
            </p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {getFileName(result.file_metadata)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {formatBytes(result.file_metadata?.size_bytes)} • {result.file_metadata?.file_type ?? 'N/A'}
          </p>
        </div>
      </div>

      {/* HIGH-RISK PII WARNING (Kept as is) */}
      {hasHighRiskPII && finalRiskLabel === 'HIGH' && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-700 rounded-xl p-6 flex items-start gap-4 animate-pulse">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
              ⚠️ Critical Privacy Warning
            </h3>
            <p className="text-red-800 dark:text-red-200 font-medium mb-3">
              This document contains highly sensitive personal information (Aadhaar, PAN, Bank Details, etc.).
            </p>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
              <li><strong>Do NOT share</strong> this document via email, messaging apps, or cloud storage</li>
              <li><strong>Do NOT upload</strong> to untrusted websites or third-party services</li>
              <li><strong>Store securely</strong> in encrypted folders or password-protected archives</li>
              <li><strong>Delete immediately</strong> if no longer needed</li>
            </ul>
          </div>
        </div>
      )}

      {/* --- NEW AI DETECTION BOX --- */}
      {aiAnalysisCard && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-indigo-200 dark:border-indigo-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-700/50 rounded-lg text-indigo-600 dark:text-indigo-300">
                    <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg capitalize">AI Content Analysis</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                The AI model assessed the content predictability based on language patterns.
            </p>

            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <span className="font-bold text-sm text-gray-700 dark:text-gray-300">AI Risk Score:</span>
                <span className={`text-lg font-black ${aiScore > 0.7 ? 'text-red-500' : aiScore > 0.4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {Math.round(aiScore * 100)}%
                </span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Verdict: {aiAnalysisCard.label || 'N/A'} | {aiAnalysisCard.explanation || aiAnalysisCard.short_explanation || 'Score based on perplexity model.'}
            </p>
        </div>
      )}
      {/* --- END NEW AI DETECTION BOX --- */}

      {/* PII DETECTION BOX (Kept as is) */}
      {piiDetection && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                        <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">PII Detection</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${piiDetection.found ? 'bg-amber-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.round((piiDetection.confidence_score || 1.0) * 100)}%` }} // Using confidence score for PII bar
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {Math.round((piiDetection.confidence_score || 1.0) * 100)}% Confidence
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Found {piiDetection.entities?.length || 0} PII entities.
            </p>

            {piiDetection.entities && piiDetection.entities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
                    Detected PII Entities ({piiDetection.entities.length})
                    </h4>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        {piiDetection.entities.slice(0, 10).map((entity: any, eIdx: number) => (
                            <span key={eIdx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                            {entity.type}: {maskPIIValue(entity.value)}
                            </span>
                        ))}
                        {piiDetection.entities.length > 10 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                            + {piiDetection.entities.length - 10} more
                            </span>
                        )}
                    </div>
                </div>
            )}
            
            {/* Privacy Education */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Privacy Education
                    </h4>
                <ul className="space-y-2">
                    {(piiDetection as any).privacy_tips?.map((tip: string, tIdx: number) => (
                        <li key={tIdx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                        <span>{tip}</span>
                        </li>
                    ))}
                    {(!piiDetection?.privacy_tips || piiDetection.privacy_tips.length === 0) && (
                        <li className="text-sm text-gray-500 dark:text-gray-400">No major privacy risks detected.</li>
                    )}
                </ul>
            </div>
        </div>
      )}

      {/* ACTION */}
      <div className="flex justify-center pt-8">
        <button
          onClick={onReset}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors"
        >
          Analyze Another File
        </button>
      </div>
    </div>
  );
};

export default AnalysisResults;