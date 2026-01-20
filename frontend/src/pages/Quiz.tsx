import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Trophy, Clock, CheckCircle, XCircle, AlertTriangle,
  ChevronRight, Play, RotateCcw, BarChart2, BookOpen, Star, Plus, Shield
} from 'lucide-react';
import { useTheme } from 'next-themes';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import BackButton from '../components/BackButton';
import GamificationDashboard from '../components/games/GamificationDashboard';
import ContentEditModal from '../components/admin/ContentEditModal';
import AdminActionButtons from '../components/admin/AdminActionButtons';
import { quizCatalog, QuizCategory, QuizQuestion } from '../data/quizCatalog';

const QuizPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  // State
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null); // Index of selected option
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Difficulty Selection
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // --- FETCH DATA ---
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      // Try to fetch from backend first
      const response = await axios.get('http://localhost:8000/api/transform/quizzes/');
      // Transform logic if needed, but for now assuming backend returns compatible structure
      // If backend fails or empty, fall back to static catalog
      if (response.data && response.data.length > 0) {
        setCategories(response.data);
      } else {
        setCategories(quizCatalog);
      }
    } catch (err) {
      console.warn("Backend quiz fetch failed, using static catalog.", err);
      setCategories(quizCatalog);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // --- GAMEPLAY LOGIC ---

  const handleStartQuiz = (category: QuizCategory) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setIsAnswered(false);
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    const currentQuestion = selectedCategory?.questions[currentQuestionIndex];
    if (currentQuestion && optionIndex === currentQuestion.correctAnswer) {
      setScore(s => s + 10);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#4ade80', '#22c55e'] // Green confetti
      });
    }
  };

  const handleNextQuestion = () => {
    if (!selectedCategory) return;

    if (currentQuestionIndex < selectedCategory.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
      if (score > (selectedCategory.questions.length * 10 * 0.7)) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const calculateProgress = () => {
    if (!selectedCategory) return 0;
    return ((currentQuestionIndex + (showResults ? 1 : 0)) / selectedCategory.questions.length) * 100;
  };

  /* ---------------- COMPONENT: QUIZ CARD ---------------- */

  const QuizCard = ({ category }: { category: QuizCategory }) => (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group relative overflow-hidden rounded-2xl p-6 h-full border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col`}
      onClick={() => handleStartQuiz(category)}
    >
      <div className={`absolute top-0 right-0 p-4 transition-transform group-hover:rotate-12 ${category.color.replace('bg-', 'text-').replace('/10', '')} opacity-20`}>
        <Brain size={64} />
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${category.color} text-white shadow-md`}>
        <category.icon size={24} />
      </div>

      <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{category.title}</h3>
      <p className={`text-sm mb-4 flex-grow ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{category.description}</p>

      <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
        <span className="flex items-center gap-1"><BookOpen size={14} /> {category.questions.length} Qs</span>
        <span className="flex items-center gap-1"><Clock size={14} /> ~{Math.ceil(category.questions.length * 1.5)}m</span>
        <span className="flex items-center gap-1 text-indigo-500 group-hover:translate-x-1 transition-transform">Start <ChevronRight size={14} /></span>
      </div>
    </motion.div>
  );

  /* ---------------- COMPONENT: QUESTION RENDERER ---------------- */

  const QuestionView = () => {
    if (!selectedCategory) return null;
    const question = selectedCategory.questions[currentQuestionIndex];

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <BackButton onClick={() => setSelectedCategory(null)} />
          <div className="text-sm font-bold text-gray-400">
            Question {currentQuestionIndex + 1} of {selectedCategory.questions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-8 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress()}%` }}
            className="h-full bg-indigo-500"
          />
        </div>

        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700`}
        >
          <div className="flex items-start gap-4 mb-6">
            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 rounded-lg text-sm">
              {question.difficulty.toUpperCase()}
            </span>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'} leading-tight`}>
              {question.question}
            </h2>
          </div>

          <div className="space-y-4">
            {question.options.map((option, idx) => {
              // Styling Logic
              // Default: Gray/White
              // Selected & Correct: Green
              // Selected & Wrong: Red
              // Not Selected but Correct (Reveal): Green Outline
              let baseStyle = `${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-slate-50 hover:bg-slate-100'} border-2 border-transparent`;

              if (isAnswered) {
                if (idx === question.correctAnswer) {
                  baseStyle = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300";
                } else if (idx === selectedAnswer) {
                  baseStyle = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300";
                } else {
                  baseStyle = "opacity-50 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex justify-between items-center ${baseStyle}`}
                >
                  <span className="font-medium text-lg">{option}</span>
                  {isAnswered && idx === question.correctAnswer && <CheckCircle size={20} className="text-green-600" />}
                  {isAnswered && idx === selectedAnswer && idx !== question.correctAnswer && <XCircle size={20} className="text-red-600" />}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next Button */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <div className={`p-4 rounded-xl mb-6 ${question.correctAnswer === selectedAnswer ? 'bg-green-50 dark:bg-green-900/10' : 'bg-orange-50 dark:bg-orange-900/10'}`}>
                  <h4 className={`font-bold mb-1 flex items-center gap-2 ${question.correctAnswer === selectedAnswer ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'}`}>
                    {question.correctAnswer === selectedAnswer ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    {question.correctAnswer === selectedAnswer ? "Correct!" : "Not quite right..."}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{question.explanation}</p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-transform hover:-translate-y-1"
                  >
                    {currentQuestionIndex < selectedCategory.questions.length - 1 ? 'Next Question' : 'View Results'}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  /* ---------------- COMPONENT: RESULTS VIEW ---------------- */

  const ResultsView = () => {
    if (!selectedCategory) return null;
    const totalQs = selectedCategory.questions.length;
    const percentage = Math.round((score / (totalQs * 10)) * 100);

    let feedback = "Needs Improvement";
    if (percentage >= 90) feedback = "AI Expert!";
    else if (percentage >= 70) feedback = "Great Job!";
    else if (percentage >= 50) feedback = "Getting There";

    return (
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl p-12 relative overflow-hidden`}
        >
          {/* Background decoration */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="mb-8 relative inline-block">
            <Trophy size={80} className="text-yellow-400 mx-auto" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full -z-10"
            />
          </div>

          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-2">
            {feedback}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">You completed the {selectedCategory.title} Quiz</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{score}</div>
              <div className="text-xs uppercase font-bold text-indigo-400/80">Points</div>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{percentage}%</div>
              <div className="text-xs uppercase font-bold text-purple-400/80">Accuracy</div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalQs}</div>
              <div className="text-xs uppercase font-bold text-blue-400/80">Questions</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Menu
            </button>
            <button
              onClick={() => handleStartQuiz(selectedCategory!)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2"
            >
              <RotateCcw size={18} /> Try Again
            </button>
          </div>

        </motion.div>
      </div>
    );
  };

  /* ---------------- COMPONENT: ADMIN LIST ---------------- */

  const AdminQuizList = () => {
    const [isCreating, setIsCreating] = useState(false);

    // In strict mode, admin doesn't see quizzes
    // But let's show them the management table
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} p-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Quiz Management</h1>
              <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Create and manage quiz modules and questions.
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Quiz
            </button>
          </div>

          {/* Table */}
          <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden`}>
            <table className="w-full text-left text-sm">
              <thead className={`bg-slate-50 dark:bg-slate-700/50 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Questions</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4 font-mono text-xs opacity-50">#{cat.id}</td>
                    <td className={`px-6 py-4 font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{cat.title}</td>
                    <td className="px-6 py-4 capitalize">{cat.questions[0]?.difficulty || 'Mixed'}</td>
                    <td className="px-6 py-4">{cat.questions.length}</td>
                    <td className="px-6 py-4 text-right">
                      {/* Using AdminActionButtons roughly adapts to 'quizzes' type if updated, otherwise manual logic */}
                      <div className="flex justify-end gap-2">
                        <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-blue-500">Edit</button>
                        <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-red-500">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ContentEditModal
            isOpen={isCreating}
            onClose={() => setIsCreating(false)}
            item={null}
            contentType="quizzes"
            onSuccess={fetchQuizzes}
          />
        </div>
      </div>
    );
  };


  /* ---------------- MAIN RENDER ---------------- */

  // Admin View
  if (user?.role === 'ADMIN') {
    return <AdminQuizList />;
  }

  // Quiz Playing View
  if (selectedCategory) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-slate-50'} p-6 md:p-12`}>
        {!showResults ? <QuestionView /> : <ResultsView />}
      </div>
    );
  }

  // Learner Menu View
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-slate-50'} p-6 md:p-12`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className={`text-4xl font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Knowledge Hub
            </h1>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-slate-600'} max-w-2xl`}>
              Test your understanding of AI ethics, security, and mechanics.
            </p>
          </div>

          {/* Difficulty Toggle */}
          <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border border-gray-200 dark:border-gray-700`}>
            {(['easy', 'medium', 'hard'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${difficulty === diff
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400'}`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.filter(c => c.questions.some(q => q.difficulty === difficulty || c.questions[0].difficulty === 'mixed')).map(category => (
            <QuizCard key={category.id} category={category} />
          ))}

          {/* Coming Soon Card */}
          <div className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center opacity-50 ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}>
            <Shield className="mb-4 text-gray-400" size={48} />
            <h3 className="font-bold text-lg mb-2">More Modules Coming</h3>
            <p className="text-sm">We add new topics weekly.</p>
          </div>
        </div>

        {/* Gamification Stats Footer */}
        <GamificationDashboard />
      </div>
    </div>
  );
};

export default QuizPage;
