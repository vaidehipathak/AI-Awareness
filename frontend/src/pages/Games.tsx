import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2, Trophy, Brain, Zap, Target, Eye, AlertTriangle, Play,
  RotateCcw, Check, X, ChevronRight, Star, Clock, Shield, Lock,
  Unlock, User, Activity, AlertOctagon, HelpCircle, ArrowLeft, Plus
} from 'lucide-react';
import { useTheme } from 'next-themes';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import BackButton from '../components/BackButton';

// Game Components Imports
import DeepfakeDetector from '../components/games/DeepfakeDetector';
import BiasSpotter from '../components/games/BiasSpotter';
import PhishingSorter from '../components/games/PhishingSorter';
import GamificationDashboard from '../components/games/GamificationDashboard';
import ContentEditModal from '../components/admin/ContentEditModal';
import AdminActionButtons from '../components/admin/AdminActionButtons';

const GamesPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'arcade' | 'leaderboard'>('arcade');
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  // --- GAME STATE ---
  interface Game {
    id: number;
    title: string;
    game_type: string;
    description: string;
    game_data: any;
    is_active: boolean;
  }

  const [allGames, setAllGames] = useState<Game[]>([]); // For admin list & data source
  const [loading, setLoading] = useState(true);

  // User Stats (Mock or from LocalStorage/Backend)
  const [lifetimeScores, setLifetimeScores] = useState<Record<string, number>>({
    dragdrop: 0,
    truefalse: 0,
    quiz: 0,
    memory: 0,
    deepfake: 0,
    biasspotter: 0,
    phishing: 0
  });

  // Fetch games
  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8000/api/transform/games/'); // Adjusted endpoint
      setAllGames(res.data);
    } catch (err) {
      console.error("Failed to fetch games", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    // Load scores from LS
    const savedScores = localStorage.getItem('ai_game_scores');
    if (savedScores) {
      setLifetimeScores(JSON.parse(savedScores));
    }
  }, []);

  const updateLifetimeScore = (gameKey: string, score: number) => {
    const newScores = { ...lifetimeScores, [gameKey]: (lifetimeScores[gameKey] || 0) + score };
    setLifetimeScores(newScores);
    localStorage.setItem('ai_game_scores', JSON.stringify(newScores));

    // Trigger confetti if high score or milestone (simple version)
    if (score > 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };


  /* ---------------- UI COMPONENTS ---------------- */

  const GameCard = ({ icon: Icon, title, description, onClick, color, locked = false }: any) => (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={!locked ? onClick : undefined}
      className={`relative overflow-hidden group cursor-pointer rounded-2xl p-6 h-full border-l-4 ${color} ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-indigo-50'} shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={120} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className={`p-3 w-fit rounded-xl mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} group-hover:bg-white/20 transition-colors`}>
          <Icon size={32} className={darkMode ? 'text-white' : 'text-gray-800'} />
        </div>

        <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm mb-6 flex-grow ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          {locked ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <Lock size={16} />
              <span>Locked</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm group-hover:translate-x-1 transition-transform">
              <span>Play Now</span>
              <Play size={16} className="fill-current" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  /* ---------------- GAME IMPLEMENTATIONS (Internal) ---------------- */
  // NOTE: More complex games (Deepfake, Bias, Phishing) are imported components.
  // Simple games (DragDrop, TrueFalse, Memory) are implemented here for demo.

  // 1. Drag & Drop Terminology
  const DragDropGame = () => {
    const [score, setScore] = useState(0);
    const [items, setItems] = useState([
      { id: '1', term: 'Neural Network', type: 'concept' },
      { id: '2', term: 'GPU', type: 'hardware' },
      { id: '3', term: 'Python', type: 'tool' },
      { id: '4', term: 'Dataset', type: 'resource' },
    ]);
    const [targets] = useState(['concept', 'hardware', 'tool', 'resource']);
    const [draggedItem, setDraggedItem] = useState<any>(null);

    const handleDrop = (target: string) => {
      if (draggedItem && draggedItem.type === target) {
        setScore(s => s + 10);
        setItems(items.filter(i => i.id !== draggedItem.id));
        confetti({ particleCount: 30, spread: 30, origin: { y: 0.7 } });
      }
      setDraggedItem(null);
    };

    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>AI Terminology Sort</h2>
          <div className="text-xl font-bold text-indigo-500">Score: {score}</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {targets.map(t => (
            <div
              key={t}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(t)}
              className={`h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center capitalize font-bold ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'}`}
            >
              {t}
            </div>
          ))}
        </div>

        <div className="flex gap-4 flex-wrap justify-center min-h-[100px]">
          {items.map(item => (
            <motion.div
              key={item.id}
              draggable
              onDragStart={() => setDraggedItem(item)}
              whileHover={{ scale: 1.05 }}
              whileDrag={{ scale: 1.1 }}
              className="px-6 py-3 bg-indigo-500 text-white rounded-full shadow-lg cursor-move font-medium"
            >
              {item.term}
            </motion.div>
          ))}
          {items.length === 0 && (
            <div className="text-center w-full">
              <h3 className="text-xl font-bold text-green-500 mb-4">All Sorted!</h3>
              <button
                onClick={() => {
                  setItems([
                    { id: '1', term: 'Neural Network', type: 'concept' },
                    { id: '2', term: 'GPU', type: 'hardware' },
                    { id: '3', term: 'Python', type: 'tool' },
                    { id: '4', term: 'Dataset', type: 'resource' },
                  ]);
                  updateLifetimeScore('dragdrop', score);
                  setScore(0);
                }}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };


  // 2. True/False Speed Run
  const TrueFalseGame = () => {
    const questions = [
      { q: "AI can feel human emotions.", a: false },
      { q: "Deep learning is a subset of Machine Learning.", a: true },
      { q: "All AI requires the internet to function.", a: false },
      { q: "GPT stands for Generative Pre-trained Transformer.", a: true },
    ];
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [active, setActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
      let interval: any;
      if (active && timeLeft > 0) {
        interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
      } else if (timeLeft === 0) {
        setGameOver(true);
        setActive(false);
        updateLifetimeScore('truefalse', score);
      }
      return () => clearInterval(interval);
    }, [active, timeLeft]);

    const handleAnswer = (ans: boolean) => {
      if (questions[index].a === ans) {
        setScore(s => s + 100);
      } else {
        setTimeLeft(t => Math.max(0, t - 5)); // Penalty
      }
      if (index < questions.length - 1) {
        setIndex(i => i + 1);
      } else {
        setGameOver(true);
        setActive(false);
        updateLifetimeScore('truefalse', score + timeLeft * 10);
      }
    };

    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 max-w-2xl mx-auto overflow-hidden relative`}>
        {!active && !gameOver ? (
          <div className="text-center py-12">
            <Zap size={64} className="mx-auto text-yellow-400 mb-6" />
            <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Speed Run</h2>
            <p className="mb-8 text-gray-500">Answer as many as you can in 30 seconds!</p>
            <button
              onClick={() => { setActive(true); setScore(0); setTimeLeft(30); setIndex(0); }}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl text-lg transition-transform hover:scale-105"
            >
              Start!
            </button>
          </div>
        ) : gameOver ? (
          <div className="text-center py-12">
            <Trophy size={64} className="mx-auto text-yellow-400 mb-6" />
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Game Over!</h2>
            <div className="text-5xl font-black text-indigo-500 mb-8">{score}</div>
            <button
              onClick={() => setGameOver(false)}
              className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div className="text-2xl font-bold text-yellow-500">{timeLeft}s</div>
              <div className="text-xl font-bold text-indigo-500">Score: {score}</div>
            </div>

            <div className={`text-center py-12 text-2xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {questions[index].q}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer(true)}
                className="py-6 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl transition-transform active:scale-95"
              >
                TRUE
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="py-6 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl transition-transform active:scale-95"
              >
                FALSE
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };


  // 3. Mini Trivia
  const MultipleChoiceGame = () => {
    // This is basically a mini-quiz, could reuse the Quiz component logic but simplified.
    // For now, let's skip implementing a 2nd quiz here to avoid redundancy with Quiz Page.
    // We will assume "Quiz" in games list redirects to Quiz Page or is a quick version.
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
        <Brain size={48} className="mx-auto text-indigo-500 mb-4" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Knowledge Challenge</h3>
        <p className="text-gray-500 mb-6">Test your deep knowledge in our dedicated Quiz Section.</p>
        <a href="/quiz" className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 inline-block">Go to Quizzes</a>
      </div>
    );
  };

  // 4. Spot the Bias (Simplified Visual Demo)
  const SpotBiasGame = () => {
    // A simplified text-based scenario version
    const scenarios = [
      {
        text: "An AI recruiting tool penalizes resumes with the word 'women's' (e.g. 'women's chess club captain').",
        bias: "Gender Bias",
        explanation: "The model learned from historical data where men were dominant in tech roles."
      },
      {
        text: "A facial recognition system struggles to identify people with darker skin tones.",
        bias: "Racial Bias",
        explanation: "The training dataset lacked diversity."
      }
    ];

    const [current, setCurrent] = useState(0);
    const [showReveal, setShowReveal] = useState(false);

    const next = () => {
      setShowReveal(false);
      setCurrent(c => (c + 1) % scenarios.length);
    };

    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="text-orange-500" />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Spot the Bias</h2>
        </div>

        <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'} border-l-4 border-indigo-500`}>
          <p className={`text-lg italic ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>"{scenarios[current].text}"</p>
        </div>

        {!showReveal ? (
          <div className="text-center">
            <p className="mb-4 text-gray-500">What kind of bias is this?</p>
            <button
              onClick={() => setShowReveal(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Reveal Answer
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h3 className="text-2xl font-bold text-red-500 mb-2">{scenarios[current].bias}</h3>
            <p className="text-gray-500 mb-6">{scenarios[current].explanation}</p>
            <button onClick={next} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Next Scenario</button>
          </motion.div>
        )}
      </div>
    );
  };

  // 5. Memory Match Game
  const MemoryGame = () => {
    const [cards, setCards] = useState<any[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [matchedCards, setMatchedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [score, setScore] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);

    const terms = [
      { id: 1, content: 'AI', type: 'term' },
      { id: 2, content: 'Artificial Intelligence', type: 'def' },
      { id: 3, content: 'ML', type: 'term' },
      { id: 4, content: 'Machine Learning', type: 'def' },
      { id: 5, content: 'NN', type: 'term' },
      { id: 6, content: 'Neural Network', type: 'def' },
      { id: 7, content: 'NLP', type: 'term' },
      { id: 8, content: 'Natural Language Processing', type: 'def' },
    ];

    useEffect(() => {
      initializeGame();
    }, []);

    const initializeGame = () => {
      const shuffled = [...terms].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setFlippedCards([]);
      setMatchedCards([]);
      setMoves(0);
      setScore(0);
      setGameComplete(false);
    };

    const handleCardClick = (id: number) => {
      if (flippedCards.length === 2 || matchedCards.includes(id) || flippedCards.includes(id)) return;

      const newFlipped = [...flippedCards, id];
      setFlippedCards(newFlipped);

      if (newFlipped.length === 2) {
        setMoves(moves + 1);
        const card1 = cards.find(c => c.id === newFlipped[0]);
        const card2 = cards.find(c => c.id === newFlipped[1]);

        if (
          (card1.type === 'term' && card2.type === 'def' && card1.id === card2.id - 1) ||
          (card1.type === 'def' && card2.type === 'term' && card1.id === card2.id + 1)
        ) {
          const newMatched = [...matchedCards, ...newFlipped];
          setMatchedCards(newMatched);
          setScore(score + 10);
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

  /* ---------------- ADMIN VIEW ---------------- */

  const AdminGameList = () => {
    const [isCreating, setIsCreating] = useState(false);

    // If somehow a non-admin gets here, show nothing (though parent hides it too)
    if (user?.role !== 'ADMIN') return null;

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} p-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Game Management</h1>
              <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Create, edit, and manage educational games.
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create New Game
            </button>
          </div>

          {/* Management Table */}
          <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className={`bg-slate-50 dark:bg-slate-700/50 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <tr>
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Title</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Content Items</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                  {allGames.map(game => (
                    <tr key={game.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs opacity-50">#{game.id}</td>
                      <td className={`px-6 py-4 font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{game.title}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                          {game.game_type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs opacity-75">
                        {Array.isArray(game.game_data) ? game.game_data.length : (game.game_data?.items?.length || 0)} items
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${game.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                          {game.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <AdminActionButtons item={game} contentType="games" onUpdate={fetchGames} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allGames.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No games found. Get started by creating one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <ContentEditModal
            isOpen={isCreating}
            onClose={() => setIsCreating(false)}
            item={null}
            contentType="games"
            onSuccess={fetchGames}
          />
        </div>
      </div>
    );
  };

  /* ---------------- LEARNER VIEW ---------------- */

  const LearnerGamesMenu = () => (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} p-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>AI Learning Games</h1>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Master AI concepts through interactive challenges</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <GameCard
            icon={Clock}
            title="True/False Lightning"
            description="Quick-fire True/False questions under time pressure."
            onClick={() => setCurrentGame('truefalse')}
            color="border-l-red-500"
          />

          <GameCard
            icon={Eye}
            title="Deepfake Detective"
            description="Can you spot AI-generated faces? Use clues and zoom to identify deepfakes!"
            onClick={() => setCurrentGame('deepfake')}
            color="border-l-purple-600"
          />

          <GameCard
            icon={Target}
            title="AI Bias Investigation"
            description="Investigate AI decisions and uncover hidden biases in algorithms!"
            onClick={() => setCurrentGame('bias-spotter')}
            color="border-l-orange-500"
          />

          <GameCard
            icon={Zap}
            title="Phishing Email Sorter"
            description="Sort emails as phishing or legitimate under time pressure. Build combos!"
            onClick={() => setCurrentGame('phishing')}
            color="border-l-cyan-500"
          />
        </div>

        <div className="mt-12">
          <GamificationDashboard />
        </div>
      </div>
    </div>
  );

  // Main Render Switch
  // If User is Admin -> Show AdminGameList ONLY
  // If User is Learner -> Show LearnerGamesMenu

  if (user?.role === 'ADMIN' && !currentGame) {
    return <AdminGameList />;
  }

  // If Admin is somehow "playing" (e.g. testing) we could allow it via a hidden toggle, 
  // but strictly following requirements: "Admins CONTROL ... DO NOT play".
  // So if currentGame is set but user is ADMIN, we should probably reset/redirect or just show the admin list.
  // However, "Modify existing components" implies we might want to keep the "Play" logic available if explicitly navigated?
  // Let's enforce the restriction: Admin sees ONLY management.

  if (user?.role === 'ADMIN') {
    return <AdminGameList />;
  }

  // Learner Logic
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
      case 'deepfake':
        return (
          <div className={`min-h-screen ${bgClass} p-8`}>
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <BackButton onClick={() => setCurrentGame(null)} />
              </div>
              <DeepfakeDetector
                data={allGames.find(g => g.game_type === 'DEEPFAKE_DETECTOR')?.game_data || { rounds: [] }}
                onScoreUpdate={(score: number) => updateLifetimeScore('deepfake', score)}
              />
            </div>
          </div>
        );
      case 'bias-spotter':
        return (
          <div className={`min-h-screen ${bgClass} p-8`}>
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <BackButton onClick={() => setCurrentGame(null)} />
              </div>
              <BiasSpotter
                data={allGames.find(g => g.game_type === 'BIAS_SPOTTER')?.game_data || { scenarios: [] }}
                onScoreUpdate={(score: number) => updateLifetimeScore('biasspotter', score)}
              />
            </div>
          </div>
        );
      case 'phishing':
        return (
          <div className={`min-h-screen ${bgClass} p-8`}>
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <BackButton onClick={() => setCurrentGame(null)} />
              </div>
              <PhishingSorter
                data={allGames.find(g => g.game_type === 'PHISHING_SORTER')?.game_data || { emails: [] }}
                onScoreUpdate={(score: number) => updateLifetimeScore('phishing', score)}
              />
            </div>
          </div>
        );
      default:
        return <LearnerGamesMenu />;
    }
  };

  return renderCurrentGame();
};

export default GamesPage;