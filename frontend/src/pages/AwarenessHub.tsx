import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from 'next-themes';
import {
  Brain, Lock, Fingerprint, Eye, Shield, Gamepad2,
  Search, AlertTriangle, X, CheckCircle, XCircle, RotateCcw, Lightbulb, Zap, Plus, Settings,
  ArrowRight, BookOpen, ChevronRight, GraduationCap
} from 'lucide-react';

import AdminActionButtons from '../components/admin/AdminActionButtons';
import ContentEditModal from '../components/admin/ContentEditModal';

// --- DATA STRUCTURES & CONTENT ---

type Quiz = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  id?: number;
};

type LearningModule = {
  info: {
    title: string;
    summary: string;
    points: { title: string; detail: string }[];
  };
  quiz: Quiz;
};

type Resource = {
  id: number;
  is_active: boolean;
  title: string;
  category: 'AI Basics' | 'Privacy & Data' | 'AI Threats' | 'Digital Safety' | 'Interactive Scenarios' | string;
  teaser: string;
  icon: React.ElementType;
  color: string;
  finalAction: string;
  learningModules: LearningModule[];
};

// --- COMPONENTS ---

const QuizComponent = ({ quiz, onCorrectAnswer }: { quiz: Quiz; onCorrectAnswer: () => void }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shake, setShake] = useState(false);

  const isCorrect = isAnswered && selectedAnswer === quiz.correctAnswerIndex;

  const handleAnswerClick = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === quiz.correctAnswerIndex) {
      setTimeout(() => {
        onCorrectAnswer();
      }, 2000); // Longer delay to enjoy the success animation
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShake(false);
  };

  const getButtonClass = (index: number) => {
    const base = "w-full text-left p-5 rounded-xl font-bold border-2 transition-all duration-200 relative overflow-hidden group ";

    if (!isAnswered) {
      return base + "bg-white dark:bg-slate-800 border-black dark:border-white text-black dark:text-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]";
    }
    if (index === quiz.correctAnswerIndex) {
      return base + "bg-green-400 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-[1.02] z-10";
    }
    if (index === selectedAnswer) {
      return base + "bg-red-400 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
    }
    return base + "bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-gray-700 opacity-50 grayscale";
  };

  return (
    <div className="mt-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative overflow-visible"
      >
        {/* Comic Badge */}
        <div className="absolute -top-6 -left-4 bg-yellow-400 border-4 border-black text-black font-black px-4 py-2 rotate-[-6deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20">
          BRAIN TEASER!
        </div>

        <div className="flex items-start gap-5 mb-8 mt-2">
          <h4 className="font-black text-2xl md:text-3xl text-black dark:text-white leading-tight uppercase tracking-tight">
            {quiz.question}
          </h4>
        </div>

        <div className="space-y-4">
          {quiz.options && quiz.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleAnswerClick(index)}
              className={getButtonClass(index)}
              disabled={isAnswered}
              animate={isAnswered && index === selectedAnswer && index !== quiz.correctAnswerIndex && shake ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <div className="flex items-center justify-between relative z-10">
                <span className="text-lg">{option}</span>
                {isAnswered && (
                  <div className="ml-3 shrink-0">
                    {index === quiz.correctAnswerIndex ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1.5, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        <div className="bg-white border-2 border-black rounded-full p-1 text-green-600">
                          <CheckCircle size={24} strokeWidth={4} />
                        </div>
                      </motion.div>
                    ) : index === selectedAnswer ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.2 }}
                      >
                        <div className="bg-white border-2 border-black rounded-full p-1 text-red-600">
                          <XCircle size={24} strokeWidth={4} />
                        </div>
                      </motion.div>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.9 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              className={`mt-6 pt-6 border-t-4 border-black dark:border-white ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            >
              {isCorrect ? (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center text-center p-4 bg-green-100 dark:bg-green-900/30 border-4 border-green-500 rounded-2xl"
                >
                  <h3 className="text-4xl font-black uppercase mb-2 animate-bounce">NAILED IT!</h3>
                  <p className="font-bold text-black dark:text-white">{quiz.explanation}</p>
                </motion.div>
              ) : (
                <div className="flex items-start gap-4 p-4 rounded-xl bg-red-100 dark:bg-red-900/30 border-4 border-red-500">
                  <AlertTriangle className="w-8 h-8 text-red-600 shrink-0 stroke-[3px]" />
                  <div className="flex-1">
                    <span className="text-xl font-black text-red-600 uppercase tracking-wider mb-1 block">OOPS!</span>
                    <p className="font-bold text-black dark:text-white">{quiz.explanation}</p>
                    <button
                      onClick={resetQuiz}
                      className="mt-4 px-6 py-2 bg-black text-white font-bold uppercase rounded-lg shadow-[4px_4px_0px_0px_rgba(255,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const ResourceCard = ({ resource, onClick, onUpdate, isLocked, isCompleted }: { resource: Resource; onClick: () => void; onUpdate: () => void; isLocked: boolean; isCompleted: boolean }) => {
  const IconComponent = resource.icon || Brain;
  const gradientClass = isLocked ? 'bg-gray-400' : `bg-gradient-to-br ${resource.color}`;

  const handleClick = () => {
    if (!isLocked) {
      onClick();
    }
  };

  return (
    <motion.div
      layoutId={isLocked ? undefined : `card-container-${resource.id}`}
      whileHover={!isLocked ? { y: -8, rotate: 1 } : {}}
      className={`group relative h-full flex flex-col ${isLocked ? 'opacity-70 grayscale cursor-not-allowed' : ''}`}
    >
      <div
        onClick={handleClick}
        className={`relative h-full bg-white dark:bg-slate-900 border-4 border-black dark:border-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] ${!isLocked ? 'hover:shadow-[12px_12px_0px_0px_rgba(var(--primary),1)] cursor-pointer' : ''} transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Halftone Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-black to-transparent bg-[length:4px_4px] pointer-events-none" />

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-gray-200/50 dark:bg-black/50 backdrop-blur-[2px] z-30 flex items-center justify-center">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-full border-4 border-black dark:border-white shadow-xl">
              <Lock className="w-10 h-10 text-gray-500" />
            </div>
          </div>
        )}

        {/* Completed Badge */}
        {isCompleted && !isLocked && (
          <div className="absolute top-4 right-16 z-20">
            <div className="bg-green-500 text-white p-2 rounded-full border-2 border-black shadow-md">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* Admin Controls */}
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <AdminActionButtons item={resource} contentType="awareness" onUpdate={onUpdate} />
        </div>

        <div className="p-8 flex-grow flex flex-col relative z-20">
          <div className="flex items-start justify-between mb-6">
            <div className={`p-4 rounded-xl ${gradientClass} text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black`}>
              <IconComponent className="w-8 h-8" strokeWidth={3} />
            </div>
            {!resource.is_active && (
              <span className="px-3 py-1 bg-red-100 border-2 border-red-500 text-red-600 text-xs font-black uppercase tracking-wider rounded-md -rotate-6">
                Draft
              </span>
            )}

            {/* Category Pill */}
            <span className="absolute top-8 right-8 text-[10px] font-black tracking-widest uppercase text-black/50 dark:text-white/50 border-b-2 border-black/10 dark:border-white/10 pb-1">
              {resource.category}
            </span>
          </div>

          <div className="mb-4 mt-2">
            <h3 className="text-3xl font-black text-black dark:text-white leading-[0.9] uppercase tracking-tighter mb-2">
              {resource.title}
            </h3>
            <div className={`h-2 w-16 ${gradientClass} rounded-full`} />
          </div>

          <p className="text-gray-700 dark:text-gray-300 font-bold text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
            {resource.teaser}
          </p>

          <div className={`flex items-center text-sm font-black text-black dark:text-white uppercase tracking-widest mt-auto ${!isLocked ? 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400' : 'text-gray-400'} transition-colors`}>
            {isLocked ? 'Locked' : 'Start Mission'} <ArrowRight className={`w-5 h-5 ml-2 ${!isLocked ? 'group-hover:translate-x-2' : ''} transition-transform stroke-[3px]`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ResourceModal = ({ resource, onClose, onComplete }: { resource: Resource | null; onClose: () => void; onComplete: (id: number) => void }) => {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  React.useEffect(() => {
    if (resource) {
      setCurrentModuleIndex(0);
    }
  }, [resource]);

  if (!resource) return null;

  const IconComponent = resource.icon || Brain;
  const modules = resource.learningModules || [];
  const currentModule = modules[currentModuleIndex];
  const isCompleted = currentModuleIndex >= modules.length;

  const handleCorrectAnswer = () => {
    setCurrentModuleIndex(prev => prev + 1);
  };

  return (
    <AnimatePresence>
      {resource && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            layoutId={`card-container-${resource.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 max-h-full flex flex-col overflow-hidden relative"
          >
            {/* Background Gradients */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b ${resource.color} opacity-10 blur-[100px] -z-10 pointer-events-none`} />

            {/* Header */}
            <div className="relative p-6 md:p-10 border-b border-gray-100 dark:border-white/10 flex items-start justify-between bg-white/50 dark:bg-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${resource.color} text-white shadow-lg`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                    {resource.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    {modules.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index <= currentModuleIndex ? 'w-8 bg-indigo-500' : 'w-2 bg-gray-200 dark:bg-white/10'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-black/20">
              <AnimatePresence mode="wait">
                {!isCompleted && currentModule ? (
                  <motion.div
                    key={currentModuleIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                  >
                    {/* Learn Section */}
                    <div className="space-y-8">
                      <div>
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3 block pl-1">
                          Mission Phase {currentModuleIndex + 1} of {modules.length}
                        </span>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                          {currentModule.info.title}
                        </h3>
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                          {currentModule.info.summary}
                        </p>
                      </div>

                      <div className="grid gap-4">
                        {currentModule.info.points.map((point, index) => (
                          <div
                            key={index}
                            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm"
                          >
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2 text-lg">
                              <div className="w-2 h-2 rounded-full bg-indigo-500" />
                              {point.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 pl-5 mt-1 leading-relaxed whitespace-pre-line">
                              {point.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quiz Section */}
                    <div className="relative">
                      <div className="absolute top-0 right-10 -mt-6">
                        <div className="px-4 py-1.5 bg-indigo-500 text-white text-xs font-bold rounded-full shadow-lg shadow-indigo-500/30 tracking-wider uppercase">
                          Knowledge Check
                        </div>
                      </div>
                      <QuizComponent quiz={currentModule.quiz} onCorrectAnswer={handleCorrectAnswer} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="completion"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 max-w-2xl mx-auto"
                  >
                    <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                      <CheckCircle className="w-12 h-12" strokeWidth={3} />
                    </div>

                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                      Mission Complete!
                    </h3>

                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-8 mb-10 shadow-lg">
                      <p className="text-xl font-medium text-indigo-600 dark:text-indigo-400 italic">
                        "{resource.finalAction}"
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (resource?.id) onComplete(resource.id);
                        onClose();
                      }}
                      className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                    >
                      Complete & Close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Icon Mapping
const ICON_MAP: any = {
  Brain, Lock, Fingerprint, Eye, Shield, Gamepad2, Search, AlertTriangle, X, CheckCircle, XCircle, RotateCcw, Lightbulb, Zap
};

const STATIC_TOPICS: Resource[] = [
  // AI Safety & Misuse
  {
    id: 9001,
    is_active: true,
    title: "Safety Rails 101",
    category: "AI Safety & Misuse",
    teaser: "Understand the guardrails that keep AI outputs safe and appropriate.",
    icon: Shield,
    color: "from-blue-500 via-indigo-500 to-purple-500",
    finalAction: "Ship with safety on by default and monitor continuously.",
    learningModules: [
      {
        info: {
          title: "Why safety layers matter",
          summary: "Guardrails, filters, and policies work together to prevent harmful or off-policy outputs.",
          points: [
            { title: "Defense in depth", detail: "A robust AI security strategy relies on multiple overlapping layers of protection. This overlapping approach ensures that if one layer fails, others are there to catch the issue.\n\n• Implement strict system prompts to guide behavior\n• Use real-time moderation APIs to filter inputs\n• Apply output parsing checks to catch policy violations" },
            { title: "Fail closed", detail: "In security engineering, failing securely means the system defaults to denying access or blocking an action when an unexpected error occurs. This prevents malicious prompts from bypassing filters.\n\n• Always block the response if a safety check times out\n• Provide a generic, safe error message to the user\n• Ensure fallback mechanisms don't bypass core restrictions" },
            { title: "Visibility", detail: "You cannot secure what you cannot see. Maintaining comprehensive logs of all safety triggers is essential for continually improving the system and identifying coordinated attacks.\n\n• Log all triggered safety rules and moderation flags\n• Monitor for repeated violations from specific user IDs or IPs\n• Use analytics to refine false positive and negative rates" }
          ]
        },
        quiz: {
          question: "When a safety component crashes or times out, what should the AI system do?",
          options: ["Bypass the filter to ensure the user gets an answer", "Fail closed by blocking the response and logging the error", "Retry indefinitely until the safety check responds", "Return a partial response to salvage the request"],
          correctAnswerIndex: 1,
          explanation: "Failing closed ensures that unanticipated errors don't result in harmful outputs being served to the user."
        }
      }
    ]
  },
  {
    id: 9002,
    is_active: true,
    title: "Rate Limits & Abuse",
    category: "AI Safety & Misuse",
    teaser: "Rate limits and anomaly detection reduce scripted abuse and model scraping.",
    icon: AlertTriangle,
    color: "from-amber-500 via-orange-500 to-red-500",
    finalAction: "Throttle aggressively on suspicious bursts and review patterns weekly.",
    learningModules: [
      {
        info: {
          title: "Signals of misuse",
          summary: "High-volume, repetitive, or adversarial prompts often signal scraping or abuse attempts.",
          points: [
            { title: "Volume anomalies", detail: "Spikes from a single key or IP are high-risk indicators of automated abuse or scraping.\n\n• Monitor for unusually high request volumes over short periods\n• Implement dynamic rate limiting that scales with suspicious activity\n• Alert administrators when usage thresholds are dramatically exceeded" },
            { title: "Repeated probes", detail: "Similar prompts aiming to bypass filters are red flags indicating adversarial probing.\n\n• Track repetitive patterns of blocked requests\n• Implement cumulative penalties for repeated policy violations\n• Use anomaly detection to spot subtle prompt injection attempts" },
            { title: "Mitigations", detail: "Employing multiple layers of friction can significantly deter both automated bots and attackers.\n\n• Deploy CAPTCHAs for suspicious or high-velocity traffic\n• Maintain dynamic blocklists for known malicious IP addresses\n• Require re-authentication for sensitive actions when anomalies are detected" }
          ]
        },
        quiz: {
          question: "A single key suddenly sends 100× more requests than usual. Best first step?",
          options: ["Disable logging", "Raise temperature", "Apply tighter rate limits and investigate", "Ignore it"],
          correctAnswerIndex: 2,
          explanation: "Spike + key concentration suggests abuse; throttle and inspect."
        }
      }
    ]
  },
  {
    id: 9003,
    is_active: true,
    title: "Human Review Moments",
    category: "AI Safety & Misuse",
    teaser: "Some actions need a human checkpoint before execution.",
    icon: Lightbulb,
    color: "from-teal-500 via-cyan-500 to-blue-500",
    finalAction: "Require approvals for high-impact actions like sends, publishes, or payments.",
    learningModules: [
      {
        info: {
          title: "When to keep a human in the loop",
          summary: "High-stakes tasks (sending, publishing, deleting) benefit from human oversight.",
          points: [
            { title: "Critical scope", detail: "High-impact actions that affect external users or core systems should never be fully automated without human oversight.\n\n• Require manual approval before sending mass communications\n• Establish review gates for automated code deployments\n• Ensure financial transactions trigger a human verification step" },
            { title: "Context gaps", detail: "AI models operate purely on data and lack human intuition to understand complex cultural, emotional, or strategic nuances.\n\n• Have humans review AI decisions in highly sensitive contexts\n• Establish feedback loops where human reviewers correct model errors\n• Use AI to suggest actions, but let humans make the final call" },
            { title: "Clear UX", detail: "Transparency in the user interface helps manage expectations and builds trust in AI-assisted processes.\n\n• Clearly label system actions that are pending human review\n• Provide estimated review times for automated requests\n• Explain the specific safety reasons behind the required approval" }
          ]
        },
        quiz: {
          question: "Which task most needs human review?",
          options: ["Suggesting a headline", "Auto-sending invoices", "Counting words", "Sorting tags"],
          correctAnswerIndex: 1,
          explanation: "Sending invoices is high impact; keep a human approval step."
        }
      }
    ]
  },
  // AI Bias & Fairness
  {
    id: 9010,
    is_active: true,
    title: "Spotting Skewed Data",
    category: "AI Bias & Fairness",
    teaser: "Uneven data leads to uneven outcomes—learn to spot it early.",
    icon: Eye,
    color: "from-emerald-500 via-teal-500 to-cyan-500",
    finalAction: "Audit datasets for representation before training.",
    learningModules: [
      {
        info: {
          title: "Common bias signals",
          summary: "Underrepresented groups or missing scenarios create skewed predictions.",
          points: [
            { title: "Representation", detail: "A large dataset is not necessarily a diverse one; over-representation of certain groups can skew the model's understanding.\n\n• Audit datasets to ensure balanced representation across all demographics\n• Define minimum threshold counts for minority classes before training\n• Use stratified sampling techniques to correct severe imbalances" },
            { title: "Label quality", detail: "Labeling errors disproportionately affect smaller groups because the model has fewer examples to learn from.\n\n• Implement multi-annotator consensus for data regarding minority groups\n• Regularly audit labels for cultural or historical biases\n• Provide clear, objective guidelines to human annotators" },
            { title: "Context", detail: "Models trained heavily on data from one geographic or cultural context often fail when deployed globally.\n\n• Test model performance across diverse geographic slices\n• Localize training data to reflect the target deployment region\n• Avoid assuming that behavioral patterns are universal" }
          ]
        },
        quiz: {
          question: "A dataset has few examples from older users. Risk?",
          options: ["Lower fairness for that group", "Higher latency", "More storage", "No impact"],
          correctAnswerIndex: 0,
          explanation: "Underrepresentation can harm accuracy for that group."
        }
      }
    ]
  },
  {
    id: 9011,
    is_active: true,
    title: "Measuring Fairness",
    category: "AI Bias & Fairness",
    teaser: "Track performance by group, not only overall accuracy.",
    icon: Brain,
    color: "from-indigo-500 via-blue-500 to-cyan-500",
    finalAction: "Report group-level metrics and act on gaps.",
    learningModules: [
      {
        info: {
          title: "Metrics that matter",
          summary: "Accuracy can hide disparities—use precision/recall per group.",
          points: [
            { title: "Slice metrics", detail: "Aggregated performance scores can obscure critical failures affecting specific subgroups within your user base.\n\n• Break down accuracy, precision, and recall by demographic slices\n• Establish minimum acceptable performance thresholds for all groups\n• Report systematically on performance disparities between subgroups" },
            { title: "Thresholds", detail: "A single global decision boundary may result in unequal outcomes; localized adjustments can improve fairness.\n\n• Optimize probability thresholds independently for different subgroups\n• Focus on equalizing false positive rates across critical demographics\n• Document the ethical reasoning behind any threshold adjustments" },
            { title: "Re-check", detail: "Fairness is not a one-time achievement; continuous monitoring is required as both models and user behavior evolve.\n\n• Automate fairness regression tests in your CI/CD pipeline\n• Trigger re-evaluation whenever training data is significantly updated\n• Establish alerting based on unexpected drift in fairness metrics" }
          ]
        },
        quiz: {
          question: "Overall accuracy is 95% but one group is 70%. Next step?",
          options: ["Ignore it", "Measure and address the gap", "Lower logging", "Raise temperature"],
          correctAnswerIndex: 1,
          explanation: "Disparity needs investigation and mitigation."
        }
      }
    ]
  },
  {
    id: 9012,
    is_active: true,
    title: "Inclusive Prompts",
    category: "AI Bias & Fairness",
    teaser: "Prompt phrasing can amplify or reduce stereotypes.",
    icon: Lightbulb,
    color: "from-purple-500 via-fuchsia-500 to-pink-500",
    finalAction: "Write prompts that avoid stereotypes and request neutral tone.",
    learningModules: [
      {
        info: {
          title: "Prompting for fairness",
          summary: "Explicitly ask for neutral, respectful language and balanced examples.",
          points: [
            { title: "Avoid leading cues", detail: "Explicitly or implicitly embedding demographic assumptions into prompts can force the model to generate stereotypical content.\n\n• Structure prompts to focus on skills and roles rather than identity\n• Remove unnecessary demographic markers from system instructions\n• Test prompts against known bias benchmarks before deployment" },
            { title: "Add balance", detail: "Intentionally requesting diverse viewpoints helps counteract the model’s natural tendency to output the most statistically common narrative.\n\n• Ask models to provide multiple distinct approaches to a problem\n• Prompt for counter-arguments to ensure a balanced response\n• Specify that examples should cover a range of cultures and backgrounds" },
            { title: "Review outputs", detail: "Even carefully crafted prompts can yield biased results, necessitating continuous human evaluation of the outputs.\n\n• Implement routine audits of AI-generated content for subtle bias\n• Create a standardized rubric for evaluating prompt fairness\n• Adjust system instructions based on output quality reviews" }
          ]
        },
        quiz: {
          question: "Which prompt is safest for a bio generator?",
          options: ["Use masculine traits", "Use gender-neutral, role-focused details", "Assume age", "Add stereotypes for fun"],
          correctAnswerIndex: 1,
          explanation: "Neutral, role-focused prompts reduce stereotype risk."
        }
      }
    ]
  },
  // Deepfakes & Media Manipulation
  {
    id: 9020,
    is_active: true,
    title: "Spotting Deepfakes",
    category: "Deepfakes & Media Manipulation",
    teaser: "Look for artifacts, odd timing, and mismatched audio/visual cues.",
    icon: Eye,
    color: "from-rose-500 via-orange-500 to-amber-400",
    finalAction: "Verify source and context before trusting shocking clips.",
    learningModules: [
      {
        info: {
          title: "Common tells",
          summary: "Lighting glitches, odd blinks, and mismatched shadows often reveal synthetic media.",
          points: [
            { title: "Edges & lighting", detail: "Inconsistencies in lighting and blending around the edges of a subject often reveal synthetic manipulation.\n\n• Look for unnatural haloing or blurriness around the subject's silhouette\n• Check if the shadows cast misalign with the apparent light sources\n• Pay attention to artifacts around hair, glasses, and jewelry" },
            { title: "Audio sync", detail: "Deepfake audio often struggles to perfectly synchronize with the subtle muscle movements of a speaker's mouth.\n\n• Watch closely for mouth shapes that lag behind or precede the spoken words\n• Notice if the emotional tone of the voice mismatches the facial expression\n• Listen for unnatural cadence, robotic phrasing, or missing breaths" },
            { title: "Source check", detail: "Verifying the origin of a media piece is often faster and more reliable than forensic analysis of the content itself.\n\n• Confirm if the original publisher is a known, reputable source\n• Check the creation metadata and upload dates where available\n• Cross-reference claims in the media with established news outlets" }
          ]
        },
        quiz: {
          question: "A viral clip has mismatched lip sync. First action?",
          options: ["Share quickly", "Verify source and context", "Ignore discrepancies", "Add filters"],
          correctAnswerIndex: 1,
          explanation: "Pause and verify before sharing potentially manipulated media."
        }
      }
    ]
  },
  {
    id: 9021,
    is_active: true,
    title: "Verify Before Share",
    category: "Deepfakes & Media Manipulation",
    teaser: "Reverse image search and trusted outlets reduce misinformation spread.",
    icon: Search,
    color: "from-sky-500 via-cyan-500 to-emerald-400",
    finalAction: "Check provenance with multiple sources before resharing.",
    learningModules: [
      {
        info: {
          title: "Quick verification steps",
          summary: "Reverse searches and official statements help confirm authenticity.",
          points: [
            { title: "Reverse search", detail: "Taking a moment to research an image or video can quickly reveal if it has been taken out of context.\n\n• Use reverse image search tools to find earlier instances of the media\n• Check if the image has been debunked on fact-checking websites\n• Examine the context surrounding the original, earliest upload" },
            { title: "Date check", detail: "Recycling old footage and claiming it represents a current event is a prevalent and effective misinformation tactic.\n\n• Verify the visual clues in the video (e.g., weather, seasons, construction)\n• Look for anachronisms that contradict the claimed timeline\n• Use metadata analysis tools to check for creation timestamps" },
            { title: "Trusted sources", detail: "Before amplifying shocking content, corroborate the story with established journalistic organizations.\n\n• Cross-check urgent claims with at least two reputable news outlets\n• Look for official statements from the organizations or individuals involved\n• Be wary of information available exclusively on anonymous social media accounts" }
          ]
        },
        quiz: {
          question: "What should you do before resharing a shocking video?",
          options: ["Assume it is real", "Reverse search and check reputable sources", "Add a caption and post", "Edit the audio"],
          correctAnswerIndex: 1,
          explanation: "Verification reduces spreading manipulated content."
        }
      }
    ]
  },
  {
    id: 9022,
    is_active: true,
    title: "Voice Clone Risks",
    category: "Deepfakes & Media Manipulation",
    teaser: "Cloned voices can impersonate leaders or family. Use call-backs and codes.",
    icon: AlertTriangle,
    color: "from-yellow-400 via-amber-500 to-red-500",
    finalAction: "Use secondary verification for voice-only requests.",
    learningModules: [
      {
        info: {
          title: "Prevent impersonation",
          summary: "Voice alone is weak authentication. Add shared secrets or callback steps.",
          points: [
            { title: "No voice-only approvals", detail: "Voice synthesis technology is highly accessible, meaning voice alone is no longer a reliable biometric identifier.\n\n• Require written or in-app confirmation for all financial transactions\n• Mandate multi-factor authentication (MFA) for accessing sensitive data\n• Never authorize password resets based solely on a phone call" },
            { title: "Safe words", detail: "Establishing shared secrets ahead of time provides a low-tech, highly effective defense against impersonation.\n\n• Agree on verification phrases or challenges for urgent requests\n• Ensure the safe word is known only to the necessary parties\n• Periodically rotate the chosen safe word, especially after incidents" },
            { title: "Educate teams", detail: "Awareness is the first line of defense; teams must know that high-quality voice cloning is actively used by attackers.\n\n• Conduct regular training on spotting AI-enabled social engineering\n• Run simulated vishing (voice phishing) campaigns to test readiness\n• Establish a clear, blame-free reporting process for suspected scams" }
          ]
        },
        quiz: {
          question: "A caller sounds like your manager asking for a wire. Safe move?",
          options: ["Send immediately", "Request a callback through an official number", "Share credentials", "Record and post"],
          correctAnswerIndex: 1,
          explanation: "Use known channels to verify before acting."
        }
      }
    ]
  },
  // Data Privacy & PII Awareness
  {
    id: 9030,
    is_active: true,
    title: "PII Hygiene",
    category: "Data Privacy & PII Awareness",
    teaser: "Know what counts as PII and keep it masked or minimized.",
    icon: Fingerprint,
    color: "from-slate-600 via-gray-600 to-slate-800",
    finalAction: "Default to masking PII in logs and prompts.",
    learningModules: [
      {
        info: {
          title: "Handle PII carefully",
          summary: "Names, emails, IDs, and biometrics need protection in transit and at rest.",
          points: [
            { title: "Mask early", detail: "Replacing Sensitive Information with tokens or redactions before it leaves the origin system prevents accidental exposure downstream.\n\n• Replace PII with tokens before making external model calls\n• Implement automated redaction pipelines at data entry points\n• Ensure masked data retains enough structure for analytical tasks" },
            { title: "Access control", detail: "Limiting access to raw PII strictly to authorized personnel reduces the risk of insider threats and lateral movement.\n\n• Enforce the principle of least privilege across all databases\n• Implement role-based access control (RBAC) tied to job functions\n• Require justification and temporary access for viewing raw data" },
            { title: "Retention", detail: "Data that no longer exists cannot be breached; aggressive deletion timelines minimize liability and compliance risks.\n\n• Set automated expiration dates for records containing PII\n• Delete sensitive data immediately when its primary purpose is fulfilled\n• Regularly audit storage volumes to ensure retention policies are followed" }
          ]
        },
        quiz: {
          question: "What should logs contain when handling PII?",
          options: ["Full raw data", "Masked or tokenized values", "Public dumps", "Nothing ever"],
          correctAnswerIndex: 1,
          explanation: "Masking reduces exposure while keeping observability."
        }
      }
    ]
  },
  {
    id: 9031,
    is_active: true,
    title: "Minimization Mindset",
    category: "Data Privacy & PII Awareness",
    teaser: "Collect only what you need, for as long as you need it.",
    icon: Lock,
    color: "from-green-500 via-emerald-500 to-teal-500",
    finalAction: "Design flows to avoid unnecessary data collection.",
    learningModules: [
      {
        info: {
          title: "Less is safer",
          summary: "Storing extra sensitive data increases breach impact and compliance risk.",
          points: [
            { title: "Purpose first", detail: "Collecting data 'just in case' expands the attack surface; every piece of PII must have a legally and practically justified purpose.\n\n• Tie every collected field directly to a documented business process\n• Regularly review forms to eliminate unnecessary data requests\n• Default to anonymized metrics rather than identifiable user data" },
            { title: "Short retention", detail: "Holding onto data indefinitely increases the fallout of a breach and complicates compliance with privacy regulations.\n\n• Enforce strict deletion policies based on data categories\n• Automate the archiving and purging of inactive user accounts\n• Implement secure deletion protocols to prevent data recovery" },
            { title: "User consent", detail: "Transparent data practices build user trust and ensure adherence to frameworks like GDPR and CCPA.\n\n• Clearly explain why specific data points are being requested\n• Make consent granular, allowing users to opt into specific scopes\n• Provide easy-to-use mechanisms for users to revoke consent and delete their data" }
          ]
        },
        quiz: {
          question: "Why avoid collecting unneeded PII?",
          options: ["Storage is free", "It reduces breach impact and compliance risk", "It speeds GPUs", "It improves CSS"],
          correctAnswerIndex: 1,
          explanation: "Less data lowers risk and regulatory exposure."
        }
      }
    ]
  },
  {
    id: 9032,
    is_active: true,
    title: "Secure Sharing",
    category: "Data Privacy & PII Awareness",
    teaser: "Use encrypted channels and least privilege when sharing data.",
    icon: Shield,
    color: "from-cyan-500 via-blue-500 to-indigo-500",
    finalAction: "Share sensitive data only through approved secure channels.",
    learningModules: [
      {
        info: {
          title: "Transport matters",
          summary: "HTTPS, VPNs, and access controls keep data safer in transit.",
          points: [
            { title: "Channel choice", detail: "Standard communication tools are often insecure and leave permanent trails; raw PII requires specialized handling.\n\n• Strictly avoid sending PII via unencrypted email or public chat channels\n• Use end-to-end encrypted file transfer services for sensitive documents\n• Never log raw PII into centralized, easily accessible observability tools" },
            { title: "Access scope", detail: "When sharing data, restricting what recipients can do with it prevents unauthorized downstream redistribution.\n\n• Send view-only links rather than downloadable file attachments\n• Limit the duration of access, expiring links automatically\n• Restrict the ability to copy, print, or export sensitive documents" },
            { title: "Audit", detail: "Maintaining detailed logs of data sharing establishes accountability and facilitates rapid incident response.\n\n• Log the identity of users who access, modify, or download sensitive files\n• Track the time, location, and device used for PII access\n• Configure alerts for anomalous access patterns, such as mass downloads" }
          ]
        },
        quiz: {
          question: "Best way to send a file with PII?",
          options: ["Public link", "Encrypted channel with access controls", "Personal email", "Group chat"],
          correctAnswerIndex: 1,
          explanation: "Use encrypted, access-controlled channels for sensitive data."
        }
      }
    ]
  },
  // AI in Daily Life
  {
    id: 9040,
    is_active: true,
    title: "Smart Assistants",
    category: "AI in Daily Life",
    teaser: "Voice and chat assistants can mishear; review actions before they execute.",
    icon: Lightbulb,
    color: "from-yellow-400 via-amber-400 to-orange-500",
    finalAction: "Confirm sensitive actions like purchases with a second step.",
    learningModules: [
      {
        info: {
          title: "Use assistants safely",
          summary: "Convenience is high; so is the chance of misfires—keep confirmations on.",
          points: [
            { title: "Check summaries", detail: "Smart assistants often misinterpret intent; verifying their understanding prevents executing unwanted actions.\n\n• Always have the assistant repeat back complex or sensitive commands\n• Ensure visual confirmation is required on a screen for high-stakes actions\n• Review the history log periodically to catch transcription errors" },
            { title: "Mute when private", detail: "Always-listening devices pose ambient recording risks, potentially capturing sensitive conversations or audio.\n\n• Utilize physical mute toggles during confidential meetings or discussions\n• Disconnect devices located in highly secure or private areas\n• Regularly review and delete saved voice recordings from the provider's server" },
            { title: "Permissions", detail: "Over-permissioned assistants can become vectors for data exposure or unauthorized remote actions.\n\n• Strictly limit what apps and services the assistant is allowed to control\n• Revoke the ability of the assistant to read personal emails or messages\n• Disable 'drop-in' or automatic answering features to maintain privacy" }
          ]
        },
        quiz: {
          question: "A smart speaker offers to order an item. Safe habit?",
          options: ["Auto-approve", "Require confirmation on device", "Share card details aloud", "Disable logs"],
          correctAnswerIndex: 1,
          explanation: "Confirm purchases to avoid accidental or malicious orders."
        }
      }
    ]
  },
  {
    id: 9041,
    is_active: true,
    title: "Recommenders Everywhere",
    category: "AI in Daily Life",
    teaser: "Feeds and suggestions shape what you see—know how to reset or tune them.",
    icon: Brain,
    color: "from-blue-500 via-sky-500 to-teal-500",
    finalAction: "Adjust preferences and clear history when recommendations feel off.",
    learningModules: [
      {
        info: {
          title: "Control your feed",
          summary: "Feedback, blocking, and resets improve recommendation quality.",
          points: [
            { title: "Downvote noise", detail: "Recommendation algorithms learn from engagement; actively signaling what you dislike helps retrain the feed away from low-quality content.\n\n• Consistently use the 'not interested' or 'hide' features on irrelevant posts\n• Avoid hate-watching, as negative engagement still signals interest to algorithms\n• Block accounts that consistently produce inflammatory or low-value content" },
            { title: "Reset", detail: "When a feed becomes too polarized or hyper-fixated on past interests, clearing historical signals provides a clean slate.\n\n• Periodically clear watch histories and search logs on major platforms\n• Use 'reset feed' options if available in your application settings\n• Regularly review and purge inferred interests from ad preference dashboards" },
            { title: "Time limits", detail: "Infinite scrolls are designed to exploit psychological vulnerabilities; setting boundaries preserves attention and mental well-being.\n\n• Enforce daily app timers to break the endless scrolling loop\n• Utilize 'focus mode' features to block distracting algorithmic feeds during work\n• Be mindful of engaging when emotionally vulnerable, as feeds may amplify negativity" }
          ]
        },
        quiz: {
          question: "Your feed shows unwanted topics. First move?",
          options: ["Keep scrolling", "Use feedback tools (hide, dislike)", "Share more data", "Turn off safety"],
          correctAnswerIndex: 1,
          explanation: "Use built-in feedback to steer recommendations."
        }
      }
    ]
  },
  {
    id: 9042,
    is_active: true,
    title: "AI at Work",
    category: "AI in Daily Life",
    teaser: "Drafts and summaries help, but verify facts before sharing.",
    icon: Shield,
    color: "from-indigo-500 via-violet-500 to-purple-500",
    finalAction: "Review AI-generated text for accuracy and tone before sending.",
    learningModules: [
      {
        info: {
          title: "Co-pilot, not autopilot",
          summary: "Use AI to draft, then apply human judgment for correctness and tone.",
          points: [
            { title: "Fact-check", detail: "Large Language Models are prone to hallucinating plausible-sounding but entirely fictitious information and statistics.\n\n• Always independently verify specific claims, quotes, and numbers\n• Cross-reference legal or medical advice with qualified professionals\n• Never attribute AI-generated facts in professional communication without a source" },
            { title: "Tone check", detail: "AI often adopts a repetitive, overly formal, or subtly inappropriate tone that can alienate your intended audience.\n\n• Edit AI drafts aggressively to match your natural voice and company style\n• Ensure the response demonstrates appropriate empathy when handling sensitive topics\n• Watch out for repetitive phrasing and overly complex vocabulary" },
            { title: "Sensitive info", detail: "Pasting confidential data into public AI tools can result in proprietary information being leaked or used for training.\n\n• Never paste customer PII, trade secrets, or unreleased code into public LLMs\n• Use approved, enterprise-tier AI solutions that guarantee data non-retention\n• Anonymize documents by replacing names and project codenames before summarizing" }
          ]
        },
        quiz: {
          question: "Before sending an AI-written update you should…",
          options: ["Send as-is", "Verify facts and adjust tone", "Add more jargon", "Skip proofreading"],
          correctAnswerIndex: 1,
          explanation: "Human review catches inaccuracies and tone issues."
        }
      }
    ]
  },
  // AI in Cybersecurity
  {
    id: 9050,
    is_active: true,
    title: "Detection Assist",
    category: "AI in Cybersecurity",
    teaser: "Models can triage alerts but need human oversight for final calls.",
    icon: Shield,
    color: "from-lime-500 via-green-500 to-emerald-500",
    finalAction: "Use AI to cluster alerts, not to auto-close incidents.",
    learningModules: [
      {
        info: {
          title: "Augment, don’t replace",
          summary: "AI helps summarize and rank alerts; humans decide containment.",
          points: [
            { title: "Summaries", detail: "Security logs are overwhelmingly noisy; AI excels at condensing hundreds of discrete events into a coherent narrative.\n\n• Use AI to automatically summarize the context of complex security alerts\n• Generate plain-language briefs explaining the likely impact of an indicator\n• Use models to translate dense error codes into actionable investigative steps" },
            { title: "Cluster", detail: "Grouping related alerts reduces analyst fatigue and exposes broader, coordinated attack campaigns.\n\n• Employ ML clustering techniques to group disparate alerts by related entities\n• Correlate seemingly unrelated anomalies that occur within similar time windows\n• Use AI to identify patterns that match known advanced persistent threat (APT) tactics" },
            { title: "Human decision", detail: "Containment actions, such as isolating servers or locking accounts, carry business impact and require human judgment.\n\n• Never allow AI to automatically block critical infrastructure IP addresses\n• Keep security analysts as the final approvers on all active containment actions\n• Clearly separate AI-driven detection systems from automated remediation scripts" }
          ]
        },
        quiz: {
          question: "What should AI do with SOC alerts?",
          options: ["Auto-close everything", "Summarize and prioritize for analysts", "Ignore low priority", "Delete logs"],
          correctAnswerIndex: 1,
          explanation: "Use AI for triage; humans approve actions."
        }
      }
    ]
  },
  {
    id: 9051,
    is_active: true,
    title: "Phishing Triage",
    category: "AI in Cybersecurity",
    teaser: "LLMs can highlight risky links and tone, but you must verify before blocking.",
    icon: AlertTriangle,
    color: "from-orange-500 via-amber-500 to-yellow-400",
    finalAction: "Use AI suggestions, then confirm before user-wide actions.",
    learningModules: [
      {
        info: {
          title: "Faster reviews",
          summary: "AI spots suspicious language, mismatched domains, and urgent requests.",
          points: [
            { title: "URL checks", detail: "Phishing campaigns often use subtle typosquats; models can flag minor deviations from trusted domains.\n\n• Use AI to detect visually similar homoglyph attacks in URLs\n• Flag newly registered domains mimicking internal corporate infrastructure\n• Automatically analyze the destination of obfuscated or shortened links" },
            { title: "Tone analysis", detail: "Social engineering heavily relies on creating a sense of urgency or fear; AI is highly effective at detecting these linguistic patterns.\n\n• Flag emails demanding urgent financial action or strict confidentiality\n• Detect coercive language patterns typical in business email compromise (BEC)\n• Warn users when the tone profile of an email mismatches the supposed sender" },
            { title: "Containment", detail: "AI can rapidly identify potential threats, allowing security teams to quickly quarantine suspect communications before users interact.\n\n• Use AI detection confidence to automatically route risky emails to quarantine\n• Require human verification before executing tenant-wide message purges\n• Monitor for false positives to avoid blocking legitimate time-sensitive business" }
          ]
        },
        quiz: {
          question: "AI flags a campaign as suspicious. Next move?",
          options: ["Auto-delete all mail", "Verify indicators then quarantine", "Share widely", "Ignore"],
          correctAnswerIndex: 1,
          explanation: "Verify, then quarantine to avoid false positives."
        }
      }
    ]
  },
  {
    id: 9052,
    is_active: true,
    title: "Incident Briefs",
    category: "AI in Cybersecurity",
    teaser: "Use AI to create incident summaries, not to choose containment paths.",
    icon: Brain,
    color: "from-slate-500 via-blue-500 to-indigo-500",
    finalAction: "Let analysts review AI-written briefs before sharing.",
    learningModules: [
      {
        info: {
          title: "Better communication",
          summary: "Consistent briefs help leadership decide; accuracy still needs humans.",
          points: [
            { title: "Standard fields", detail: "Consistent communication ensures all stakeholders rapidly understand the severity and status of an ongoing incident.\n\n• Use AI to automatically extract impact, scope, and timeline from analyst notes\n• Standardize the format of executive summaries for rapid consumption\n• Clearly demarcate confirmed facts from ongoing investigations or hypotheses" },
            { title: "Source links", detail: "An AI summary is only as good as its verifiability; linking to primary sources establishes trust and aids deep dives.\n\n• Require the AI to cite the specific log entries or alerts used to generate the brief\n• Include direct links to relevant dashboards and communication channels\n• Embed specific hashes and IOCs rather than generic descriptions" },
            { title: "Human review", detail: "AI may misinterpret technical nuances or hallucinate details, which can cause panic or misdirect response efforts.\n\n• Mandate a senior analyst review of the brief prior to leadership distribution\n• Double-check timelines constructed by AI for chronological accuracy\n• Ensure the proposed severity level accurately reflects the business context" }
          ]
        },
        quiz: {
          question: "What belongs in an AI-generated incident brief?",
          options: ["Evidence links and scope", "Unverified rumors", "Personal data", "Blank fields"],
          correctAnswerIndex: 0,
          explanation: "Include evidence and scope; keep accuracy via review."
        }
      }
    ]
  },
  // AI Ethics & Responsibility
  {
    id: 9060,
    is_active: true,
    title: "Transparency Basics",
    category: "AI Ethics & Responsibility",
    teaser: "Tell users when AI is involved and where its limits are.",
    icon: Lightbulb,
    color: "from-cyan-500 via-blue-500 to-indigo-500",
    finalAction: "Provide clear disclosures and guidance where AI acts.",
    learningModules: [
      {
        info: {
          title: "Set expectations",
          summary: "Disclosures build trust and reduce misuse by clarifying capabilities.",
          points: [
            { title: "Label AI", detail: "Users must be informed when they are interacting with an AI system or consuming AI-generated media to maintain critical trust.\n\n• Apply distinct, unavoidable watermarks or labels to synthetic text and images\n• Introduce chatbots clearly as AI assistants rather than human agents\n• Provide users with an easy way to switch to a human operator if available" },
            { title: "Limits", detail: "Overestimating an AI’s capabilities leads to dangerous reliance; clearly demarcating where the system struggles is essential.\n\n• Explicitly state in the UI that the system may confidently output incorrect facts\n• Clarify the date cutoff for the model's training data to prevent temporal errors\n• Advise users that the AI is not a substitute for professional legal or medical counsel" },
            { title: "Verification", detail: "Encouraging a 'trust but verify' mindset protects both the user and the deploying organization from the fallout of hallucinations.\n\n• Prompt users to independently verify critical numbers or citations generated\n• Build UI affordances (like hover-states) that show the sources behind AI claims\n• Provide immediate feedback mechanisms for users to report incorrect outputs" }
          ]
        },
        quiz: {
          question: "Why disclose AI use?",
          options: ["To add jargon", "Build trust and set correct expectations", "Increase token count", "Hide limits"],
          correctAnswerIndex: 1,
          explanation: "Transparency improves trust and responsible use."
        }
      }
    ]
  },
  {
    id: 9061,
    is_active: true,
    title: "Accountability Lines",
    category: "AI Ethics & Responsibility",
    teaser: "Humans stay accountable for outcomes, even when AI assists.",
    icon: Shield,
    color: "from-amber-500 via-yellow-500 to-lime-400",
    finalAction: "Assign owners for AI-assisted decisions.",
    learningModules: [
      {
        info: {
          title: "Who is responsible?",
          summary: "Clear ownership avoids blame shifting and ensures fixes happen.",
          points: [
            { title: "Define owners", detail: "When a system fails, lack of clear ownership results in delayed remediation and organizational blame-shifting.\n\n• Assign specific teams to be accountable for the performance of distinct AI workflows\n• Ensure ownership covers both technical uptime and the ethical quality of outputs\n• Document the final accountable executive for high-impact AI systems" },
            { title: "Escalation", detail: "AI systems will inevitably encounter edge cases or policy conflicts; a clear path to human resolution is mandatory.\n\n• Establish clear SLAs for human review when the AI flags a high-risk request\n• Provide users with an accessible appeals process for automated decisions\n• Define procedures for when to fully disable the AI in favor of manual processing" },
            { title: "Review loops", detail: "Continuous oversight identifies creeping biases and degrading performance before they cause significant harm.\n\n• Schedule routine audits of randomly sampled AI-driven decisions and interactions\n• Incorporate diverse perspectives into the committees reviewing AI performance\n• Mandate post-mortems for any AI interactions that resulted in user harm or complaints" }
          ]
        },
        quiz: {
          question: "Who owns an AI-assisted decision?",
          options: ["No one", "The human team with authority", "The model vendor only", "The end user"],
          correctAnswerIndex: 1,
          explanation: "Humans with authority remain accountable."
        }
      }
    ]
  },
  {
    id: 9062,
    is_active: true,
    title: "Setting Boundaries",
    category: "AI Ethics & Responsibility",
    teaser: "Define acceptable uses and declines for your AI features.",
    icon: AlertTriangle,
    color: "from-red-500 via-rose-500 to-pink-500",
    finalAction: "Publish allowed/blocked uses and enforce them.",
    learningModules: [
      {
        info: {
          title: "Use policy",
          summary: "Clear acceptable-use policies guide users and simplify enforcement.",
          points: [
            { title: "List disallowed", detail: "An explicit list of prohibited use cases provides a firm foundation for moderation and protects the system from abuse.\n\n• Explicitly ban generating malware, hate speech, or non-consensual explicit material\n• Restrict the AI from providing decisive advice in heavily regulated domains (e.g., medical, financial)\n• Document these prohibited uses comprehensively in the Terms of Service" },
            { title: "Communicate", detail: "Tucking policies away in lengthy legal documents leads to unintentional violations; policies must be visible within the workflow.\n\n• Display concise usage guidelines directly on the primary interface\n• Present contextual warnings when a user prompts in a bordering sensitive area\n• Provide clear, plain-language explanations when a request is blocked" },
            { title: "Enforce", detail: "A policy without enforcement is useless; security controls must technically prevent what the guidelines forbid.\n\n• Implement robust input and output filters tuned precisely to the disallowed checklist\n• Automate account suspension or rate limiting for users who repeatedly violate policies\n• Regularly update the enforcement rules to counter novel prompt injection techniques" }
          ]
        },
        quiz: {
          question: "What helps prevent misuse?",
          options: ["Hidden policies", "Clear acceptable-use rules and enforcement", "No logging", "Unlimited access"],
          correctAnswerIndex: 1,
          explanation: "Explicit policies plus enforcement reduce misuse."
        }
      }
    ]
  },
  // AI Scams & Social Engineering
  {
    id: 9070,
    is_active: true,
    title: "Impersonation Red Flags",
    category: "AI Scams & Social Engineering",
    teaser: "AI can mimic voices and faces—verify identities through trusted channels.",
    icon: Eye,
    color: "from-orange-500 via-red-500 to-rose-500",
    finalAction: "Use callbacks and MFA for sensitive approvals.",
    learningModules: [
      {
        info: {
          title: "Trust but verify",
          summary: "Unusual requests, even from familiar voices, need second-channel verification.",
          points: [
            { title: "Unexpected asks", detail: "Social engineering relies on disruption; an anomalous request is the primary indicator of an impersonation attempt.\n\n• Treat requests that bypass standard operational procedures as highly suspicious\n• Scrutinize sudden changes to payment details, even from known contacts\n• Pause and reassess if a contact uncharacteristically demands secrecy or bypasses rules" },
            { title: "Known channels", detail: "Attackers control the medium they initiate; breaking that control is the best way to verify authenticity.\n\n• Hang up and call the person back using an internally directory-listed phone number\n• Verify email requests by contacting the sender through an established chat platform\n• Never use contact numbers or links provided within the suspicious message itself" },
            { title: "No secrets", detail: "Multi-factor codes are the final barrier against account takeover and should never be communicated to another human.\n\n• Understand that legitimate support staff will never ask for your MFA code or password\n• Never type MFA codes into a chat window or read them aloud over the phone\n• Report immediately if you are pressured to relay a 2FA code to a 'colleague'" }
          ]
        },
        quiz: {
          question: "A video call looks like your CFO requesting gift cards. Safe move?",
          options: ["Buy immediately", "Verify via known phone or ticket system", "Share MFA codes", "Post online"],
          correctAnswerIndex: 1,
          explanation: "Always verify via trusted channels before acting."
        }
      }
    ]
  },
  {
    id: 9071,
    is_active: true,
    title: "Urgency Tactics",
    category: "AI Scams & Social Engineering",
    teaser: "Scams add urgency and secrecy to push quick actions.",
    icon: AlertTriangle,
    color: "from-amber-500 via-orange-500 to-red-500",
    finalAction: "Slow down, verify, and loop in a second approver.",
    learningModules: [
      {
        info: {
          title: "Pause on pressure",
          summary: "Time pressure is a warning sign—use checklists and second approvals.",
          points: [
            { title: "Timeout", detail: "Scammers artificially compress timelines to trigger panic and prevent logical assessment of the situation.\n\n• Step away from the request for a few minutes to evaluate it objectively\n• Recognize deadlines like 'within the hour' or 'immediate wire' as massive red flags\n• Remember that internal emergencies rarely require bypassing all security protocols" },
            { title: "Two-person rule", detail: "Requiring a separate, independent individual to authorize an action drastically reduces the success rate of social engineering.\n\n• Implement mandatory secondary approvals for all fund transfers over a specific amount\n• Require cross-departmental verification for changes to critical vendor banking info\n• Encourage a culture where employees feel supported in seeking a second opinion" },
            { title: "Document", detail: "Keeping records of anomalous interactions aids in post-incident analysis and helps protect others from similar attacks.\n\n• Log the exact nature of the unusual request, including timestamp and method\n• Capture screenshots of suspicious chats or emails before reporting them\n• Submit the recorded details directly to the internal security or IT team for review" }
          ]
        },
        quiz: {
          question: "An email says 'urgent payment in 10 minutes'. Best move?",
          options: ["Pay now", "Verify through your finance process", "Send credentials", "Reply with info"],
          correctAnswerIndex: 1,
          explanation: "Follow standard verification, not the scammer’s urgency."
        }
      }
    ]
  },
  {
    id: 9072,
    is_active: true,
    title: "Payment & Credential Safety",
    category: "AI Scams & Social Engineering",
    teaser: "Never share MFA codes or passwords; use official portals only.",
    icon: Lock,
    color: "from-blue-500 via-indigo-500 to-slate-600",
    finalAction: "Use MFA and official channels for any sensitive input.",
    learningModules: [
      {
        info: {
          title: "Keep secrets safe",
          summary: "Passwords, codes, and payment details belong only in verified systems.",
          points: [
            { title: "No sharing", detail: "The core principle of credential safety is absolute restriction: your passwords and MFA codes are yours alone.\n\n• Never share login credentials with IT, contractors, or management under any circumstances\n• Treat requests for access tokens or single sign-on (SSO) cookies as hostile\n• Avoid using shared team accounts for accessing sensitive or privileged infrastructure" },
            { title: "Official forms", detail: "Phishing attacks simulate legitimate infrastructure; ensuring you are on the correct, verified system is critical.\n\n• Navigate to services via bookmarks or manual typing rather than clicking emailed links\n• Scrutinize the URL bar for typosquats or missing HTTPS indicators before logging in\n• Beware of embedded login forms within documents or unexpected third-party pages" },
            { title: "Report quickly", detail: "The window for an attacker to act is small; reporting a mistake rapidly can often prevent serious damage.\n\n• Inform the security team immediately if you suspect you entered credentials on a fake site\n• Initiate an immediate password reset on the compromised account and related systems\n• Do not fear disciplinary action; speed of reporting is critical to containment" }
          ]
        },
        quiz: {
          question: "Where should MFA codes be entered?",
          options: ["In chat to anyone", "Only in the official login you initiated", "On social media", "In a text reply"],
          correctAnswerIndex: 1,
          explanation: "MFA codes belong only in trusted login flows you start."
        }
      }
    ]
  }
];

const AwarenessHub: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [topics, setTopics] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Persistence for completed topics with logging and error handling
  const [completedTopicIds, setCompletedTopicIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('completed_awareness_topics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load completed topics from localStorage:', error);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('completed_awareness_topics', JSON.stringify(completedTopicIds));
    } catch (error) {
      console.error('Failed to save completed topics to localStorage:', error);
    }
  }, [completedTopicIds]);

  const handleTopicComplete = (id: number) => {
    if (!completedTopicIds.includes(id)) {
      setCompletedTopicIds(prev => [...prev, id]);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/content/awareness/');
      // Map backend fields to frontend Resource type
      const mapped = res.data.map((t: any) => ({
        id: t.id,
        is_active: t.is_active,
        title: t.title,
        category: t.category,
        teaser: t.description || t.teaser,
        icon: ICON_MAP[t.icon_name] || Brain,
        color: t.color_theme,
        finalAction: t.final_action,
        learningModules: t.modules
      }));
      setTopics([...mapped, ...STATIC_TOPICS]);
    } catch (err) {
      console.error("Failed to load awareness topics", err);
      setTopics(STATIC_TOPICS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  /* ---------------- ADMIN VIEW ---------------- */

  const AdminAwarenessList = () => {
    const [isCreating, setIsCreating] = useState(false);

    if (user?.role !== 'ADMIN') return null;

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} p-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Awareness Hub Management</h1>
              <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Create and manage awareness modules and quizzes.
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create New Module
            </button>
          </div>

          {/* Management Table */}
          <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className={`bg-slate-50 dark:bg-slate-700/50 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <tr>
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Title</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Modules</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                  {topics.map(topic => (
                    <tr key={topic.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs opacity-50">#{topic.id}</td>
                      <td className={`px-6 py-4 font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{topic.title}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                          {topic.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs opacity-75">{topic.learningModules?.length || 0} modules</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${topic.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                          {topic.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <AdminActionButtons item={topic} contentType="awareness" onUpdate={fetchTopics} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {topics.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No modules found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <ContentEditModal
            isOpen={isCreating}
            onClose={() => setIsCreating(false)}
            item={null}
            contentType="awareness"
            onSuccess={fetchTopics}
          />
        </div>
      </div>
    );
  };

  /* ---------------- LEARNER VIEW ---------------- */

  const LearnerAwarenessView = () => {
    const categories = ['All', ...Array.from(new Set(topics.map(t => t.category)))];

    const filteredTopics = useMemo(() => {
      return topics.filter(topic => {
        const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory;
        const matchesSearch = searchTerm === '' ||
          topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.teaser.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    }, [searchTerm, selectedCategory]);

    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
        {/* Comic/Grid Background */}
        <div className="absolute inset-0 bg-grid-black dark:bg-grid-white opacity-[0.05] fixed pointer-events-none" />

        <div className="relative pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto z-10">

          {/* --- HERO SECTION --- */}
          <div className="text-center max-w-5xl mx-auto mb-16 relative">
            {/* Pop Art Decorative Elements */}
            <div className="absolute top-0 right-0 animate-bounce delay-700 hidden lg:block">
              <div className="w-12 h-12 rounded-full bg-yellow-400 border-4 border-black dark:border-white" />
            </div>
            <div className="absolute bottom-0 left-0 animate-pulse delay-300 hidden lg:block">
              <div className="w-8 h-8 rotate-45 bg-primary border-4 border-black dark:border-white" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-6 py-3 mb-8 bg-black dark:bg-white text-white dark:text-black rounded-lg border-2 border-transparent shadow-[4px_4px_0px_0px_#9333ea]"
            >
              <Brain className="w-6 h-6" strokeWidth={3} />
              <span className="text-sm font-black tracking-widest uppercase">
                Intelligence Center
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black text-black dark:text-white mb-8 uppercase tracking-tighter leading-[0.9]"
            >
              Master the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary relative">
                Age of AI
                <svg className="absolute w-full h-4 -bottom-2 left-0 text-primary opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed border-l-4 border-black dark:border-white pl-6"
            >
              Your field guide to surviving and thriving in the digital wild. Spot deepfakes, fight bias, and master manipulation.
            </motion.p>
          </div>

          {/* --- CONTROLS --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="sticky top-24 z-30 mb-16"
          >
            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] border-4 border-black dark:border-white flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full md:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-black dark:text-white" strokeWidth={3} />
                <input
                  type="text"
                  placeholder="SEARCH TOPICS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-gray-100 dark:bg-slate-800 border-2 border-transparent focus:border-black dark:focus:border-white rounded-lg outline-none transition-all text-black dark:text-white placeholder-gray-500 font-bold uppercase tracking-wide"
                />
              </div>

              <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar px-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wide transition-all whitespace-nowrap border-2 ${selectedCategory === category
                      ? 'bg-primary border-black dark:border-white text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-y-1'
                      : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* --- GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 rounded-xl bg-gray-200 dark:bg-slate-800 animate-pulse border-4 border-gray-300 dark:border-gray-700" />
                ))
              ) : filteredTopics.map((topic) => {
                const isCompleted = completedTopicIds.includes(topic.id);
                // Find global index to determine lock status
                const globalIndex = topics.findIndex(t => t.id === topic.id);
                // const isLocked = globalIndex > 0 && !completedTopicIds.includes(topics[globalIndex - 1].id);
                const isLocked = false; // Unlocked by default as requested

                return (
                  <motion.div
                    key={topic.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <ResourceCard
                      resource={topic}
                      onClick={() => setSelectedResource(topic)}
                      onUpdate={fetchTopics}
                      isLocked={isLocked}
                      isCompleted={isCompleted}
                    />
                  </motion.div>
                );
              })}
              
              {!loading && filteredTopics.length > 0 && (
                <motion.div
                  key="more-modules-soon"
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative h-full flex flex-col min-h-[320px]"
                >
                  <div className="relative h-full bg-gray-50 dark:bg-slate-800/50 border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                      <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" strokeWidth={3} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter mb-2">
                      More Modules
                    </h3>
                    <div className="h-1 w-12 bg-gray-300 dark:bg-gray-600 rounded-full mb-4" />
                    <p className="text-gray-400 dark:text-gray-500 font-bold text-sm">
                      New learning scenarios and field guides are dropping soon. Stay tuned!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!loading && filteredTopics.length === 0 && (
            <div className="text-center py-24 bg-white dark:bg-slate-900 border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-gray-300 dark:border-gray-600">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-3xl font-black text-black dark:text-white mb-2 uppercase">No topics found</h3>
              <p className="text-gray-500 font-bold">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>

        <ResourceModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onComplete={handleTopicComplete}
        />
      </div>
    );
  };

  // Main Render Switch
  if (user?.role === 'ADMIN') {
    return <AdminAwarenessList />;
  }

  return <LearnerAwarenessView />;
};

export default AwarenessHub;