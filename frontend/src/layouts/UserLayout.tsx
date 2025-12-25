import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AskAI from '../components/AskAI';

const UserLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Navbar />
            <main className="flex-grow pt-24 pb-12 px-4 md:px-8">
                <Outlet />
            </main>
            <Footer />
            <AskAI />
        </div>
    );
};

export default UserLayout;
