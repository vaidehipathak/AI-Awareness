import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  FileUp,
  BrainCircuit,
  FileText,
  Lock,
  EyeOff,
  ScanSearch,
  BookOpen,
  ArrowRight,
  Users,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  GraduationCap,
  Building2,
  Image as ImageIcon,
  Video,
  AlertTriangle,
  Fingerprint,
  ChevronRight,
  Globe,
  Upload,
  Play
} from 'lucide-react';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [demoTab, setDemoTab] = useState<'IMAGE' | 'PII' | 'PDF'>('IMAGE');
  const [scanning, setScanning] = useState(false);

  // Parallax & Scroll Effects
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const runDemoScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      navigate('/report');
    }, 1500);
  };

  const trustedPlatforms = [
    {
      name: "Elements of AI",
      url: "https://www.elementsofai.com/",
    },
    {
      name: "Ethics of AI (University of Helsinki)",
      url: "https://ethics-of-ai.mooc.fi/",
    },
    {
      name: "IBM SkillsBuild – Artificial Intelligence",
      url: "https://skillsbuild.org/students/course-catalog/artificial-intelligence",
    },
    {
      name: "Great Learning – Free AI Courses",
      url: "https://www.mygreatlearning.com/ai/free-courses",
    },
    {
      name: "Alison – AI Governance & Ethics",
      url: "https://alison.com/course/ai-governance-and-ethics",
    },
    {
      name: "AI For All (AI-For-All.in)",
      url: "https://ai-for-all.in/#/home",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans selection:bg-indigo-500 selection:text-white">


      {/* --- AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[80px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[80px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-500/10 rounded-full blur-[80px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />
        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* --- 1. HERO SECTION (Immersive) --- */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 overflow-hidden z-10">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="text-center max-w-5xl mx-auto">
          {/* Floating Pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-600 dark:text-slate-300">
              AI Safety Ecosystem v2.0
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[0.9]"
          >
            Understand AI <br />
            <span className="relative">
              <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-2xl opacity-30" />
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                Before It Hacks You.
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            The world's first <span className="font-bold text-slate-900 dark:text-white">Active Defense Platform</span> against AI misinformation, deepfakes, and privacy theft.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >

            <button
              onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold shadow-2xl hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] hover:scale-105 transition-all overflow-hidden"
            >
              <span className="relative z-10">Explore The Risks</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <button
              onClick={() => navigate('/games')}
              className="px-8 py-4 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-full font-bold backdrop-blur-md hover:bg-white dark:hover:bg-white/10 transition-all flex items-center gap-3"
            >
              <Play size={18} fill="currentColor" /> Play Awareness Games
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* --- 2. IMPACT STATS (Glass Cards) --- */}
      <section id="what-is-this" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                title: "Synthetic Media",
                desc: "Detect AI-generated faces & scenes.",
                stat: "99.8% Accuracy",
                icon: ImageIcon,
                color: "text-blue-500",
                border: "group-hover:border-blue-500/50",
                shadow: "group-hover:shadow-blue-500/20"
              },
              {
                title: "Privacy Leaks",
                desc: "Scan text for hidden PII exposure.",
                stat: "Real-time Scrub",
                icon: Fingerprint,
                color: "text-green-500",
                border: "group-hover:border-green-500/50",
                shadow: "group-hover:shadow-green-500/20"
              },
              {
                title: "Document Fraud",
                desc: "Analyze PDFs for manipulation.",
                stat: "Metadata Scan",
                icon: FileText,
                color: "text-orange-500",
                border: "group-hover:border-orange-500/50",
                shadow: "group-hover:shadow-orange-500/20"
              },
              {
                title: "Misinfo Ed.",
                desc: "Learn to spot fake news patterns.",
                stat: "50+ Modules",
                icon: BrainCircuit,
                color: "text-purple-500",
                border: "group-hover:border-purple-500/50",
                shadow: "group-hover:shadow-purple-500/20"
              },
              {
                title: "Forensics",
                desc: "Deep inspection of signal traces.",
                stat: "Spectral Analysis",
                icon: FileUp,
                color: "text-pink-500",
                border: "group-hover:border-pink-500/50",
                shadow: "group-hover:shadow-pink-500/20"
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(item.title === 'Misinfo Ed.' ? '/awareness-hub' : '/report')}
                className={`group relative p-6 h-64 rounded-3xl bg-white dark:bg-gray-900/40 border border-slate-100 dark:border-white/5 backdrop-blur-md transition-all duration-300 shadow-xl cursor-pointer overflow-hidden flex flex-col justify-between ${item.border} ${item.shadow}`}
              >
                {/* Hover Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 mt-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.stat}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <ArrowRight size={14} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 3. PROBLEM & REALITY CHECK --- */}
      <section id="problem" className="py-32 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-8 text-slate-900 dark:text-white leading-tight">
                The Gap Between <br />
                <span className="text-indigo-500">AI Power</span> & <span className="text-pink-500">Human Safety</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                While AI generates content in milliseconds, human verification takes hours. We bridge this critical gap with real-time analysis and education.
              </p>

              <div className="space-y-6">
                {[
                  "Identity Theft via Deepfakes",
                  "Automated Phishing Attacks",
                  "Invisible PII Leaks"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                      <AlertTriangle size={24} />
                    </div>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-[2.5rem] blur-[60px] opacity-20 animate-pulse" />
              <div className="relative bg-slate-900 rounded-[2.5rem] p-10 border border-white/10 shadow-2xl overflow-hidden coding-font">
                {/* Fake Terminal UI */}
                <div className="flex gap-2 mb-8">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-4 font-mono text-sm">
                  <div className="text-green-400">$ scan video_input.mp4</div>
                  <div className="text-slate-400"> Analyzing frame data... [================] 100%</div>
                  <div className="text-red-400 font-bold bg-red-400/10 p-2 rounded border-l-2 border-red-500">
                    [ALERT] Face Swap Detected (Confidence: 99.8%)
                  </div>
                  <div className="text-slate-400 opacity-50"> Origin: Synthetic GAN Generator</div>
                  <div className="text-slate-400 opacity-50"> Audio: Mismatched Spectrogram</div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-slate-500">System Status</span>
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Active Protection
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- 4. STEP-BY-STEP (Connected Flow) --- */}
      <section className="py-32 bg-slate-100 dark:bg-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">How We Protect You</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-[2px] bg-slate-200 dark:bg-white/10 z-0" />

            {[
              { title: "Upload", icon: Upload, desc: "Secure & Encrypted" },
              { title: "Scan", icon: ScanSearch, desc: "Multi-Model AI" },
              { title: "Analyze", icon: BrainCircuit, desc: "Risk Scoring" },
              { title: "Learn", icon: BookOpen, desc: "Actionable Insights" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <step.icon className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 5. LIVE DEMO WIDGET --- */}
      <section className="py-32 px-4 relative z-10">
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-gray-800 overflow-hidden relative">
          {/* Glossy Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Sidebar Controls */}
            <div className="p-10 bg-slate-50 dark:bg-gray-800/50 border-r border-slate-100 dark:border-gray-700">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Try It Live</h3>
              <div className="space-y-4">
                {(['IMAGE', 'PII', 'PDF'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDemoTab(tab)}
                    className={`w-full p-4 rounded-xl text-left font-bold transition-all flex items-center gap-4 ${demoTab === tab
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-white dark:bg-gray-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    {tab === 'IMAGE' && <ImageIcon size={20} />}
                    {tab === 'PII' && <Fingerprint size={20} />}
                    {tab === 'PDF' && <FileText size={20} />}
                    {tab === 'IMAGE' ? 'Deepfake Scan' : tab === 'PII' ? 'PII Detection' : 'Document Analysis'}
                  </button>
                ))}
              </div>
            </div>

            {/* Interaction Area */}
            <div className="lg:col-span-2 p-10 md:p-16 flex flex-col justify-center items-center text-center bg-dot-pattern">
              <AnimatePresence mode="wait">
                <motion.div
                  key={demoTab}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-md"
                >
                  <div className="mb-8">
                    <div className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-2xl mb-6">
                      {demoTab === 'IMAGE' && <ImageIcon size={40} />}
                      {demoTab === 'PII' && <Fingerprint size={40} />}
                      {demoTab === 'PDF' && <FileText size={40} />}
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {demoTab === 'IMAGE' && "Upload Suspicious Media"}
                      {demoTab === 'PII' && "Check Text for PII"}
                      {demoTab === 'PDF' && "Forensic PDF Scan"}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400">
                      Advanced {demoTab.toLowerCase()} analysis algorithms ready.
                    </p>
                  </div>

                  <div
                    onClick={runDemoScan}
                    className="relative h-64 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group overflow-hidden"
                  >
                    {scanning ? (
                      <motion.div
                        initial={{ height: "0%" }}
                        animate={{ height: "100%" }}
                        transition={{ duration: 1.5, ease: "linear" }}
                        className="absolute top-0 left-0 w-full bg-gradient-to-b from-transparent to-indigo-500/20 border-b-2 border-indigo-500 z-0"
                      />
                    ) : null}

                    <Upload className={`w-12 h-12 text-slate-400 group-hover:text-indigo-500 mb-4 transition-colors z-10 ${scanning ? 'animate-bounce' : ''}`} />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 z-10">
                      {scanning ? "Processing..." : "Click to Run Demo"}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* --- 6. ROLES SECTION --- */}
      <section className="py-24 px-4 bg-slate-900 text-white rounded-[3rem] mx-4 lg:mx-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">Empowering Every Stakeholder</h2>
            <p className="text-slate-400">Tailored tools for every role in the digital ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Students", icon: GraduationCap, desc: "Learn via Gamified Quizzes", action: "Start Playing" },
              { title: "Educators", icon: BookOpen, desc: "Curriculum & Risk Demos", action: "Get Resources" },
              { title: "Admins", icon: ShieldCheck, desc: "Organizational Oversight", action: "Admin Panel" },
            ].map((role, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                <role.icon className="w-12 h-12 text-indigo-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-2">{role.title}</h3>
                <p className="text-slate-400 mb-8 h-12">{role.desc}</p>
                <button
                  onClick={() => navigate(role.title === "Admins" ? '/login' : '/awareness-hub')}
                  className="w-full py-4 rounded-xl bg-indigo-600 font-bold hover:bg-indigo-500 transition-colors"
                >
                  {role.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 7. GOVT & TRUST --- */}
      <section className="py-24 text-center">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-12">
          Trusted Learning Platforms for AI Awareness
        </p>

        <div
          className="
      grid grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      gap-10
      max-w-5xl
      mx-auto
    "
        >
          {trustedPlatforms.map((platform, i) => (
            <a
              key={i}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
          group
          flex items-center justify-center gap-2
          text-lg font-extrabold
          text-slate-700 dark:text-slate-200
          hover:text-indigo-500 dark:hover:text-indigo-400
          transition-colors duration-300
        "
            >
              <span>{platform.name}</span>
              <ExternalLink
                size={18}
                className="opacity-70 group-hover:opacity-100 transition-opacity"
              />
            </a>
          ))}
        </div>
      </section>


      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 dark:bg-[#050505] border-t border-slate-200 dark:border-white/5 py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h4 className="font-black text-2xl text-slate-900 dark:text-white mb-2">Awareness.io</h4>
            <p className="text-slate-500 text-sm">Building a safer digital future.</p>
          </div>

          <div className="flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#" className="hover:text-indigo-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

// Icon helper
const FileCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);

export default Home;