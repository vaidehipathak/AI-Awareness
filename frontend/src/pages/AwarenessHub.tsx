import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from 'next-themes';
import {
  Brain, Lock, Fingerprint, Eye, Shield, Gamepad2,
  Search, AlertTriangle, X, CheckCircle, XCircle, RotateCcw, Lightbulb, Zap, Plus, Settings
} from 'lucide-react';

import AdminActionButtons from '../components/admin/AdminActionButtons';
import ContentEditModal from '../components/admin/ContentEditModal';

// --- DATA STRUCTURES & CONTENT ---

type Quiz = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  id?: number; // Optional for safety
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

// --- STYLING UTILS ---

const COMIC_BORDER = "border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]";
const SPEECH_BUBBLE = "relative bg-white dark:bg-slate-800 p-5 border-[4px] border-black dark:border-white rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] after:content-[''] after:absolute after:bottom-[-20px] after:left-10 after:w-0 after:h-0 after:border-l-[15px] after:border-l-transparent after:border-r-[15px] after:border-r-transparent after:border-t-[20px] after:border-t-black dark:after:border-t-white";

// --- HELPERS & COMPONENTS ---

const ComicSFX = ({ text }: { text: string }) => (
  <motion.div
    initial={{ scale: 0, rotate: -20 }}
    animate={{ scale: [0, 1.4, 1], rotate: [-20, 10, -5], opacity: [0, 1, 0] }}
    transition={{ duration: 0.8 }}
    className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
  >
    <span className="text-7xl md:text-9xl font-black italic text-yellow-400 drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] uppercase tracking-tighter">
      {text}
    </span>
  </motion.div>
);

const QuizComponent = ({ quiz, onCorrectAnswer }: { quiz: Quiz; onCorrectAnswer: () => void }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showSFX, setShowSFX] = useState(false);

  // If quiz is undefined (e.g. data mismatch), handle gracefully
  if (!quiz) return <div className="p-4 text-red-500">Quiz data missing</div>;

  const isCorrect = isAnswered && selectedAnswer === quiz.correctAnswerIndex;

  const handleAnswerClick = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === quiz.correctAnswerIndex) {
      setShowSFX(true);
      setTimeout(() => {
        setShowSFX(false);
        onCorrectAnswer();
      }, 1800);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return "bg-white dark:bg-slate-700 hover:translate-x-1 hover:translate-y-1 transition-all";
    }
    if (index === quiz.correctAnswerIndex) {
      return "bg-green-400 text-black translate-x-1 translate-y-1 shadow-none";
    }
    if (index === selectedAnswer) {
      return "bg-red-500 text-white";
    }
    return "bg-slate-200 dark:bg-slate-800 opacity-50 shadow-none";
  };

  return (
    <div className="relative mt-2">
      <AnimatePresence>
        {showSFX && <ComicSFX text="BINGO!" />}
      </AnimatePresence>

      <motion.div
        className={`p-6 bg-cyan-50 dark:bg-blue-900/10 border-[4px] border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)]`}
        animate={{ opacity: isCorrect ? 0.3 : 1 }}
      >
        <h4 className="font-black text-xl text-black dark:text-white mb-6 italic uppercase tracking-tighter flex items-center gap-2">
          <Zap className="text-yellow-500 fill-yellow-500" size={24} /> {quiz.question}
        </h4>
        <div className="space-y-3">
          {quiz.options && quiz.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleAnswerClick(index)}
              className={`w-full text-left p-4 border-[4px] border-black dark:border-white font-black uppercase italic text-sm md:text-base flex items-center shadow-[4px_4px_0px_rgba(0,0,0,1)] ${getButtonClass(index)}`}
              disabled={isAnswered}
              animate={isAnswered && selectedAnswer === index && !isCorrect ? { x: [0, -5, 5, -5, 5, 0] } : {}}
            >
              <div className="mr-3 flex-shrink-0">
                {isAnswered && (index === quiz.correctAnswerIndex ? <CheckCircle className="w-6 h-6" /> : (index === selectedAnswer ? <XCircle className="w-6 h-6" /> : <div className="w-6" />))}
                {!isAnswered && <div className="w-6 h-6 border-[3px] border-black dark:border-slate-400 rounded-full" />}
              </div>
              {option}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {isAnswered && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-6 p-5 bg-yellow-300 dark:bg-slate-800 border-[4px] border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)]`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-8 h-8 text-black dark:text-yellow-400 flex-shrink-0" />
              <div>
                <span className="font-black uppercase italic text-xs bg-black text-white px-2 py-0.5 mb-2 inline-block">Intel Update</span>
                <p className="text-sm font-black text-black dark:text-slate-100 leading-tight italic uppercase tracking-tighter">{quiz.explanation}</p>
              </div>
            </div>
            <button
              onClick={resetQuiz}
              className={`mt-4 w-full flex items-center justify-center gap-2 text-center p-3 bg-black text-white font-black uppercase italic border-[3px] border-black hover:bg-slate-800 transition-colors`}
            >
              <RotateCcw size={18} strokeWidth={4} />
              Retry Mission
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResourceCard = ({ resource, onClick, onUpdate }: { resource: Resource; onClick: () => void; onUpdate: () => void }) => {
  const IconComponent = resource.icon || Brain;
  return (
    <motion.div
      layoutId={`card-container-${resource.id}`}
      whileHover={{ y: -8, rotate: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 cursor-pointer overflow-hidden flex flex-col h-full ${COMIC_BORDER} relative group`}
    >
      {/* Admin Controls */}
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <AdminActionButtons item={resource} contentType="awareness" onUpdate={onUpdate} />
      </div>

      <div className={`h-8 bg-gradient-to-r ${resource.color} border-b-[4px] border-black flex items-center px-4 overflow-hidden relative`}>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-white/50" />
          <div className="w-2 h-2 rounded-full bg-white/50" />
          <div className="w-2 h-2 rounded-full bg-white/50" />
        </div>
        {!resource.is_active && (
          <div className="absolute right-2 px-2 py-0.5 bg-red-500 text-white text-[10px] uppercase font-bold">Hidden</div>
        )}
      </div>
      <div className="p-6 flex-grow flex flex-col relative">
        <div className="absolute top-2 right-2 opacity-10">
          <IconComponent size={80} />
        </div>
        <div className="flex items-start mb-4">
          <div className={`w-14 h-14 bg-white dark:bg-slate-800 border-[4px] border-black dark:border-white flex items-center justify-center mr-4 flex-shrink-0 -rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            <IconComponent className="w-8 h-8 text-black dark:text-white" />
          </div>
          <div className="flex-1">
            <span className="inline-block px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-black uppercase italic tracking-tighter mb-1 border-2 border-black">
              {resource.category}
            </span>
            <h3 className="text-2xl font-black text-black dark:text-white leading-none uppercase italic tracking-tighter">
              {resource.title}
            </h3>
          </div>
        </div>
        <p className="text-slate-800 dark:text-slate-300 text-sm font-black italic leading-tight mb-6 line-clamp-3 uppercase tracking-tighter">
          {resource.teaser}
        </p>
        <div className="mt-auto flex justify-between items-center">
          <div className="h-1 flex-grow bg-slate-200 dark:bg-slate-800 mr-4" />
          <span className="flex-shrink-0 px-4 py-1 bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase italic border-[2px] border-black">
            Start &rarr;
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const ResourceModal = ({ resource, onClose }: { resource: Resource | null; onClose: () => void }) => {
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
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-6 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            layoutId={`card-container-${resource.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-[#f8f8f8] dark:bg-slate-900 my-auto relative border-[6px] border-black dark:border-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_rgba(255,255,255,0.1)]"
          >
            {/* --- MODAL HEADER --- */}
            <div className={`relative h-32 md:h-44 border-b-[6px] border-black overflow-hidden flex items-center bg-gradient-to-r ${resource.color}`}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }} />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-red-600 border-[4px] border-black p-2 hover:scale-110 transition-transform z-20 text-white shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              >
                <X size={24} strokeWidth={4} />
              </button>

              <div className="flex items-center gap-6 px-6 md:px-12 w-full z-10">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-white border-[6px] border-black flex items-center justify-center flex-shrink-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-3">
                  <IconComponent className="w-12 h-12 md:w-16 md:h-16 text-black" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] leading-none">
                    {resource.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-4">
                    {modules.map((_, index) => (
                      <div key={index} className={`h-4 w-10 border-[3px] border-black transition-all duration-300 ${index < currentModuleIndex ? 'bg-yellow-400' : (index === currentModuleIndex ? 'bg-white scale-110' : 'bg-black/20')}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="p-4 md:p-10">
              <AnimatePresence mode="wait">
                {!isCompleted && currentModule ? (
                  <motion.div
                    key={currentModuleIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* --- LESSON PANEL --- */}
                    <div className="flex flex-col gap-6">
                      <div className="bg-yellow-400 border-[4px] border-black px-4 py-1 self-start shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-2">
                        <span className="text-sm font-black uppercase italic text-black tracking-tighter">Current Briefing</span>
                      </div>

                      <div className={SPEECH_BUBBLE}>
                        <h3 className="text-xl md:text-2xl font-black text-black dark:text-white mb-3 uppercase italic tracking-tighter underline decoration-cyan-400 decoration-4">
                          {currentModule.info.title}
                        </h3>
                        <p className="text-base md:text-lg font-black text-slate-800 dark:text-slate-200 leading-tight italic uppercase tracking-tighter">
                          {currentModule.info.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {currentModule.info.points.map((point, index) => (
                          <div key={index} className="p-4 bg-white dark:bg-slate-800 border-[4px] border-black dark:border-white shadow-[4px_4px_0px_rgba(0,0,0,1)] group hover:translate-x-1 transition-transform">
                            <h4 className="font-black text-black dark:text-white uppercase text-xs md:text-sm mb-1 italic flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" /> {point.title}
                            </h4>
                            <p className="text-xs md:text-sm font-black italic text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{point.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* --- QUIZ PANEL --- */}
                    <div className="flex flex-col">
                      <div className="bg-blue-600 border-[4px] border-black px-4 py-1 self-start shadow-[4px_4px_0px_rgba(0,0,0,1)] rotate-2 z-10 translate-y-2 translate-x-4 text-white">
                        <span className="text-sm font-black uppercase italic tracking-tighter">Mission Assessment</span>
                      </div>
                      <QuizComponent quiz={currentModule.quiz} onCorrectAnswer={handleCorrectAnswer} />

                      <div className="mt-8 p-4 bg-slate-200 dark:bg-slate-800 border-[4px] border-dashed border-black dark:border-white text-center">
                        <p className="text-2xl font-black italic uppercase text-slate-400 dark:text-slate-600 tracking-widest">Knowledge is Power</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="completion"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="inline-block relative mb-10">
                      <div className="absolute inset-0 bg-yellow-400 rotate-12 border-[4px] border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]" />
                      <div className={`relative w-32 h-32 bg-white border-[6px] border-black flex items-center justify-center -rotate-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]`}>
                        <CheckCircle className="w-20 h-20 text-green-500" strokeWidth={4} />
                      </div>
                    </div>
                    <h3 className="text-5xl md:text-6xl font-black text-black dark:text-white italic uppercase tracking-tighter mb-6 drop-shadow-[4px_4px_0px_rgba(34,197,94,0.3)]">Chapter Mastered!</h3>
                    <div className="max-w-xl mx-auto p-8 bg-white dark:bg-slate-800 border-[4px] border-black dark:border-white shadow-[10px_10px_0px_rgba(0,0,0,1)] mb-10 -rotate-1">
                      <p className="text-xl md:text-2xl font-black italic text-black dark:text-slate-200 uppercase tracking-tighter leading-tight">"{resource.finalAction}"</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-12 py-5 bg-black text-white dark:bg-white dark:text-black font-black text-2xl uppercase italic border-[4px] border-black hover:bg-slate-800 hover:translate-x-2 hover:translate-y-2 transition-all shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]"
                    >
                      Next Mission &rarr;
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

const AwarenessHub: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [topics, setTopics] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Icon Mapping
  const ICON_MAP: any = {
    Brain, Lock, Fingerprint, Eye, Shield, Gamepad2, Search, AlertTriangle, X, CheckCircle, XCircle, RotateCcw, Lightbulb, Zap
  };

  // Static catalog expands the hub even if backend content is empty. Follows existing Resource schema.
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
              { title: "Defense in depth", detail: "Combine system prompts, moderation, and output checks." },
              { title: "Fail closed", detail: "If unsure or blocked, choose the safer path and explain briefly." },
              { title: "Visibility", detail: "Log safety decisions for review and improvement." }
            ]
          },
          quiz: {
            question: "What is the safest default when a response triggers a safety rule?",
            options: ["Return the full answer anyway", "Block or soften the response and log it", "Ignore the rule", "Increase temperature"],
            correctAnswerIndex: 1,
            explanation: "Fail closed: block or soften, and log for review to avoid unsafe delivery."
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
              { title: "Volume anomalies", detail: "Spikes from a single key or IP are high-risk." },
              { title: "Repeated probes", detail: "Similar prompts aiming to bypass filters are red flags." },
              { title: "Mitigations", detail: "Rate limits, captchas, and blocklists slow attackers." }
            ]
          },
          quiz: {
            question: "A single key suddenly sends 100× more requests than usual. Best first step?",
            options: ["Disable logging", "Raise temperature", "Apply tighter rate limits and investigate", "Ignore it"],
            correctAnswerIndex: 2,
            explanation: "Spike + key concentration suggests abuse; throttle and inspect." }
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
              { title: "Critical scope", detail: "Outbound emails, posts, or code changes should pause for review." },
              { title: "Context gaps", detail: "Humans catch nuance that models may miss." },
              { title: "Clear UX", detail: "Explain why approval is needed to build trust." }
            ]
          },
          quiz: {
            question: "Which task most needs human review?",
            options: ["Suggesting a headline", "Auto-sending invoices", "Counting words", "Sorting tags"],
            correctAnswerIndex: 1,
            explanation: "Sending invoices is high impact; keep a human approval step." }
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
              { title: "Representation", detail: "Check group counts, not just total size." },
              { title: "Label quality", detail: "Inconsistent labels hide in minority classes." },
              { title: "Context", detail: "Data from one region may not generalize elsewhere." }
            ]
          },
          quiz: {
            question: "A dataset has few examples from older users. Risk?",
            options: ["Lower fairness for that group", "Higher latency", "More storage", "No impact"],
            correctAnswerIndex: 0,
            explanation: "Underrepresentation can harm accuracy for that group." }
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
              { title: "Slice metrics", detail: "Evaluate by age, region, or device where appropriate." },
              { title: "Thresholds", detail: "Adjust decision thresholds to close gaps." },
              { title: "Re-check", detail: "Re-evaluate after model or data changes." }
            ]
          },
          quiz: {
            question: "Overall accuracy is 95% but one group is 70%. Next step?",
            options: ["Ignore it", "Measure and address the gap", "Lower logging", "Raise temperature"],
            correctAnswerIndex: 1,
            explanation: "Disparity needs investigation and mitigation." }
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
              { title: "Avoid leading cues", detail: "Don’t imply traits based on demographics." },
              { title: "Add balance", detail: "Request varied perspectives where relevant." },
              { title: "Review outputs", detail: "Spot-check for bias and adjust prompts." }
            ]
          },
          quiz: {
            question: "Which prompt is safest for a bio generator?",
            options: ["Use masculine traits", "Use gender-neutral, role-focused details", "Assume age", "Add stereotypes for fun"],
            correctAnswerIndex: 1,
            explanation: "Neutral, role-focused prompts reduce stereotype risk." }
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
              { title: "Edges & lighting", detail: "Look for haloing or inconsistent shadows." },
              { title: "Audio sync", detail: "Mouth shapes that lag words are suspicious." },
              { title: "Source check", detail: "Confirm original publisher and date." }
            ]
          },
          quiz: {
            question: "A viral clip has mismatched lip sync. First action?",
            options: ["Share quickly", "Verify source and context", "Ignore discrepancies", "Add filters"],
            correctAnswerIndex: 1,
            explanation: "Pause and verify before sharing potentially manipulated media." }
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
              { title: "Reverse search", detail: "Find originals or earlier versions of the media." },
              { title: "Date check", detail: "Old footage reused as new is a common trick." },
              { title: "Trusted sources", detail: "Cross-check with reputable outlets." }
            ]
          },
          quiz: {
            question: "What should you do before resharing a shocking video?",
            options: ["Assume it is real", "Reverse search and check reputable sources", "Add a caption and post", "Edit the audio"],
            correctAnswerIndex: 1,
            explanation: "Verification reduces spreading manipulated content." }
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
              { title: "No voice-only approvals", detail: "Require written or in-app confirmation." },
              { title: "Safe words", detail: "Agree on verification phrases for urgent asks." },
              { title: "Educate teams", detail: "Warn about cloned voice scams." }
            ]
          },
          quiz: {
            question: "A caller sounds like your manager asking for a wire. Safe move?",
            options: ["Send immediately", "Request a callback through an official number", "Share credentials", "Record and post"],
            correctAnswerIndex: 1,
            explanation: "Use known channels to verify before acting." }
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
              { title: "Mask early", detail: "Replace PII with tokens before model calls." },
              { title: "Access control", detail: "Limit who can view raw data." },
              { title: "Retention", detail: "Delete when no longer needed." }
            ]
          },
          quiz: {
            question: "What should logs contain when handling PII?",
            options: ["Full raw data", "Masked or tokenized values", "Public dumps", "Nothing ever"],
            correctAnswerIndex: 1,
            explanation: "Masking reduces exposure while keeping observability." }
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
              { title: "Purpose first", detail: "Tie every field to a clear purpose." },
              { title: "Short retention", detail: "Set expiration and deletion policies." },
              { title: "User consent", detail: "Explain why data is needed." }
            ]
          },
          quiz: {
            question: "Why avoid collecting unneeded PII?",
            options: ["Storage is free", "It reduces breach impact and compliance risk", "It speeds GPUs", "It improves CSS"],
            correctAnswerIndex: 1,
            explanation: "Less data lowers risk and regulatory exposure." }
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
              { title: "Channel choice", detail: "Avoid email or chat for raw PII." },
              { title: "Access scope", detail: "Limit who can download or export." },
              { title: "Audit", detail: "Log who accessed or shared sensitive files." }
            ]
          },
          quiz: {
            question: "Best way to send a file with PII?",
            options: ["Public link", "Encrypted channel with access controls", "Personal email", "Group chat"],
            correctAnswerIndex: 1,
            explanation: "Use encrypted, access-controlled channels for sensitive data." }
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
              { title: "Check summaries", detail: "Have assistants recap before acting." },
              { title: "Mute when private", detail: "Reduce ambient recording risk." },
              { title: "Permissions", detail: "Limit what the assistant can access." }
            ]
          },
          quiz: {
            question: "A smart speaker offers to order an item. Safe habit?",
            options: ["Auto-approve", "Require confirmation on device", "Share card details aloud", "Disable logs"],
            correctAnswerIndex: 1,
            explanation: "Confirm purchases to avoid accidental or malicious orders." }
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
              { title: "Downvote noise", detail: "Use dislike/hide to retrain the feed." },
              { title: "Reset", detail: "Periodic resets clear stale signals." },
              { title: "Time limits", detail: "Set app limits to avoid endless scroll." }
            ]
          },
          quiz: {
            question: "Your feed shows unwanted topics. First move?",
            options: ["Keep scrolling", "Use feedback tools (hide, dislike)", "Share more data", "Turn off safety"],
            correctAnswerIndex: 1,
            explanation: "Use built-in feedback to steer recommendations." }
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
              { title: "Fact-check", detail: "Verify claims and numbers." },
              { title: "Tone check", detail: "Ensure the message fits your audience." },
              { title: "Sensitive info", detail: "Avoid pasting confidential data into tools." }
            ]
          },
          quiz: {
            question: "Before sending an AI-written update you should…",
            options: ["Send as-is", "Verify facts and adjust tone", "Add more jargon", "Skip proofreading"],
            correctAnswerIndex: 1,
            explanation: "Human review catches inaccuracies and tone issues." }
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
              { title: "Summaries", detail: "Condense noisy alerts into briefs." },
              { title: "Cluster", detail: "Group similar alerts to reduce toil." },
              { title: "Human decision", detail: "Keep humans in loop for containment." }
            ]
          },
          quiz: {
            question: "What should AI do with SOC alerts?",
            options: ["Auto-close everything", "Summarize and prioritize for analysts", "Ignore low priority", "Delete logs"],
            correctAnswerIndex: 1,
            explanation: "Use AI for triage; humans approve actions." }
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
              { title: "URL checks", detail: "Flag lookalike domains." },
              { title: "Tone analysis", detail: "Urgency + secrecy = risky." },
              { title: "Containment", detail: "Quarantine suspected campaigns, then verify." }
            ]
          },
          quiz: {
            question: "AI flags a campaign as suspicious. Next move?",
            options: ["Auto-delete all mail", "Verify indicators then quarantine", "Share widely", "Ignore"],
            correctAnswerIndex: 1,
            explanation: "Verify, then quarantine to avoid false positives." }
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
              { title: "Standard fields", detail: "Impact, scope, timeline, and next steps." },
              { title: "Source links", detail: "Provide evidence and logs." },
              { title: "Human review", detail: "Check for hallucinated details." }
            ]
          },
          quiz: {
            question: "What belongs in an AI-generated incident brief?",
            options: ["Evidence links and scope", "Unverified rumors", "Personal data", "Blank fields"],
            correctAnswerIndex: 0,
            explanation: "Include evidence and scope; keep accuracy via review." }
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
              { title: "Label AI", detail: "Tell users when content is AI-generated." },
              { title: "Limits", detail: "State where the system may be wrong." },
              { title: "Verification", detail: "Encourage users to review important outputs." }
            ]
          },
          quiz: {
            question: "Why disclose AI use?",
            options: ["To add jargon", "Build trust and set correct expectations", "Increase token count", "Hide limits"],
            correctAnswerIndex: 1,
            explanation: "Transparency improves trust and responsible use." }
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
              { title: "Define owners", detail: "Assign accountability for each workflow." },
              { title: "Escalation", detail: "Know who decides when AI is unsure." },
              { title: "Review loops", detail: "Periodic reviews catch issues early." }
            ]
          },
          quiz: {
            question: "Who owns an AI-assisted decision?",
            options: ["No one", "The human team with authority", "The model vendor only", "The end user"],
            correctAnswerIndex: 1,
            explanation: "Humans with authority remain accountable." }
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
              { title: "List disallowed", detail: "E.g., harassment, malware, sensitive medical." },
              { title: "Communicate", detail: "Show policy inside the product." },
              { title: "Enforce", detail: "Align filters and moderation to the policy." }
            ]
          },
          quiz: {
            question: "What helps prevent misuse?",
            options: ["Hidden policies", "Clear acceptable-use rules and enforcement", "No logging", "Unlimited access"],
            correctAnswerIndex: 1,
            explanation: "Explicit policies plus enforcement reduce misuse." }
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
              { title: "Unexpected asks", detail: "If it feels off, pause and confirm." },
              { title: "Known channels", detail: "Call back using saved contacts, not provided numbers." },
              { title: "No secrets", detail: "Never share MFA codes over chat or voice." }
            ]
          },
          quiz: {
            question: "A video call looks like your CFO requesting gift cards. Safe step?",
            options: ["Buy immediately", "Verify via known phone or ticket system", "Share MFA codes", "Post online"],
            correctAnswerIndex: 1,
            explanation: "Always verify via trusted channels before acting." }
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
              { title: "Timeout", detail: "Take a moment; scammers thrive on speed." },
              { title: "Two-person rule", detail: "Require dual approval for payments." },
              { title: "Document", detail: "Keep a record of unusual requests." }
            ]
          },
          quiz: {
            question: "An email says 'urgent payment in 10 minutes'. Best move?",
            options: ["Pay now", "Verify through your finance process", "Send credentials", "Reply with info"],
            correctAnswerIndex: 1,
            explanation: "Follow standard verification, not the scammer’s urgency." }
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
              { title: "No sharing", detail: "Codes and passwords are never requested by support." },
              { title: "Official forms", detail: "Use known URLs, not links from strangers." },
              { title: "Report quickly", detail: "If you shared, reset and alert security." }
            ]
          },
          quiz: {
            question: "Where should MFA codes be entered?",
            options: ["In chat to anyone", "Only in the official login you initiated", "On social media", "In a text reply"],
            correctAnswerIndex: 1,
            explanation: "MFA codes belong only in trusted login flows you start." }
        }
      ]
    }
  ];

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
      <div className="min-h-screen bg-[#f0f0f0] dark:bg-slate-950 text-black dark:text-white font-sans selection:bg-yellow-400 selection:text-black" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }}>
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* --- HERO SECTION --- */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-20 pt-10"
          >
            <div className="bg-white dark:bg-slate-900 border-[6px] border-black dark:border-white p-10 md:p-16 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_rgba(255,255,255,0.05)] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Brain size={200} />
              </div>
              <h1 className="text-6xl md:text-9xl font-black mb-6 italic uppercase tracking-tighter text-black dark:text-white drop-shadow-[8px_8px_0px_rgba(59,130,246,0.8)] leading-none">
                AI AWARENESS <span className="text-blue-600 block md:inline">HUB</span>
              </h1>
              <div className="h-2 w-32 bg-yellow-400 mx-auto mb-8 border-2 border-black" />
              <p className="text-xl md:text-3xl font-black text-slate-700 dark:text-slate-300 max-w-4xl mx-auto italic uppercase tracking-tighter">
                "Your interactive field guide to surviving and thriving in the age of intelligence."
              </p>
            </div>
          </motion.div>

          {/* --- CONTROLS --- */}
          <motion.div className="sticky top-6 z-30 mb-16 flex flex-col gap-6">
            <div className={`flex flex-col md:flex-row gap-6 p-6 bg-white dark:bg-slate-800 ${COMIC_BORDER}`}>
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 text-black dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Scan intelligence logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-slate-100 dark:bg-slate-900 border-[4px] border-black dark:border-white font-black italic uppercase tracking-tighter outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 border-[4px] font-black uppercase italic text-sm transition-all whitespace-nowrap shadow-[4px_4px_0px_rgba(0,0,0,1)] ${selectedCategory === category
                      ? 'bg-yellow-400 text-black border-black translate-x-1 translate-y-1 shadow-none'
                      : 'bg-white dark:bg-slate-700 text-black dark:text-white border-black dark:border-white hover:-translate-y-1'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* --- GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AnimatePresence>
              {loading ? (
                <div className="col-span-3 text-center py-12">Loading Intelligence Data...</div>
              ) : filteredTopics.map((topic) => (
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
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {!loading && filteredTopics.length === 0 && (
            <div className="text-center py-24 bg-white dark:bg-slate-900 border-[6px] border-dashed border-black dark:border-white shadow-[12px_12px_0px_rgba(0,0,0,1)]">
              <Search className="w-24 h-24 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
              <h3 className="text-4xl font-black uppercase italic text-slate-400 dark:text-slate-600 tracking-tighter">Intel Not Found</h3>
            </div>
          )}

          {/* --- FOOTER BANNER --- */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-32 p-10 bg-cyan-400 dark:bg-slate-900 border-[6px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center gap-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-black/10" />
            <div className="w-24 h-24 bg-white border-[6px] border-black flex items-center justify-center flex-shrink-0 rotate-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <AlertTriangle className="w-14 h-14 text-black" strokeWidth={3} />
            </div>
            <div className="text-center md:text-left z-10">
              <h3 className="text-3xl md:text-4xl font-black text-black dark:text-white uppercase italic tracking-tighter mb-3">
                Final Intel: Vigilance is Required
              </h3>
              <p className="text-lg md:text-xl font-black italic text-black dark:text-slate-300 leading-tight uppercase tracking-tighter">
                AI technology evolves in every frame. The best defense is a sharp mind. Keep learning, stay curious, and always verify the source.
              </p>
            </div>
          </motion.div>
        </div>

        <ResourceModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
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