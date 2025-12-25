import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileUp,
  BrainCircuit,
  FileText,
  Lock,
  EyeOff,
  History,
  ScanSearch,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">

      {/* Hero Section */}
      <section className="py-24 md:py-32 px-4 text-center max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
          Trust, verified by intelligence.
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
          Securely analyze documents for AI-generated content, deepfakes, and sensitive information with transparent, privacy-first heuristics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/report')}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium py-3 px-8 rounded-full text-lg transition-colors duration-200"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/awareness-hub')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-3 px-6 text-lg transition-colors duration-200 flex items-center gap-2"
          >
            Learn More <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">How it works</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A simple, three-step process to verify the authenticity and security of your content.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl mb-6">
                <FileUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">1. Upload Report</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
                Securely upload your text, PDF, or image files. Processing happens locally or via secure encrypted channels.
              </p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl mb-6">
                <BrainCircuit className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">2. AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
                Our engines scan for AI-generated patterns, deepfake artifacts, and PII without compromising privacy.
              </p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl mb-6">
                <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">3. Verified Results</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
                Receive a comprehensive, explainable report detailing risk scores and detected anomalies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-gray-200 dark:hover:border-gray-700 transition-colors duration-300">
              <ScanSearch className="w-10 h-10 text-gray-900 dark:text-white mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Deepfake Detection</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                Analyze images for statistical anomalies, metadata inconsistencies, and generation artifacts.
              </p>
            </div>
            <div className="p-8 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-gray-200 dark:hover:border-gray-700 transition-colors duration-300">
              <BookOpen className="w-10 h-10 text-gray-900 dark:text-white mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Cyber Awareness</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                Interactive modules and quizzes designed to educate users on the latest social engineering threats.
              </p>
            </div>
            <div className="p-8 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-gray-200 dark:hover:border-gray-700 transition-colors duration-300">
              <FileText className="w-10 h-10 text-gray-900 dark:text-white mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Detailed Reporting</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                Generate professional-grade PDF reports suitable for compliance and audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 px-4 bg-gray-900 text-white rounded-3xl mx-4 md:mx-8 mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-12">Security by Design</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <Lock className="w-6 h-6 text-gray-400 mb-4" />
              <h4 className="font-medium text-lg mb-2">Secure Encryption</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                All data is encrypted in transit and at rest using industry-standard protocols.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <EyeOff className="w-6 h-6 text-gray-400 mb-4" />
              <h4 className="font-medium text-lg mb-2">Privacy First</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                We detect PII but never store the actual values. Your sensitive data remains yours.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <History className="w-6 h-6 text-gray-400 mb-4" />
              <h4 className="font-medium text-lg mb-2">Full Audit Logs</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Every interaction is logged (without PII) to ensure complete traceability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
          Ready to verify?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-10 text-lg">
          Join thousands of users securing their digital interactions.
        </p>
        <button
          onClick={() => navigate('/report')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-10 rounded-full text-lg shadow-sm hover:shadow-md transition-all duration-200"
        >
          Create Account
        </button>
      </section>

    </div>
  );
};

export default Home;