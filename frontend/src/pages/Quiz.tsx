import React, { useState } from 'react';

const quizzes = [
  {
    title: 'Climate Change Basics',
    description: 'Test your knowledge on the fundamentals of climate science and global warming.',
    questions: 10,
    difficulty: 'Easy',
  },
  {
    title: 'Digital Literacy & Security',
    description: 'How well do you know about staying safe and informed in the digital world?',
    questions: 15,
    difficulty: 'Medium',
  },
  {
    title: 'Global Health Facts',
    description: 'Challenge yourself with questions about major health issues and milestones worldwide.',
    questions: 12,
    difficulty: 'Hard',
  },
  {
    title: 'Ocean Conservation',
    description: 'Dive deep into the challenges facing our oceans and the efforts to protect them.',
    questions: 10,
    difficulty: 'Medium',
  },
  {
    title: 'Renewable Energy Sources',
    description: 'Explore the technologies and benefits of renewable energy.',
    questions: 15,
    difficulty: 'Hard',
  },
];

const Quiz: React.FC = () => {
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredQuizzes = quizzes.filter(quiz => 
    difficultyFilter === 'All' || quiz.difficulty === difficultyFilter
  );

  return (
    <div className="container mx-auto">
      <div className="text-center p-8">
        <h1 className="text-4xl font-extrabold mb-4 text-primary tracking-tight">Test Your Knowledge</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Select a quiz from the options below to challenge yourself and learn something new.
        </p>
      </div>

      <div className="flex justify-center items-center gap-2 md:gap-4 mb-8 px-4">
        {difficulties.map(level => (
          <button 
            key={level}
            onClick={() => setDifficultyFilter(level)}
            className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full transition-colors duration-300 ${
              difficultyFilter === level 
              ? 'bg-primary text-white shadow' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
        {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{quiz.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{quiz.description}</p>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>{quiz.questions} Questions</span>
              <span className={`font-semibold px-2 py-1 rounded-full ${
                quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
              }`}>
                {quiz.difficulty}
              </span>
            </div>
            <button 
              onClick={() => alert(`Starting quiz: ${quiz.title}`)}
              className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 duration-300"
            >
              Start Quiz
            </button>
          </div>
        )) : (
          <p className="text-center text-gray-500 dark:text-gray-400 col-span-full">No quizzes found for this difficulty level.</p>
        )}
      </div>
    </div>
  );
};

export default Quiz;