import React from 'react';
import { NavLink } from 'react-router-dom';
import Hero from '../components/Hero';

const FeatureCard = ({ to, icon, title, description }: { to: string, icon: React.ReactNode, title: string, description: string }) => (
  <NavLink to={to} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl dark:shadow-gray-800/50 transition-shadow duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center">
    <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </NavLink>
);

const Home: React.FC = () => {
  return (
    <div className="container mx-auto">
      <Hero />
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Explore Our Platform</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Dive into different sections to expand your knowledge and engage with our community.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            to="/awareness-hub" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" /></svg>}
            title="Awareness Hub"
            description="Explore in-depth articles, infographics, and resources on critical global issues."
          />
          <FeatureCard 
            to="/quiz" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="Interactive Quizzes"
            description="Test your knowledge and challenge your assumptions with our engaging quizzes."
          />
          <FeatureCard 
            to="/blog" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6M7 8h6" /></svg>}
            title="Community Blog"
            description="Read stories, updates, and perspectives from our team and contributors."
          />
        </div>
      </section>
    </div>
  );
};

export default Home;