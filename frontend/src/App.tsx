import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AskAI from './components/AskAI';
import Home from './pages/Home';
import AwarenessHub from './pages/AwarenessHub';
import Quiz from './pages/Quiz';
import Games from './pages/Games';
import Blog from './pages/Blog';
import Report from './pages/Report';


const App: React.FC = () => {
  return (
    <ThemeProvider attribute="class">
      <HashRouter>
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
          <Navbar />
          <main className="flex-grow pt-24 pb-12 px-4 md:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/awareness-hub" element={<AwarenessHub />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/games" element={<Games />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/report" element={<Report />} />
            </Routes>
          </main>
          <Footer />
          <AskAI />
        </div>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
