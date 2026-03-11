import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 shadow-inner">
      <div className="container mx-auto py-8 px-4 md:px-8 text-center">

        {/* Powered By Section */}
        <div className="mb-10">
          <h3 className="text-lg uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-6 font-bold">Powered By</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">

            {/* SAKEC Logo & Text */}
            <div className="flex flex-col items-center gap-3">
              <img src="/src/assets/sakec_logo.png" alt="SAKEC Logo" className="h-28 w-auto object-contain mix-blend-multiply dark:mix-blend-normal" />
              <span className="text-base font-semibold max-w-[280px] leading-snug">Shah and Anchor Kutchhi Engineering College</span>
            </div>

            {/* CyberPeace Logo & Text */}
            <div className="flex flex-col items-center gap-3">
              <img src="/src/assets/cyberpeace_logo.png" alt="CyberPeace Logo" className="h-28 w-auto object-contain mix-blend-multiply dark:mix-blend-normal" />
              <span className="text-base font-semibold">CyberPeace COE</span>
            </div>

          </div>
        </div>

        <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
          <p>&copy; 2025 AwareX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;