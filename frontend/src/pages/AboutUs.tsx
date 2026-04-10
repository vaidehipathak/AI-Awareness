import React from 'react';
import { motion } from 'framer-motion';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Target, 
  Users, 
  ShieldCheck, 
  Zap, 
  Code2, 
  Palette, 
  Globe
} from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
  github: string;
  linkedin: string;
  email: string;
  color: string;
  objectPosition?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Vaidehi Pathak",
    role: "Team Lead (3rd Year)",
    image: "/assets/team/vaidehi.png",
    description: "Focuses on system architecture and integration of AI detection modules.",
    github: "https://github.com/vaidehipathak",
    linkedin: "https://www.linkedin.com/in/vaidehi-pathak-b6610a28b/",
    email: "vaidehi.17814@sakec.ac.in",
    color: "from-blue-500 to-indigo-600",
    objectPosition: "top"
  },
  {
    name: "Om Mehta",
    role: "Developer (2nd Year)",
    image: "/assets/team/om.png",
    description: "Architect of the secure, rule-based backend infrastructure.",
    github: "https://github.com/Om-Mehta-143",
    linkedin: "https://linkedin.com/in/om-vivek-mehta",
    email: "om.mehta24@sakec.ac.in",
    color: "from-indigo-500 to-purple-600"
  },
  {
    name: "Neel Pasad",
    role: "Developer (2nd Year)",
    image: "/assets/team/neel.png",
    description: "Lead developer managing both the React frontend and Django backend systems.",
    github: "https://github.com/neel-pasad",
    linkedin: "https://www.linkedin.com/in/neel-pasad22",
    email: "neel.pasad24@sakec.ac.in",
    color: "from-purple-500 to-pink-600",
    objectPosition: "top"
  },
  {
    name: "Swayam Poojari",
    role: "Developer (3rd Year)",
    image: "/assets/team/swayam.jpeg",
    description: "Specializes in heuristic-based detection and explainable AI models.",
    github: "https://github.com/Swayam-2006",
    linkedin: "https://www.linkedin.com/in/swayam-poojari-6828b027a",
    email: "swayam.17955@sakec.ac.in",
    color: "from-rose-500 to-orange-500"
  },
  {
    name: "Jay Gurav",
    role: "Developer (3rd Year)",
    image: "/assets/team/jay.jpeg",
    description: "Expert in frontend performance and real-time data visualization.",
    github: "https://github.com/JayG1711",
    linkedin: "https://www.linkedin.com/in/jay-gurav/",
    email: "jaygurav2004@gmail.com",
    color: "from-emerald-500 to-teal-600",
    objectPosition: "top"
  },
  {
    name: "Purva Nalawade",
    role: "Developer (3rd Year)",
    image: "/assets/team/purva.jpeg",
    description: "Creator of the platform's glassmorphism and neobrutalist aesthetic.",
    github: "https://github.com/Nalawade-Purva",
    linkedin: "https://www.linkedin.com/in/purva-nalawade-532921315",
    email: "purva.17737@sakec.ac.in",
    color: "from-cyan-500 to-blue-500"
  }
];

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans selection:bg-indigo-500 selection:text-white pb-32">
      
      {/* Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[80px] mix-blend-multiply transition-colors dark:mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[80px] mix-blend-multiply transition-colors dark:mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        
        {/* --- SECTION 1: MISSION STATEMENT --- */}
        <section className="pt-32 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-600 dark:text-slate-300">
              Our Mission
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-12 tracking-tighter leading-[0.9]"
          >
            Securing the Future <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              One Byte at a Time.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            AI-AwareX was founded at the intersection of cybersecurity and AI ethics. Our goal is to demystify complex threats and provide everyone with the tools to defend their digital presence.
          </motion.p>
        </section>

        {/* --- SECTION 2: WHO WE ARE (TEAM CARDS) --- */}
        <section className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
              Meet the Visionaries
            </h2>
            <div className="w-16 h-1.5 bg-indigo-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative p-8 rounded-[3rem] bg-white/40 dark:bg-white/5 border border-white/20 backdrop-blur-2xl shadow-2xl overflow-hidden"
              >
                {/* Gradient Accent */}
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${member.color}`} />
                
                <div className="relative mb-8 text-center pt-4">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white/20 shadow-xl mb-6 ring-4 ring-indigo-500/0 group-hover:ring-indigo-500/20 transition-all">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover" 
                      style={{ objectPosition: member.objectPosition || 'center' }}
                    />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {member.name}
                  </h3>
                  <p className="text-indigo-500 font-bold uppercase tracking-widest text-xs mt-1">
                    {member.role}
                  </p>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-center font-medium leading-relaxed mb-10">
                  {member.description}
                </p>

                <div className="flex justify-center gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
                  <a 
                    href={member.github} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-slate-900 text-white hover:bg-indigo-600 transition-colors shadow-lg"
                  >
                    <Github size={20} />
                  </a>
                  <a 
                    href={member.linkedin} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[#0077b5] text-white hover:bg-indigo-600 transition-colors shadow-lg"
                  >
                    <Linkedin size={20} />
                  </a>
                  <a 
                    href={`mailto:${member.email}`}
                    className="p-3 rounded-2xl bg-white dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-100 transition-colors border border-slate-100 dark:border-white/10 shadow-lg"
                  >
                    <Mail size={20} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- SECTION 3: WHY WE BUILT THIS --- */}
        <section className="py-24 bg-slate-900 rounded-[4rem] px-8 md:px-16 text-white relative overflow-hidden shadow-3xl">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tighter leading-tight">
                The Invisibility of <br />
                <span className="text-indigo-500">Modern Risks.</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium leading-relaxed mb-10">
                In an era dominated by synthetic media and automated phishing, the average digital user is exposed to more threats than they can possibly track. We built AI-AwareX to bridge the gap between AI power and human safety.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Zap, text: "Real-time analysis without cloud dependency" },
                  { icon: Globe, text: "Privacy-first approach to PII discovery" },
                  { icon: Code2, text: "Deterministic models for explainable risk scoring" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <item.icon size={24} />
                    </div>
                    <span className="text-lg font-bold text-slate-200">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-[3rem] blur-[80px] opacity-20 animate-pulse" />
              <div className="relative p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl">
                 <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                   <ShieldCheck size={40} className="text-white" strokeWidth={2.5} />
                 </div>
                 <h3 className="text-3xl font-black mb-6 uppercase tracking-tight">Active Defense</h3>
                 <p className="text-slate-400 text-lg leading-relaxed">
                   By combining on-premises processing with sophisticated heuristic analysis, we eliminate the need for sending sensitive data to third-party APIs.
                 </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 4: OUR GOAL --- */}
        <section className="py-32 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Target className="w-16 h-16 text-pink-500 mx-auto mb-8 animate-bounce" />
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 leading-[0.9]">
               Deterministic Safety <br />
               for Everyone.
            </h2>
            <p className="text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-12">
               Our long-term goal is to set the standard for explainable AI security. We believe that safety shouldn't be a premium feature—it should be a fundamental human right in the digital age.
            </p>
            
            <button className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-500/40">
              Join Our Mission
            </button>
          </motion.div>
        </section>

      </div>
    </div>
  );
};

export default AboutUs;
