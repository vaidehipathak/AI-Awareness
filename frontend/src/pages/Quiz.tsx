import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTheme } from 'next-themes';
import { Plus, Lock, Play, CheckCircle2, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AdminActionButtons from '../components/admin/AdminActionButtons';
import ContentEditModal from '../components/admin/ContentEditModal';
import { quizCatalog, Difficulty, Quiz, Question } from '../data/quizCatalog';

const PASS_THRESHOLD = 0.7;

type QuizResult = {
  score: number;
  total: number;
  passed: boolean;
};

type QuizProgress = {
  unlocked: string[];
  results: Record<string, QuizResult & { completed: boolean }>;
};

type ProgressState = Record<Difficulty, QuizProgress>;

type ViewState = 'difficulty' | 'list' | 'playing' | 'result';

const initProgress = (catalog: Record<Difficulty, Quiz[]>, existing?: ProgressState): ProgressState => {
  const base: ProgressState = {
    easy: { unlocked: [], results: {} },
    medium: { unlocked: [], results: {} },
    hard: { unlocked: [], results: {} }
  };

  (['easy', 'medium', 'hard'] as Difficulty[]).forEach((diff) => {
    const firstId = catalog[diff][0]?.id;
    if (firstId) {
      base[diff].unlocked = [firstId];
    }
  });

  if (existing) {
    return {
      easy: { ...base.easy, ...existing.easy },
      medium: { ...base.medium, ...existing.medium },
      hard: { ...base.hard, ...existing.hard }
    };
  }

  return base;
};

const storageKeyForUser = (userId?: string | number) => `quiz-progress:${userId ?? 'guest'}`;

const computeScore = (quiz: Quiz, answers: number[]): QuizResult => {
  const correct = quiz.questions.reduce((acc, q, idx) => acc + (answers[idx] === q.correctIndex ? 1 : 0), 0);
  const total = quiz.questions.length;
  const passed = correct >= Math.ceil(total * PASS_THRESHOLD);
  return { score: correct, total, passed };
};

const QuizCard: React.FC<{
  quiz: Quiz;
  index: number;
  unlocked: boolean;
  completed: boolean;
  passed: boolean;
  onStart: () => void;
}> = ({ quiz, index, unlocked, completed, passed, onStart }) => {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800 flex justify-between items-center gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Quiz {index + 1}</p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{quiz.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.description}</p>
        {!unlocked && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Complete previous quiz to unlock.
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {completed && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" /> Passed
          </span>
        )}
        <button
          onClick={onStart}
          disabled={!unlocked}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors
            ${unlocked
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed'}`}
          aria-disabled={!unlocked}
        >
          {unlocked ? <Play className="w-4 h-4" /> : <Lock className="w-4 h-4" />} 
          {unlocked ? 'Start Quiz' : 'Locked'}
        </button>
      </div>
    </div>
  );
};

const QuestionRenderer: React.FC<{
  question: Question;
  questionIndex: number;
  total: number;
  selected: number | null;
  onSelect: (idx: number) => void;
  isLast: boolean;
  onNext: () => void;
}> = ({ question, questionIndex, total, selected, onSelect, isLast, onNext }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <span>Question {questionIndex + 1} / {total}</span>
        <span>{Math.round(((questionIndex + 1) / total) * 100)}% complete</span>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-snug">{question.prompt}</h2>

      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const isSelected = selected === idx;
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start gap-3
                ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100' : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-indigo-400'}`}
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm font-bold border-current opacity-80">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="leading-relaxed">{option}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={selected === null}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2
            ${selected === null ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          {isLast ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

const QuizPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  const [view, setView] = useState<ViewState>('difficulty');
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

  const [allQuizzes, setAllQuizzes] = useState<any[]>([]); // for admin table only
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const storageKey = useMemo(() => storageKeyForUser(user?.id ?? user?.email ?? undefined), [user?.id, user?.email]);

  const [progress, setProgress] = useState<ProgressState>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        return initProgress(quizCatalog, JSON.parse(raw));
      }
    } catch (err) {
      console.warn('Failed to load stored quiz progress', err);
    }
    return initProgress(quizCatalog);
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        setProgress(initProgress(quizCatalog, JSON.parse(raw)));
        return;
      }
    } catch (err) {
      console.warn('Failed to reload stored quiz progress', err);
    }
    setProgress(initProgress(quizCatalog));
  }, [storageKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(progress));
    } catch (err) {
      console.warn('Failed to persist quiz progress', err);
    }
  }, [progress, storageKey]);

  const fetchQuizzesForAdmin = async () => {
    if (user?.role !== 'ADMIN') return;
    setLoadingAdmin(true);
    try {
      const res = await axios.get('http://localhost:8000/api/content/quiz/');
      setAllQuizzes(res.data || []);
    } catch (err) {
      console.error('Failed to load quizzes', err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    fetchQuizzesForAdmin();
  }, [user?.role]); // admin-only behavior guarded inside fetch

  const resetQuizState = () => {
    setQuestionIndex(0);
    setAnswers([]);
    setResult(null);
  };

  const goToDifficulty = () => {
    setView('difficulty');
    setActiveDifficulty(null);
    setSelectedQuiz(null);
    resetQuizState();
  };

  const openDifficulty = (difficulty: Difficulty) => {
    setActiveDifficulty(difficulty);
    setView('list');
    setSelectedQuiz(null);
    resetQuizState();
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setView('playing');
    resetQuizState();
  };

  const unlockNextQuiz = (difficulty: Difficulty, currentQuizId: string) => {
    const quizzes = quizCatalog[difficulty];
    const currentIdx = quizzes.findIndex((q) => q.id === currentQuizId);
    const next = quizzes[currentIdx + 1];
    if (!next) return;
    setProgress((prev) => {
      const unlocked = new Set(prev[difficulty].unlocked);
      unlocked.add(next.id);
      return {
        ...prev,
        [difficulty]: {
          ...prev[difficulty],
          unlocked: Array.from(unlocked)
        }
      };
    });
  };

  const recordResult = (quiz: Quiz, quizResult: QuizResult) => {
    setProgress((prev) => ({
      ...prev,
      [quiz.difficulty]: {
        ...prev[quiz.difficulty],
        results: {
          ...prev[quiz.difficulty].results,
          [quiz.id]: { ...quizResult, completed: true }
        }
      }
    }));
    if (quizResult.passed) {
      unlockNextQuiz(quiz.difficulty, quiz.id);
    }
  };

  const onSelectAnswer = (idx: number) => {
    const nextAnswers = [...answers];
    nextAnswers[questionIndex] = idx;
    setAnswers(nextAnswers);
  };

  const onNextQuestion = () => {
    if (!selectedQuiz) return;
    if (questionIndex + 1 < selectedQuiz.questions.length) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      const quizResult = computeScore(selectedQuiz, answers);
      setResult(quizResult);
      recordResult(selectedQuiz, quizResult);
      setView('result');
    }
  };

  /* ---------------- ADMIN VIEW ---------------- */

  const AdminQuizList = () => {
    const [isCreating, setIsCreating] = useState(false);

    if (user?.role !== 'ADMIN') return null;

    const catalogQuizzes = useMemo(() => {
      return (['easy', 'medium', 'hard'] as Difficulty[])
        .flatMap((diff) => quizCatalog[diff].map((q, idx) => ({ ...q, displayId: `${diff}-${idx + 1}` })));
    }, []);

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} p-8`}>
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Quiz Management</h1>
              <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Create and manage quizzes and question banks.
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create New Quiz
            </button>
          </div>

          {/* Backend Quizzes */}
          <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden`}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold">Backend Quizzes</h2>
              <span className="text-sm text-slate-500">{allQuizzes.length} loaded</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className={`bg-slate-50 dark:bg-slate-700/50 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <tr>
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Title</th>
                    <th className="px-6 py-4 font-semibold">Difficulty</th>
                    <th className="px-6 py-4 font-semibold">Questions</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                  {allQuizzes.map((quiz) => (
                    <tr key={quiz.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs opacity-50">#{quiz.id}</td>
                      <td className={`px-6 py-4 font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{quiz.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                          ${quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : ''}
                          ${quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
                          ${quiz.difficulty === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : ''}
                        `}>
                          {quiz.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs opacity-75">{quiz.questions?.length || 0} Qs</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quiz.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {quiz.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <AdminActionButtons item={quiz} contentType="quiz" onUpdate={fetchQuizzesForAdmin} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allQuizzes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        {loadingAdmin ? 'Loading quizzes…' : 'No quizzes found. Create one to get started.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Local Catalog (read-only) */}
          <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden`}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold">Local Catalog (read-only)</h2>
              <span className="text-sm text-slate-500">{catalogQuizzes.length} predefined quizzes</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className={`bg-slate-50 dark:bg-slate-700/50 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <tr>
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Title</th>
                    <th className="px-6 py-4 font-semibold">Difficulty</th>
                    <th className="px-6 py-4 font-semibold">Questions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                  {catalogQuizzes.map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs opacity-60">{quiz.displayId}</td>
                      <td className={`px-6 py-4 font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{quiz.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                          ${quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : ''}
                          ${quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
                          ${quiz.difficulty === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : ''}
                        `}>
                          {quiz.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs opacity-75">{quiz.questions.length} Qs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 text-xs text-slate-500">
              These quizzes are bundled in the frontend for the learner experience. Use "Create New Quiz" to add editable backend quizzes.
            </div>
          </div>

          <ContentEditModal
            isOpen={isCreating}
            onClose={() => setIsCreating(false)}
            item={null}
            contentType="quiz"
            onSuccess={fetchQuizzesForAdmin}
          />
        </div>
      </div>
    );
  };

  /* ---------------- LEARNER VIEW ---------------- */

  if (user?.role === 'ADMIN') {
    return <AdminQuizList />;
  }

  const currentDifficultyQuizzes = activeDifficulty ? quizCatalog[activeDifficulty] : [];
  const currentQuizStatus = (quiz: Quiz) => progress[quiz.difficulty];

  const renderDifficultyMenu = () => (
    <div className="space-y-10">
      <header className="text-center">
        <div className="flex items-center justify-center gap-2 text-indigo-600 font-semibold mb-2">
          <Shield className="w-5 h-5" /> Structured Learning Path
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">AI Mastery Quizzes</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Progress through easy, medium, and hard quizzes. Each level unlocks as you pass with at least 70%.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => openDifficulty(diff)}
            className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-left hover:border-indigo-400 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-bold capitalize text-slate-900 dark:text-white">{diff}</h3>
              <span className="text-sm font-semibold text-indigo-600">{quizCatalog[diff].length} quizzes</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {diff === 'easy' && 'Foundations, definitions, and core concepts.'}
              {diff === 'medium' && 'Applied reasoning, scenarios, and operations.'}
              {diff === 'hard' && 'Edge cases, security, and consequence-aware decisions.'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderQuizList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={goToDifficulty}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300"
        >
          <ArrowLeft className="w-4 h-4" /> Back to levels
        </button>
        <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {activeDifficulty} • {currentDifficultyQuizzes.length} quizzes • 5 questions each
        </div>
      </div>

      <div className="space-y-3">
        {currentDifficultyQuizzes.map((quiz, idx) => {
          const status = currentQuizStatus(quiz);
          const unlocked = status.unlocked.includes(quiz.id);
          const result = status.results[quiz.id];
          return (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              index={idx}
              unlocked={unlocked}
              completed={!!result?.completed}
              passed={!!result?.passed}
              onStart={() => startQuiz(quiz)}
            />
          );
        })}
      </div>
    </div>
  );

  const renderQuizPlay = () => {
    if (!selectedQuiz) return null;
    const question = selectedQuiz.questions[questionIndex];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView('list')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to quizzes
          </button>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {selectedQuiz.title}
          </div>
        </div>

        <QuestionRenderer
          question={question}
          questionIndex={questionIndex}
          total={selectedQuiz.questions.length}
          selected={answers[questionIndex] ?? null}
          onSelect={onSelectAnswer}
          isLast={questionIndex === selectedQuiz.questions.length - 1}
          onNext={onNextQuestion}
        />
      </div>
    );
  };

  const renderResult = () => {
    if (!selectedQuiz || !result) return null;
    const status = result.passed ? 'Passed' : 'Try Again';
    const color = result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    return (
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold">
          {selectedQuiz.difficulty.toUpperCase()} • {selectedQuiz.questions.length} questions • Pass at 70%
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{status}</h2>
        <p className={`text-5xl font-black ${color}`}>
          {result.score} / {result.total}
        </p>
        <p className="text-slate-600 dark:text-slate-300">You need at least 4 correct answers to pass.</p>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => startQuiz(selectedQuiz)}
            className="px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Retry this quiz
          </button>
          <button
            onClick={() => setView('list')}
            className="px-5 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold"
          >
            Back to quiz list
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
        {view === 'difficulty' && renderDifficultyMenu()}
        {view === 'list' && renderQuizList()}
        {view === 'playing' && renderQuizPlay()}
        {view === 'result' && renderResult()}
      </div>
    </div>
  );
};

export default QuizPage;
