import React from 'react';

const games = [
  {
    title: 'Recycle Rush',
    description: 'Sort trash into the correct bins before time runs out! A fast-paced game about recycling.',
    icon: '♻️'
  },
  {
    title: 'Carbon Footprint Calculator',
    description: 'An interactive game to calculate and understand your environmental impact.',
    icon: '👣'
  },
  {
    title: 'Fact or Fiction: Health Edition',
    description: 'Distinguish between common health myths and proven medical facts.',
    icon: '🤔'
  },
];

const Games: React.FC = () => {
  return (
    <div className="container mx-auto">
      <div className="text-center p-8">
        <h1 className="text-4xl font-extrabold mb-4 text-primary tracking-tight">Interactive Games</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Learn about important topics through fun and engaging games. More games coming soon!
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
        {games.map((game, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
            <div className="text-5xl mb-4">{game.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{game.title}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow">{game.description}</p>
            <button 
              onClick={() => alert(`Starting game: ${game.title}`)}
              className="w-full mt-4 bg-secondary hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 duration-300"
            >
              Play Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Games;