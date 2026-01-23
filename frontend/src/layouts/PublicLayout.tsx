import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AskAI from '../components/AskAI';

import Sidebar from '../components/Sidebar';

const PublicLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-16 w-full overflow-x-hidden"> {/* Added ml-16, w-full, overflow-x-hidden, removed transform */}
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

export default PublicLayout;
