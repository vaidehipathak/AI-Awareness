import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

import { ChevronRight, Clock, Trophy, Brain, Target, Eye, BookOpen, Cpu, Zap, Shuffle, Award } from 'lucide-react';

const GamesPage: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [lifetimeScores, setLifetimeScores] = useState<any>({
    dragdrop: 0,
    truefalse: 0,
    quiz: 0,
    bias: 0,
    memory: 0,
    matching: 0,
    sequence: 0,
    classification: 0,
    wordpuzzle: 0,
    total: 0,
    gamesPlayed: 0
  });

  const updateLifetimeScore = (gameType: string, points: number) => {
    setLifetimeScores((prev: any) => ({
      ...prev,
      [gameType]: prev[gameType] + points,
      total: prev.total + points,
      gamesPlayed: prev.gamesPlayed + 1
    }));
  };

  const resetAllScores = () => {
    setLifetimeScores({
      dragdrop: 0,
      truefalse: 0,
      quiz: 0,
      bias: 0,
      memory: 0,
      matching: 0,
      sequence: 0,
      classification: 0,
      wordpuzzle: 0,
      total: 0,
      gamesPlayed: 0
    });
  };

  // Utility functions
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getRandomItems = (array: any[], count: number) => {
    return shuffleArray(array).slice(0, Math.min(count, array.length));
  };

  // Game Data
  const dragDropData = [
    { term: "Machine Learning", definition: "Algorithm that learns from data" },
    { term: "Neural Network", definition: "Brain-inspired computing system" },
    { term: "Deep Learning", definition: "ML with multiple layers" },
    { term: "NLP", definition: "Natural language processing" },
    { term: "Computer Vision", definition: "AI interpreting images" },
    { term: "Supervised Learning", definition: "Learning with labeled data" },
    { term: "Unsupervised Learning", definition: "Finding patterns in data" },
    { term: "Reinforcement Learning", definition: "Learning through rewards" },
    { term: "Overfitting", definition: "Too specific to training data" },
    { term: "Classification", definition: "Predicting categories" },
    { term: "Regression", definition: "Predicting numbers" },
    { term: "Clustering", definition: "Grouping similar data" },
    { term: "Algorithm", definition: "Step-by-step procedure" },
    { term: "Big Data", definition: "Extremely large datasets" },
    { term: "Feature", definition: "Measurable data property" },
    { term: "Gradient Descent", definition: "Optimization algorithm" },
    { term: "Backpropagation", definition: "Neural network training" },
    { term: "Transformer", definition: "Attention-based model" },
    { term: "CNN", definition: "Convolutional neural network" },
    { term: "RNN", definition: "Recurrent neural network" }
  ];

  const trueFalseData = [
    { question: "Machine Learning is a subset of AI", answer: true },
    { question: "Deep Learning always requires labeled data", answer: false },
    { question: "Neural networks are inspired by the brain", answer: true },
    { question: "AI can only work with numbers", answer: false },
    { question: "Supervised learning needs labeled data", answer: true },
    { question: "Overfitting means good performance on new data", answer: false },
    { question: "ChatGPT uses Natural Language Processing", answer: true },
    { question: "AI systems are always 100% accurate", answer: false },
    { question: "Computer Vision helps AI understand images", answer: true },
    { question: "More data always means better models", answer: false },
    { question: "Reinforcement learning uses rewards", answer: true },
    { question: "All AI needs internet connectivity", answer: false },
    { question: "Gradient descent optimizes models", answer: true },
    { question: "Random Forest is one decision tree", answer: false },
    { question: "LSTM can handle sequences", answer: true },
    { question: "Bias only means statistical error", answer: false },
    { question: "Transfer learning reuses pretrained models", answer: true },
    { question: "CNNs are good for image processing", answer: true },
    { question: "All neural nets have same structure", answer: false },
    { question: "Hyperparameters are learned during training", answer: false }
  ];

  const multipleChoiceData = [
    {
      question: "What does CNN stand for?",
      options: ["Computer Neural Network", "Convolutional Neural Network", "Complex Network Node", "Cognitive Neural Net"],
      correct: 1
    },
    {
      question: "Which algorithm is best for clustering?",
      options: ["Linear Regression", "K-Means", "Logistic Regression", "Decision Tree"],
      correct: 1
    },
    {
      question: "What is the main purpose of dropout?",
      options: ["Speed up training", "Reduce overfitting", "Increase accuracy", "Add more layers"],
      correct: 1
    },
    {
      question: "Which is NOT a supervised learning task?",
      options: ["Classification", "Regression", "Clustering", "Prediction"],
      correct: 2
    },
    {
      question: "What does NLP stand for?",
      options: ["Neural Learning Process", "Natural Language Processing", "Network Layer Protocol", "Numeric Linear Programming"],
      correct: 1
    },
    {
      question: "What is backpropagation used for?",
      options: ["Data preprocessing", "Training neural networks", "Testing models", "Collecting data"],
      correct: 1
    },
    {
      question: "Which metric combines precision and recall?",
      options: ["Accuracy", "F1 Score", "AUC", "Loss"],
      correct: 1
    },
    {
      question: "What is transfer learning?",
      options: ["Moving data", "Using pretrained models", "Converting files", "Data transfer"],
      correct: 1
    },
    {
      question: "Which activation function is most common?",
      options: ["Sigmoid", "Linear", "ReLU", "Softmax"],
      correct: 2
    },
    {
      question: "What is an epoch in training?",
      options: ["One sample", "Complete data pass", "One layer", "One parameter"],
      correct: 1
    }
  ];

  const biasData = [
    {
      scenario: "Resume Screening AI",
      description: "AI ranks top 5 engineering candidates:",
      candidates: [
        "Alex (Male) - MIT, 5yrs Google",
        "Sarah (Female) - Stanford, 7yrs Meta",
        "Michael - Harvard, 6yrs Amazon",
        "Jennifer (Female) - Berkeley, 8yrs Microsoft",
        "David - Caltech, 4yrs Apple"
      ],
      biasType: "Gender bias - women ranked lower despite better experience",
      correctAnswer: 1
    },
    {
      scenario: "Loan Approval System",
      description: "AI evaluates loan applications:",
      candidates: [
        "$75K, 750 credit, Downtown - Approved",
        "$76K, 755 credit, East Side - Denied",
        "$74K, 748 credit, Suburbs - Approved",
        "$77K, 760 credit, North - Approved",
        "$73K, 745 credit, West - Approved"
      ],
      biasType: "Geographic bias - East Side systematically denied",
      correctAnswer: 1
    },
    {
      scenario: "Medical Diagnosis Confidence",
      description: "AI confidence for chest pain:",
      candidates: [
        "65yo Male - 95% risk",
        "35yo Female - 60% risk",
        "45yo Male - 88% risk",
        "55yo Female - 65% risk",
        "50yo Male - 85% risk"
      ],
      biasType: "Gender bias - lower confidence for women",
      correctAnswer: 1
    },
    {
      scenario: "Facial Recognition Accuracy",
      description: "Security system accuracy:",
      candidates: [
        "White males - 99.7%",
        "White females - 99.3%",
        "Black males - 88.0%",
        "Black females - 65.3%",
        "Asian males - 98.6%"
      ],
      biasType: "Racial/gender bias - poor accuracy for Black women",
      correctAnswer: 3
    },
    {
      scenario: "University Admissions",
      description: "Graduate school recommendations:",
      candidates: [
        "3.8 GPA, State school - Accept",
        "3.7 GPA, Private - Accept",
        "3.9 GPA, Community college - Reject",
        "3.6 GPA, Ivy League - Accept",
        "3.8 GPA, Online - Reject"
      ],
      biasType: "Educational prestige bias",
      correctAnswer: 2
    }
  ];

  const memoryData = [
    { term: "ML", definition: "Learns from data" },
    { term: "Neural Net", definition: "Brain-inspired" },
    { term: "Deep Learning", definition: "Multiple layers" },
    { term: "NLP", definition: "Language AI" },
    { term: "CNN", definition: "Image network" },
    { term: "RNN", definition: "Sequence network" },
    { term: "Supervised", definition: "Labeled data" },
    { term: "Unsupervised", definition: "No labels" },
    { term: "Overfitting", definition: "Too specific" },
    { term: "Gradient", definition: "Optimization" }
  ];

  // Component definitions
  const GameCard: React.FC<any> = ({ icon: Icon, title, description, onClick, color }) => (
    <div
      className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 ${color} h-full flex flex-col`}
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`w-6 h-6 ${color.replace('border-l-', 'text-')}`} />
        </div>
        <h3 className="text-lg font-bold ml-3">{title}</h3>
      </div>
      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed flex-grow text-sm`}>{description}</p>
    </div>
  );

  const BackButton: React.FC<any> = ({ onClick }) => (
    <button
      onClick={onClick}
      className={`mb-6 flex items-center ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors`}
    >
      <ChevronRight className="w-5 h-5 rotate-180 mr-1" />
      Back to Games
    </button>
  );

  // ScoreBoard Component
  const ScoreBoard: React.FC = () => {
    const [showDetails, setShowDetails] = useState(false);

    const gameNames: any = {
      dragdrop: 'Drag & Drop',
      truefalse: 'True/False',
      quiz: 'Multiple Choice',
      bias: 'Spot Bias',
      memory: 'Memory Match',
      matching: 'Quick Match',
      sequence: 'Sequence',
      classification: 'Classify',
      wordpuzzle: 'Word Puzzle'
    };

    const getScoreLevel = (score: number) => {
      if (score >= 1000) return { level: 'AI Master', color: 'text-purple-500', bg: 'bg-purple-100' };
      if (score >= 500) return { level: 'AI Expert', color: 'text-blue-500', bg: 'bg-blue-100' };
      if (score >= 200) return { level: 'AI Enthusiast', color: 'text-green-500', bg: 'bg-green-100' };
      if (score >= 50) return { level: 'AI Learner', color: 'text-yellow-500', bg: 'bg-yellow-100' };
      return { level: 'AI Beginner', color: 'text-gray-500', bg: 'bg-gray-100' };
    };

    const scoreLevel = getScoreLevel(lifetimeScores.total);
    const averageScore = lifetimeScores.gamesPlayed > 0 ? Math.round(lifetimeScores.total / lifetimeScores.gamesPlayed) : 0;

    return (
      <div className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 max-w-4xl mx-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <Trophy className="w-6 h-6 inline mr-2 text-yellow-500" />
            Lifetime Scoreboard
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors`}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {lifetimeScores.total.toLocaleString()}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Score</div>
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {lifetimeScores.gamesPlayed}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Games Played</div>
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {averageScore}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</div>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${darkMode
            ? 'bg-opacity-20 bg-purple-500 text-purple-400'
            : `${scoreLevel.bg} ${scoreLevel.color}`
            }`}>
            <span className="font-semibold">{scoreLevel.level}</span>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-3">
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>Game Breakdown:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(gameNames).map(([gameKey, gameName]: any) => (
                <div
                  key={gameKey}
                  className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                >
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {gameName}
                  </span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {lifetimeScores[gameKey]}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={resetAllScores}
                className={`px-4 py-2 text-sm ${darkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
                  } rounded-lg transition-colors`}
              >
                Reset All Scores
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Game 1: Drag and Drop
  const DragDropGame: React.FC = () => {
    const [gameData, setGameData] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [score, setScore] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    useEffect(() => {
      const selectedData = getRandomItems(dragDropData, 5);
      setGameData(selectedData);
    }, []);

    const handleDragStart = (e: any, term: string) => {
      setDraggedItem(term);
    };

    const handleDragOver = (e: any) => {
      e.preventDefault();
    };

    const handleDrop = (e: any, definition: string) => {
      e.preventDefault();
      if (!draggedItem) return;

      const correctMatch = gameData.find(item =>
        item.term === draggedItem && item.definition === definition
      );

      if (correctMatch && !matches.find(m => m.term === draggedItem)) {
        const newMatches = [...matches, { term: draggedItem, definition }];
        setMatches(newMatches);
        setScore(score + 20);

        if (newMatches.length === gameData.length) {
          setGameComplete(true);
          updateLifetimeScore('dragdrop', score + 20);
        }
      }
      setDraggedItem(null);
    };

    const resetGame = () => {
      const selectedData = getRandomItems(dragDropData, 5);
      setGameData(selectedData);
      setMatches([]);
      setScore(0);
      setGameComplete(false);
    };

    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Drag & Drop Matching</h2>
          <div className="flex items-center space-x-4">
            <div className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Score: {score}</div>
            <button onClick={resetGame} className={`px-4 py-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition-colors`}>
              New Game
            </button>
          </div>
        </div>

        {gameComplete ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>Congratulations!</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Final Score: {score}</p>
            <button onClick={resetGame} className={`px-6 py-3 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition-colors`}>
              Play Again
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Terms</h3>
              <div className="space-y-3">
                {gameData.map((item, index) => {
                  const isMatched = matches.find(m => m.term === item.term);
                  return (
                    <div
                      key={index}
                      draggable={!isMatched}
                      onDragStart={(e) => handleDragStart(e, item.term)}
                      className={`p-4 rounded-lg border-2 cursor-move transition-all ${isMatched
                        ? `${darkMode ? 'bg-green-900 border-green-600 text-green-300' : 'bg-green-100 border-green-300 text-green-700'}`
                        : `${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`
                        }`}
                    >
                      {item.term}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Definitions</h3>
              <div className="space-y-3">
                {shuffleArray(gameData).map((item, index) => {
                  const isMatched = matches.find(m => m.definition === item.definition);
                  return (
                    <div
                      key={index}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item.definition)}
                      className={`p-4 rounded-lg border-2 transition-all ${isMatched
                        ? `${darkMode ? 'bg-green-900 border-green-600 text-green-300' : 'bg-green-100 border-green-300 text-green-700'}`
                        : `${darkMode ? 'bg-gray-700 border-gray-600 border-dashed hover:bg-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 border-dashed hover:bg-gray-100'}`
                        }`}
                    >
                      {item.definition}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Game 2: True/False Lightning
  const TrueFalseGame: React.FC = () => {
    const [currentQuestions, setCurrentQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameActive, setGameActive] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const timerRef = useRef<any>(null);

    useEffect(() => {
      if (gameActive && timeLeft > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
        }, 1000);
      } else if (timeLeft === 0 && gameActive) {
        endGame();
      }
      return () => clearTimeout(timerRef.current);
    }, [timeLeft, gameActive]);

    const startGame = () => {
      const questions = getRandomItems(trueFalseData, 5);
      setCurrentQuestions(questions);
      setCurrentIndex(0);
      setScore(0);
      setTimeLeft(30);
      setGameActive(true);
      setGameComplete(false);
      setAnswered(false);
      setIsCorrect(null);
    };

    const endGame = () => {
      setGameActive(false);
      setGameComplete(true);
      clearTimeout(timerRef.current);
      updateLifetimeScore('truefalse', score);
    };

    const handleAnswer = (userAnswer: boolean) => {
      if (answered || !gameActive) return;

      setAnswered(true);
      const currentQuestion = currentQuestions[currentIndex];
      const correct = userAnswer === currentQuestion.answer;
      setIsCorrect(correct);

      if (correct) {
        const timeBonus = Math.max(1, Math.floor(timeLeft / 6));
        setScore(score + 10 + timeBonus);
      }

      setTimeout(() => {
        if (currentIndex + 1 < currentQuestions.length) {
          setCurrentIndex(currentIndex + 1);
          setAnswered(false);
          setIsCorrect(null);
        } else {
          endGame();
        }
      }, 1500);
    };

    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>True/False Lightning</h2>
          {gameActive && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-red-600">
                <Clock className="w-5 h-5 mr-1" />
                <span className="text-xl font-bold">{timeLeft}s</span>
              </div>
              <div className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Score: {score}</div>
            </div>
          )}
        </div>

        {!gameActive && !gameComplete && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ready for Lightning Round?</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Answer 5 questions in 30 seconds!</p>
            <button onClick={startGame} className={`px-8 py-3 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg text-lg`}>
              Start Game
            </button>
          </div>
        )}

        {gameActive && currentQuestions.length > 0 && (
          <div className="text-center">
            <div className="mb-6">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Question {currentIndex + 1} of {currentQuestions.length}</span>
            </div>

            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-8 mb-8`}>
              <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currentQuestions[currentIndex].question}</h3>

              <div className="flex justify-center space-x-6">
                <button
                  onClick={() => handleAnswer(true)}
                  disabled={answered}
                  className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-lg font-semibold"
                >
                  TRUE
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  disabled={answered}
                  className="px-8 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-lg font-semibold"
                >
                  FALSE
                </button>
              </div>
            </div>

            {answered && (
              <div className={`text-lg font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect!'}
              </div>
            )}
          </div>
        )}

        {gameComplete && (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>Time's Up!</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Final Score: {score} points</p>
            <button onClick={startGame} className={`px-6 py-3 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg`}>
              Play Again
            </button>
          </div>
        )}
      </div>
    );
  };

  // Game 3: Multiple Choice Quiz
  const MultipleChoiceGame: React.FC = () => {
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);

    useEffect(() => {
      startNewGame();
    }, []);

    const startNewGame = () => {
      const selected = getRandomItems(multipleChoiceData, 5);
      setQuestions(selected);
      setCurrentIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setGameComplete(false);
    };

    const handleAnswer = (index: number) => {
      setSelectedAnswer(index);
      setShowResult(true);
      if (index === questions[currentIndex].correct) {
        setScore(score + 20);
      }
    };

    const nextQuestion = () => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameComplete(true);
        updateLifetimeScore('quiz', score + (selectedAnswer === questions[currentIndex].correct ? 20 : 0));
      }
    };

    if (questions.length === 0) return <div>Loading...</div>;

    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Multiple Choice Quiz</h2>
          <div className="flex items-center space-x-4">
            <div className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Score: {score}</div>
            <button onClick={startNewGame} className={`px-4 py-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg`}>
              New Quiz
            </button>
          </div>
        </div>

        {gameComplete ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>Quiz Complete!</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Final Score: {score}/{questions.length * 20}</p>
            <button onClick={startNewGame} className={`px-6 py-3 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg`}>
              Play Again
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Question {currentIndex + 1} of {questions.length}</span>
            </div>

            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 mb-6`}>
              <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{questions[currentIndex].question}</h3>

              <div className="space-y-3">
                {questions[currentIndex].options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => !showResult && handleAnswer(index)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showResult
                      ? index === questions[currentIndex].correct
                        ? `${darkMode ? 'bg-green-900 border-green-600' : 'bg-green-50 border-green-300'}`
                        : selectedAnswer === index
                          ? `${darkMode ? 'bg-red-900 border-red-600' : 'bg-red-50 border-red-300'}`
                          : `${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-200'}`
                      : `${darkMode ? 'border-gray-600 hover:bg-gray-600 hover:border-blue-500' : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300'}`
                      }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                  </button>
                ))}
              </div>
            </div>

            {showResult && (
              <div className="text-center">
                <button onClick={nextQuestion} className={`px-6 py-3 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg`}>
                  {currentIndex + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Game 4: Spot the Bias
  const SpotBiasGame: React.FC = () => {
    const [currentScenario, setCurrentScenario] = useState<any>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
      loadNewScenario();
    }, []);

    const loadNewScenario = () => {
      const scenario = biasData[Math.floor(Math.random() * biasData.length)];
      setCurrentScenario(scenario);
      setSelectedAnswer(null);
      setShowExplanation(false);
    };

    const handleAnswer = (index: number) => {
      setSelectedAnswer(index);
      setShowExplanation(true);
      if (index === currentScenario.correctAnswer) {
        setScore(score + 25);
        updateLifetimeScore('bias', 25);
      }
    };

    if (!currentScenario) return <div>Loading...</div>;

    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Spot the Bias</h2>
          <div className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Score: {score}</div>
        </div>

        <div className="mb-6">
          <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currentScenario.scenario}</h3>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{currentScenario.description}</p>
        </div>

        <div className="space-y-3 mb-6">
          {currentScenario.candidates.map((candidate: string, index: number) => (
            <div
              key={index}
              onClick={() => !showExplanation && handleAnswer(index)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${showExplanation
                ? index === currentScenario.correctAnswer
                  ? `${darkMode ? 'bg-red-900 border-red-600' : 'bg-red-100 border-red-300'}`
                  : selectedAnswer === index
                    ? `${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`
                    : `${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`
                : `${darkMode ? 'hover:bg-gray-700 border-gray-600 hover:border-blue-500' : 'hover:bg-blue-50 border-gray-200 hover:border-blue-300'}`
                }`}
            >
              {candidate}
            </div>
          ))}
        </div>

        {showExplanation && (
          <div className={`${darkMode ? 'bg-yellow-900 border-yellow-600' : 'bg-yellow-50 border-yellow-400'} border-l-4 p-4 mb-6`}>
            <h4 className={`font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-800'} mb-2`}>Explanation:</h4>
            <p className={`${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>{currentScenario.biasType}</p>
            {selectedAnswer === currentScenario.correctAnswer ? (
              <p className={`${darkMode ? 'text-green-400' : 'text-green-600'} font-semibold mt-2`}>✓ Correct!</p>
            ) : (
              <p className={`${darkMode ? 'text-red-400' : 'text-red-600'} font-semibold mt-2`}>✗ Try again!</p>
            )}
          </div>
        )}

        <div className="text-center">
          <button onClick={loadNewScenario} className={`px-6 py-3 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg`}>
            Next Scenario
          </button>
        </div>
      </div>
    );
  };

  // Game 5: Memory Match
  const MemoryGame: React.FC = () => {
    const [cards, setCards] = useState<any[]>([]);
    const [flippedCards, setFlippedCards] = useState<any[]>([]);
    const [matchedCards, setMatchedCards] = useState<any[]>([]);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);

    useEffect(() => {
      initializeGame();
    }, []);

    const initializeGame = () => {
      const gameItems = getRandomItems(memoryData, 5);
      const gameCards: any[] = [];

      gameItems.forEach((item, index) => {
        gameCards.push({ id: `term-${index}`, content: item.term, type: 'term', matchId: index });
        gameCards.push({ id: `def-${index}`, content: item.definition, type: 'definition', matchId: index });
      });

      setCards(shuffleArray(gameCards));
      setFlippedCards([]);
      setMatchedCards([]);
      setScore(0);
      setMoves(0);
      setGameComplete(false);
    };

    const handleCardClick = (cardId: string) => {
      if (flippedCards.includes(cardId) || matchedCards.includes(cardId) || flippedCards.length === 2) {
        return;
      }

      const newFlippedCards = [...flippedCards, cardId];
      setFlippedCards(newFlippedCards);

      if (newFlippedCards.length === 2) {
        setMoves(moves + 1);

        const [card1Id, card2Id] = newFlippedCards;
        const card1 = cards.find(c => c.id === card1Id);
        const card2 = cards.find(c => c.id === card2Id);

        if (card1.matchId === card2.matchId) {
          const newMatched = [...matchedCards, card1Id, card2Id];
          setMatchedCards(newMatched);
          setScore(score + 20);
          setFlippedCards([]);

          if (newMatched.length === cards.length) {
            setGameComplete(true);
            updateLifetimeScore('memory', score + 20);
          }
        } else {
          setTimeout(() => {
            setFlippedCards([]);
          }, 1000);
        }
      }
    };

    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Memory Match</h2>
          <div className="flex items-center space-x-4">
            <div className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Score: {score}</div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Moves: {moves}</div>
            <button onClick={initializeGame} className={`px-4 py-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg`}>
              New Game
            </button>
          </div>
        </div>

        {gameComplete ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>Excellent!</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Matched all pairs in {moves} moves!</p>
            <button onClick={initializeGame} className={`px-6 py-3 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg`}>
              Play Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card) => {
              const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
              const isMatched = matchedCards.includes(card.id);

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`h-32 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center text-center p-2 ${isMatched
                    ? `${darkMode ? 'bg-green-900 border-2 border-green-600' : 'bg-green-100 border-2 border-green-300'}`
                    : isFlipped
                      ? card.type === 'term'
                        ? `${darkMode ? 'bg-blue-900 border-2 border-blue-600' : 'bg-blue-100 border-2 border-blue-300'}`
                        : `${darkMode ? 'bg-purple-900 border-2 border-purple-600' : 'bg-purple-100 border-2 border-purple-300'}`
                      : `${darkMode ? 'bg-gray-700 border-2 border-gray-600 hover:bg-gray-600' : 'bg-gray-200 border-2 border-gray-300 hover:bg-gray-300'}`
                    }`}
                >
                  {isFlipped ? (
                    <span className={`text-sm font-semibold ${isMatched
                      ? `${darkMode ? 'text-green-300' : 'text-green-700'}`
                      : card.type === 'term'
                        ? `${darkMode ? 'text-blue-300' : 'text-blue-700'}`
                        : `${darkMode ? 'text-purple-300' : 'text-purple-700'}`
                      }`}>
                      {card.content}
                    </span>
                  ) : (
                    <span className="text-4xl">🤖</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Main Menu
  const GamesMenu: React.FC = () => (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} p-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>AI Learning Games</h1>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Master AI concepts through interactive challenges</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          <GameCard
            icon={Target}
            title="Drag & Drop"
            description="Match AI terms with their definitions using drag and drop."
            onClick={() => setCurrentGame('dragdrop')}
            color="border-l-blue-500"
          />

          <GameCard
            icon={Clock}
            title="True/False Lightning"
            description="Quick-fire True/False questions under time pressure."
            onClick={() => setCurrentGame('truefalse')}
            color="border-l-red-500"
          />

          <GameCard
            icon={Brain}
            title="Multiple Choice"
            description="Test your AI knowledge with multiple choice questions."
            onClick={() => setCurrentGame('quiz')}
            color="border-l-green-500"
          />

          <GameCard
            icon={Eye}
            title="Spot the Bias"
            description="Identify biased decisions in AI scenarios."
            onClick={() => setCurrentGame('bias')}
            color="border-l-purple-500"
          />

          <GameCard
            icon={BookOpen}
            title="Memory Match"
            description="Flip cards to match AI terms with definitions."
            onClick={() => setCurrentGame('memory')}
            color="border-l-yellow-500"
          />
        </div>

        <div className="text-center mt-12">
          <ScoreBoard />
        </div>
      </div>
    </div>
  );

  // Game Router
  const renderCurrentGame = () => {
    const bgClass = darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100';

    switch (currentGame) {
      case 'dragdrop':
        return (
          <div className={`min-h-screen ${bgClass} p-8`}>
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <BackButton onClick={() => setCurrentGame(null)} />
              </div>
              <DragDropGame />
            </div>
          </div>
        );
      case 'truefalse':
        return (
          <div className={`min-h-screen ${bgClass} p-8`}>
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <BackButton onClick={() => setCurrentGame(null)} />
              </div>
              <TrueFalseGame />
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div className={`min-h-screen ${bgClass} p-8`}>
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <BackButton onClick={() => setCurrentGame(null)} />
              </div>
              <MultipleChoiceGame />
            </div>
          </div>
        );
      case 'bias':
        return (
          <div className={`min-h-screen ${bgClass} p-8`}>
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <BackButton onClick={() => setCurrentGame(null)} />
              </div>
              <SpotBiasGame />
            </div>
          </div>
        );
      case 'memory':
        return (
          <div className={`min-h-screen ${bgClass} p-8`}>
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <BackButton onClick={() => setCurrentGame(null)} />
              </div>
              <MemoryGame />
            </div>
          </div>
        );
      default:
        return <GamesMenu />;
    }
  };

  return renderCurrentGame();
};

export default GamesPage;