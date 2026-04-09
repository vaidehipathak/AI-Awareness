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
      domain: "elementsofai.com",
      customLogo: "/elements-of-ai.png",
      desc: "Free online course by Reaktor & University of Helsinki.",
      color: "from-zinc-900 to-zinc-700" // Minimalist Black/White theme
    },
    {
      name: "Ethics of AI",
      url: "https://ethics-of-ai.mooc.fi/",
      domain: "mooc.fi",
      customLogo: "/ethics-of-ai.png",
      desc: "In-depth look at ethical questions in AI.",
      color: "from-blue-900 to-slate-800" // Academic Blue
    },
    {
      name: "IBM SkillsBuild",
      url: "https://skillsbuild.org/students/course-catalog/artificial-intelligence",
      domain: "skillsbuild.org",
      customLogo: "/ibm.png",
      desc: "Foundational AI skills for students.",
      color: "from-[#05216d] to-[#0f62fe]" // IBM Blue
    },
    {
      name: "Great Learning",
      url: "https://www.mygreatlearning.com/ai/free-courses",
      domain: "mygreatlearning.com",
      customLogo: "/great-learning.png",
      desc: "Top-rated free AI post-graduate courses.",
      color: "from-[#085dad] to-[#2d87e2]" // Brand Blue
    },
    {
      name: "Alison",
      url: "https://alison.com/course/ai-governance-and-ethics",
      domain: "alison.com",
      customLogo: "/alison.png",
      desc: "Governance, ethics, and compliance training.",
      color: "from-[#009b7d] to-[#83b93a]" // Alison Green
    },
    {
      name: "AI For All",
      url: "https://ai-for-all.in/#/home",
      domain: "india.gov.in",
      customLogo: "/digital-india.png", // User provided logo
      desc: "India's National Program for AI awareness.",
      color: "from-orange-600 to-green-600 bg-gradient-to-r"
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
            <span className="relative inline-block">
              <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-2xl opacity-30" />
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-2 pr-6">
                Before AI Understands You.
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

      {/* --- SECTION 2: FEATURES (Glassmorphism Cards) --- */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">
              Advanced Protection Features
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">
              Securing your digital identity with deterministic AI analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Deepfake Detection",
                desc: "Identify synthetic faces and media manipulation with high-precision heuristic analysis.",
                icon: ImageIcon,
                color: "from-blue-500 to-indigo-500"
              },
              {
                title: "PII Risk Assessment",
                desc: "Automatically detect and scrub personally identifiable information from text and images.",
                icon: Fingerprint,
                color: "from-emerald-500 to-teal-500"
              },
              {
                title: "PDF Forensics",
                desc: "Deep-layer inspection of document metadata and structure to identify fraud and tampering.",
                icon: FileText,
                color: "from-orange-500 to-amber-500"
              },
              {
                title: "Gamified Awareness",
                desc: "Interactive missions and quizzes designed to build critical cybersecurity intuition.",
                icon: BrainCircuit,
                color: "from-purple-500 to-pink-500"
              },
              {
                title: "Explainable Analysis",
                desc: "No black-boxes. Every risk assessment comes with a deterministic, human-readable justification.",
                icon: ShieldCheck,
                color: "from-cyan-500 to-blue-500"
              },
              {
                title: "Institutional Oversight",
                desc: "Robust role-based access and audit trails for organizational security management.",
                icon: Lock,
                color: "from-slate-700 to-slate-900"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-white/5 border border-white/20 backdrop-blur-2xl transition-all duration-500 shadow-2xl hover:shadow-indigo-500/20 overflow-hidden"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg transform group-hover:rotate-6 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 3: PURPOSE / WHY THIS PLATFORM EXISTS --- */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
              Why AwareX Exists
            </h2>
            <div className="w-24 h-2 bg-indigo-500 mx-auto rounded-full" />
            <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed italic">
              "Traditional security tools are black-boxes that compromise privacy. We built AwareX to give you explainable, deterministic analysis that stays local and stays private."
            </p>
            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto text-left md:text-center">
              AI-AwareX was born from the need for a transparent cybersecurity platform. By focusing on heuristic-based detection rather than opaque machine learning models, we provide institutional-grade risk assessment that anyone can understand and verify.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 4: PAGE PREVIEWS (Alternating Layout) --- */}
      <section className="py-32 bg-white dark:bg-[#0a0a0a] relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Explore the Platform
            </h2>
          </div>

          <div className="space-y-32">
            {[
              {
                name: "Awareness Hub",
                desc: "Our flagship learning center. Master the Age of AI through interactive missions, real-world scenarios, and deep-dive modules on PII, bias, and media manipulation.",
                link: "/awareness-hub",
                img: "/assets/screens/awarenesshub.png"
              },
              {
                name: "Interactive Games",
                desc: "Cybersecurity doesn't have to be boring. Build your intuition through gamified challenges that test your ability to spot deepfakes and identify phishing attempts in real-time.",
                link: "/games",
                img: "/assets/screens/games.png"
              },
              {
                name: "Analysis Reports",
                desc: "Get crystal clear insights into your files. Our unified reporting engine provides detailed risk labels and human-readable justifications for every detection.",
                link: "/report",
                img: "/assets/screens/analysis.png"
              },
              {
                name: "Admin Oversight",
                desc: "For institutions and educators. Oversee platform activity, manage learning modules, and audit system performance through a centralized management dashboard.",
                link: "/login",
                img: "/assets/screens/admin_panel_security_control_center.png"
              },
              {
                name: "About Our Mission",
                desc: "Meet the team of developers and researchers dedicated to building a safer, more transparent digital future for everyone.",
                link: "/about-us",
                img: "/assets/screens/about-us.png"
              }
            ].map((page, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-24 items-center`}
              >
                {/* Image Preview Container */}
                <div 
                  onClick={() => navigate(page.link)}
                  className="w-full lg:w-1/2 aspect-video bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden group cursor-pointer relative"
                >
                   <motion.img 
                      src={page.img} 
                      alt={page.name}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full object-cover"
                   />
                   <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-500 pointer-events-none" />
                </div>

                {/* Page Description */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {page.name}
                  </h3>
                  <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {page.desc}
                  </p>
                  <button
                    onClick={() => navigate(page.link)}
                    className="flex items-center gap-2 text-indigo-500 font-black uppercase tracking-widest hover:gap-4 transition-all"
                  >
                    View Page <ArrowRight size={20} strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* --- SECTION 5: GLOBAL AI LITERACY --- */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
              Expand Your <span className="text-indigo-500">AI Literacy</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
              Continue your learning journey with these world-class educational resources and certifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Elements of AI", url: "https://www.elementsofai.com/", desc: "A free online course for everyone by the University of Helsinki." },
              { name: "Ethics of AI", url: "https://ethics-of-ai.mooc.fi/", desc: "Deep dive into the ethical dimensions of artificial intelligence." },
              { name: "IBM SkillsBuild", url: "https://skillsbuild.org/students/course-catalog/artificial-intelligence", desc: "Professional AI credentials and pathways for students." },
              { name: "Great Learning", url: "https://www.mygreatlearning.com/ai/free-courses", desc: "Free certifications for beginners and professionals alike." },
              { name: "Alison Ethics", url: "https://alison.com/course/ai-governance-and-ethics", desc: "Comprehensive course on AI governance and responsibility." },
              { name: "AI For All", url: "https://ai-for-all.in/#/home", desc: "Empowering every citizen with fundamental AI awareness." }
            ].map((platform, i) => (
              <motion.a
                key={i}
                href={platform.url}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -5 }}
                className="group p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors">
                    {platform.name}
                  </h4>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    {platform.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">
                  Visit Platform <ArrowRight size={14} strokeWidth={3} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>


      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 dark:bg-[#050505] border-t border-slate-200 dark:border-white/5 py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h4 className="font-black text-2xl text-slate-900 dark:text-white mb-2">AwareX</h4>
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