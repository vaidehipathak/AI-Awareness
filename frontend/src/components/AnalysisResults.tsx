import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Binary,
  ChevronDown,
  ChevronUp,
  Fingerprint
} from 'lucide-react';

// --- UPDATED INTERFACES ---
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
  risk_score?: number;
  verdict?: string;
}

interface AnalysisResultsProps {
  result: AnalysisResultData;
  onReset: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onReset }) => {
  console.log('FULL RESULT FROM BACKEND:', result);

  const [showDetails, setShowDetails] = useState(false);

  const finalRiskLabel = result?.risk_label || result.results?.[0]?.label || 'UNKNOWN';
  const finalResultObject = result.results && result.results.length > 0 ? result.results : [];

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* TOP SUMMARY */}
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

      {/* DETECTORS */}
      <div className="grid gap-6">
        {finalResultObject.length > 0 ? (
          finalResultObject.map((detector: DetectorFinding, idx: number) => {
            let confidence: number;
            let explanationText = detector.explanation ?? detector.short_explanation ?? 'No details available.';
            let riskLabel = detector.risk_label;

            if (detector.type?.toUpperCase() === 'PII_DETECTION') {
              const entitiesFound = Array.isArray(detector.entities) && detector.entities.length > 0;
              confidence = entitiesFound ? 1.0 : 0.0;
              explanationText = `PII found: ${entitiesFound ? 'Yes' : 'No'}. ${detector.explanation || ''}`.replace(/PII found: Yes\./, '').trim();
              riskLabel = entitiesFound ? 'HIGH' : 'LOW';
            } else if (detector.type?.toUpperCase() === 'AI_ANALYSIS') {
              confidence = detector.score ?? 0;
              explanationText = `AI Verdict: ${detector.label}. ${detector.explanation || ''}`;
              riskLabel = detector.label?.toUpperCase() || 'LOW';
            } else {
              confidence = detector.confidence_score ?? 0;
            }

            return (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                      {getDetectorIcon(detector.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg capitalize">
                        {(detector.type ?? 'unknown_detector').replace(/_/g, ' ').replace('Pdf text ai', 'AI/PII Analysis')}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${confidence > 0.7 ? 'bg-amber-500' : confidence > 0.2 ? 'bg-blue-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.round(confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {Math.round(confidence * 100)}% Confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {explanationText}
                </p>

                {detector.type?.toUpperCase() === 'PII_DETECTION' && Array.isArray(detector.entities) && detector.entities.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
                      Detected PII Entities ({detector.entities.length})
                    </h4>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                      {detector.entities.slice(0, 10).map((entity: any, eIdx: number) => (
                        <span key={eIdx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                          {entity.type}: {entity.value.substring(0, 20)}...
                        </span>
                      ))}
                      {detector.entities.length > 10 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          + {detector.entities.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {detector.flags && detector.flags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {detector.flags.map((flag, fIdx) => (
                      <span key={fIdx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {flag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No detectors were executed or no results available.
          </p>
        )}
      </div>

      {/* TECH DETAILS */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showDetails ? 'Hide Technical Details' : 'View Technical Details'}
        </button>

        {showDetails && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </div>
        )}
      </div>

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
