import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 dark:bg-[#080c14] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-white/10 transition-colors duration-500 font-sans">
      <div className="container mx-auto py-12 px-4 md:px-8 text-center">

        {/* Institutional & Partner Section */}
        <div className="mb-10">
          <h3 className="text-xs md:text-sm uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-8 font-black">
            INSTITUTIONAL PARTNERS & CENTER OF EXCELLENCE
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">

            {/* SAKEC Logo Card */}
            <div className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/40 transition-all duration-300 w-full max-w-sm">
              <div className="h-24 flex items-center justify-center p-3 rounded-xl bg-white dark:bg-white/95 border border-slate-100 dark:border-white/10 w-full">
                <img
                  src="/src/assets/sakec_logo.png"
                  alt="Shah and Anchor Kutchhi Engineering College Logo"
                  className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                Shah & Anchor Kutchhi Engineering College
              </span>
            </div>

            {/* CyberPeace Logo Card */}
            <div className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/40 transition-all duration-300 w-full max-w-sm">
              <div className="h-24 flex items-center justify-center p-3 rounded-xl bg-white dark:bg-white/95 border border-slate-100 dark:border-white/10 w-full">
                <img
                  src="/src/assets/cyberpeace_logo.png"
                  alt="CyberPeace Foundation Logo"
                  className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                CyberPeace Center of Excellence
              </span>
            </div>

          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} AwareX. All rights reserved.</p>
          <p className="font-medium">Deterministic & Explainable Cybersecurity Analysis Platform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;