import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="text-center py-20 md:py-32">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Welcome to the Awareness Platform
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          A centralized hub to learn about important global issues, test your knowledge, engage with our community, and take meaningful action.
        </p>
        <button 
          onClick={() => alert('Get Started button clicked!')}
          className="bg-primary hover:bg-primary-focus text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 duration-300 shadow-lg"
        >
          Get Started
        </button>
      </div>
    </section>
  );
};

export default Hero;