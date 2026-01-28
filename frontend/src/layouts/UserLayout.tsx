import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import AskAI from '../components/AskAI';

const UserLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500 relative overflow-hidden">
            {/* --- GLOBAL CINEMATIC BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
                <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <Sidebar />
            <div className="flex flex-col flex-1 ml-16 relative z-10">
                <Navbar />
                <main className="flex-grow pt-24 py-8 px-4 md:px-8">
                    <Outlet />
                </main>
                <Footer />
                <AskAI />
            </div>
        </div>
    );
};

export default UserLayout;
