import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTheme } from 'next-themes';
import { Plus, Lock, Play, CheckCircle2, ArrowLeft, Shield, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ContentEditModal from '../components/admin/ContentEditModal';
import { quizCatalog, Difficulty, Quiz, Question } from '../data/quizCatalog';
import GamificationDashboard from '../components/games/GamificationDashboard';
import AdminActionButtons from '../components/admin/AdminActionButtons';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

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

const shuffleQuestion = (question: Question): Question => {
    // Create a shallow copy of options to shuffle
    const optionsWithIndices = question.options.map((opt, idx) => ({ opt, originalIdx: idx }));
    // Shuffle
    optionsWithIndices.sort(() => Math.random() - 0.5);

    // Determine new correct index
    const newCorrectIndex = optionsWithIndices.findIndex(item => item.originalIdx === question.correctIndex);

    return {
        ...question,
        options: optionsWithIndices.map(item => item.opt),
        correctIndex: newCorrectIndex
    };
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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={unlocked ? { y: -5, scale: 1.01 } : {}}
            className={`relative p-8 rounded-[2rem] border transition-all duration-300 overflow-hidden group
        ${unlocked
                    ? 'bg-white/60 dark:bg-white/5 border-white/40 dark:border-white/10 shadow-lg hover:shadow-2xl backdrop-blur-xl'
                    : 'bg-gray-100/50 dark:bg-gray-800/30 border-transparent opacity-60'}`}
        >
            {/* Background Gradient for unlocked cards */}
            {unlocked && (
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-indigo-500/20 transition-colors" />
            )}

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
                            Mission {index + 1}
                        </span>
                        {completed && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${passed ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                {passed ? <><CheckCircle2 className="w-3 h-3" /> Passed</> : 'Failed'}
                            </span>
                        )}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{quiz.title}</h3>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">{quiz.description}</p>

                    {!unlocked && (
                        <p className="text-xs font-bold text-amber-500 mt-4 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/10 inline-block px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <Lock className="w-3 h-3" /> Complete previous mission to unlock
                        </p>
                    )}
                </div>

                <button
                    onClick={onStart}
                    disabled={!unlocked}
                    className={`shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow-lg
            ${unlocked
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:scale-105 hover:shadow-indigo-500/40'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                    aria-label={unlocked ? "Start Quiz" : "Locked"}
                >
                    {unlocked ? <Play className="w-6 h-6 ml-1 fill-current" /> : <Lock className="w-6 h-6" />}
                </button>
            </div>
        </motion.div>
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
        <motion.div
            key={questionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/80 dark:bg-black/50 backdrop-blur-2xl rounded-[3rem] p-8 md:p-16 shadow-2xl border border-white/20 dark:border-white/10 relative overflow-hidden"
        >
            {/* Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20" />

            <div className="relative z-10 w-full max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-white/10">
                            {questionIndex + 1}
                        </div>
                        <div className="h-1 flex-grow w-32 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                style={{ width: `${((questionIndex + 1) / total) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                            {total}
                        </span>
                    </div>
                    <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">
                        AwareX Assessment
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                        {question.prompt}
                    </h2>
                    <div className="w-20 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                </div>

                <div className="space-y-4">
                    {question.options.map((option, idx) => {
                        const isSelected = selected === idx;
                        return (
                            <button
                                key={idx}
                                onClick={() => onSelect(idx)}
                                className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 flex items-center gap-6 group relative overflow-hidden
                    ${isSelected
                                        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-900 dark:text-white shadow-lg'
                                        : 'border-transparent bg-slate-50/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-md'
                                    }`}
                            >
                                <span className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 text-base font-black transition-colors shrink-0 shadow-sm
                    ${isSelected
                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-400'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="text-lg md:text-xl font-medium leading-relaxed z-10">{option}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-12 flex justify-end">
                    <button
                        onClick={onNext}
                        disabled={selected === null}
                        className={`px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all transform
                ${selected === null
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 shadow-xl hover:shadow-indigo-500/20'}`}
                    >
                        {isLast ? 'Complete Mission' : 'Next Challenge'} <ArrowLeft className="w-5 h-5 rotate-180" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const fetchAllQuizzes = async (): Promise<Record<Difficulty, Quiz[]>> => {
    try {
        const res = await axios.get('http://localhost:8000/api/content/quiz/');
        const data = res.data;
        const newCatalog: Record<Difficulty, Quiz[]> = {
            easy: [],
            medium: [],
            hard: []
        };

        if (Array.isArray(data)) {
            data.forEach((q: any) => {
                if (['easy', 'medium', 'hard'].includes(q.difficulty)) {
                    newCatalog[q.difficulty as Difficulty].push({
                        ...q,
                        id: String(q.id) // Ensure ID is string to match types
                    });
                }
            });
        }

        // Only return if we actually got data, otherwise fallback
        if (newCatalog.easy.length > 0 || newCatalog.medium.length > 0 || newCatalog.hard.length > 0) {
            return newCatalog;
        }
    } catch (err) {
        console.error("Failed to fetch dynamic quizzes", err);
    }
    return quizCatalog;
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

    // Dynamic Catalog State
    const [catalog, setCatalog] = useState<Record<Difficulty, Quiz[]>>(quizCatalog);
    const [allQuizzes, setAllQuizzes] = useState<any[]>([]); // Keep this for Admin List
    const [loadingAdmin, setLoadingAdmin] = useState(false);

    useEffect(() => {
        // Fetch dynamic quizzes for the learner view
        fetchAllQuizzes().then(dynamicCatalog => {
            setCatalog(dynamicCatalog);

            // Re-initialize progress to ensure the first quiz of the new catalog is unlocked
            // This merges with existing progress but ensures at least the valid first item is open
            setProgress(prev => {
                const updated = initProgress(dynamicCatalog, prev);
                // Force ensure the first ID of the NEW catalog is in the unlocked list if not present
                (['easy', 'medium', 'hard'] as Difficulty[]).forEach(d => {
                    const first = dynamicCatalog[d][0];
                    if (first && !updated[d].unlocked.includes(first.id)) {
                        updated[d].unlocked.push(first.id);
                    }
                });
                return updated;
            });
        });
    }, []);

    const storageKey = useMemo(() => storageKeyForUser(user?.id ?? user?.email ?? undefined), [user?.id, user?.email]);
    const [progress, setProgress] = useState<ProgressState>(() => {
        try {
            const raw = sessionStorage.getItem(storageKey);
            if (raw) return initProgress(quizCatalog, JSON.parse(raw));
        } catch (err) { console.warn('Failed to load stored quiz progress', err); }
        return initProgress(quizCatalog);
    });

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(storageKey);
            if (raw) { setProgress(initProgress(quizCatalog, JSON.parse(raw))); return; }
        } catch (err) { console.warn('Failed to reload stored quiz progress', err); }
        setProgress(initProgress(quizCatalog));
    }, [storageKey]);

    useEffect(() => {
        try { sessionStorage.setItem(storageKey, JSON.stringify(progress)); }
        catch (err) { console.warn('Failed to persist quiz progress', err); }
    }, [progress, storageKey]);

    const fetchQuizzesForAdmin = async () => {
        if (user?.role !== 'ADMIN') return;
        setLoadingAdmin(true);
        try {
            const res = await axios.get('http://localhost:8000/api/content/quiz/');
            setAllQuizzes(res.data || []);
        } catch (err) { console.error('Failed to load quizzes', err); }
        finally { setLoadingAdmin(false); }
    };
    useEffect(() => { fetchQuizzesForAdmin(); }, [user?.role]);

    const resetQuizState = () => { setQuestionIndex(0); setAnswers([]); setResult(null); };
    const goToDifficulty = () => { setView('difficulty'); setActiveDifficulty(null); setSelectedQuiz(null); resetQuizState(); };
    const openDifficulty = (difficulty: Difficulty) => { setActiveDifficulty(difficulty); setView('list'); setSelectedQuiz(null); resetQuizState(); };

    const startQuiz = (quiz: Quiz) => {
        // Shuffle questions when starting
        const shuffledQuestions = quiz.questions.map(shuffleQuestion);
        const shuffledQuiz = { ...quiz, questions: shuffledQuestions };

        setSelectedQuiz(shuffledQuiz);
        setView('playing');
        resetQuizState();
    };

    const unlockNextQuiz = (difficulty: Difficulty, currentQuizId: string) => {
        const quizzes = catalog[difficulty];
        const currentIdx = quizzes.findIndex((q) => q.id === currentQuizId);
        const next = quizzes[currentIdx + 1];
        if (!next) return;
        setProgress((prev) => {
            const unlocked = new Set(prev[difficulty].unlocked);
            unlocked.add(next.id);
            return { ...prev, [difficulty]: { ...prev[difficulty], unlocked: Array.from(unlocked) } };
        });
    };

    const recordResult = (quiz: Quiz, quizResult: QuizResult) => {
        setProgress((prev) => ({
            ...prev,
            [quiz.difficulty]: {
                ...prev[quiz.difficulty],
                results: { ...prev[quiz.difficulty].results, [quiz.id]: { ...quizResult, completed: true } }
            }
        }));
        if (quizResult.passed) {
            unlockNextQuiz(quiz.difficulty, quiz.id);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
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

    const AdminQuizList = () => {
        const [isCreating, setIsCreating] = useState(false);
        if (user?.role !== 'ADMIN') return null;
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} p-8 font-sans`}>
                <div className="max-w-7xl mx-auto space-y-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Quiz Management</h1>
                            <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Create and manage quizzes.</p>
                        </div>
                        <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg">
                            <Plus className="w-5 h-5" /> Create New Quiz
                        </button>
                    </div>
                    {/* Re-use existing tables if preferred, or simplified placeholder for brevity since user is learner focused generally */}
                    <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className={`text-xs uppercase tracking-wider ${darkMode ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                        <th className={`p-4 font-bold border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>Title</th>
                                        <th className={`p-4 font-bold border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>Difficulty</th>
                                        <th className={`p-4 font-bold border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>Questions</th>
                                        <th className={`p-4 font-bold border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'} text-right`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                    {allQuizzes.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className={`p-8 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                No quizzes found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        allQuizzes.map((quiz: any) => (
                                            <tr key={quiz.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                                                <td className={`p-4 align-middle font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {quiz.title}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                                          ${quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {quiz.difficulty}
                                                    </span>
                                                </td>
                                                <td className={`p-4 align-middle ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {quiz.questions?.length || 0} Questions
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                                                        <AdminActionButtons item={quiz} contentType="quiz" onUpdate={fetchQuizzesForAdmin} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <ContentEditModal isOpen={isCreating} onClose={() => setIsCreating(false)} item={null} contentType="quiz" onSuccess={fetchQuizzesForAdmin} />
                </div>
            </div>
        );
    };

    if (user?.role === 'ADMIN') return <AdminQuizList />;

    const currentDifficultyQuizzes = activeDifficulty ? catalog[activeDifficulty] : [];
    const currentQuizStatus = (quiz: Quiz) => progress[quiz.difficulty];

    const renderDifficultyMenu = () => (
        <div className="space-y-16 py-10">
            <header className="text-center relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/40 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-8 border border-white/20 backdrop-blur-md shadow-sm"
                >
                    <Brain className="w-4 h-4" /> Structured Learning Path
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
                >
                    AI Mastery <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Missions</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
                >
                    Progress through missions of increasing difficulty. Prove your skills to unlock advanced challenges.
                </motion.p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff, idx) => (
                    <motion.button
                        key={diff}
                        onClick={() => openDifficulty(diff)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="group relative rounded-[2.5rem] border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-10 text-left transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-2xl overflow-hidden flex flex-col h-full"
                    >
                        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:opacity-20 transition-opacity
                ${diff === 'easy' ? 'from-green-500 to-emerald-500' : diff === 'medium' ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-500'}
            `} />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className={`p-4 rounded-2xl text-white shadow-lg ${diff === 'easy' ? 'bg-green-500' : diff === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                <Shield className="w-8 h-8" />
                            </div>
                            <span className="px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                {catalog[diff].length} Missions
                            </span>
                        </div>

                        <h3 className="text-3xl font-black capitalize text-slate-900 dark:text-white mb-4 tracking-tight relative z-10">{diff}</h3>

                        <p className="text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-8 flex-grow relative z-10">
                            {diff === 'easy' && 'Master fundamentals. Understand core definitions, safety concepts, and basic terminology.'}
                            {diff === 'medium' && 'Apply knowledge to real-world scenarios. Recognize patterns and solve operational challenges.'}
                            {diff === 'hard' && 'Expert level. Tackle complex edge cases, ethical dilemmas, and advanced threat detection.'}
                        </p>

                        <div className="flex items-center font-bold text-sm uppercase tracking-wide text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                            Initialize Protocols <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="mt-20">
                <GamificationDashboard />
            </div>
        </div>
    );

    const renderQuizList = () => (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <button
                    onClick={goToDifficulty}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-white/50 dark:bg-white/10 px-4 py-2 rounded-full"
                >
                    <ArrowLeft className="w-4 h-4" /> CHANGE DIFFICULTY
                </button>
                <div className="text-sm font-bold uppercase tracking-wide text-indigo-500">
                    Level: <span className="text-slate-900 dark:text-white">{activeDifficulty}</span>
                </div>
            </div>

            <div className="space-y-6">
                {currentDifficultyQuizzes.map((quiz, idx) => {
                    const status = currentQuizStatus(quiz);
                    return (
                        <QuizCard
                            key={quiz.id}
                            quiz={quiz}
                            index={idx}
                            unlocked={status.unlocked.includes(quiz.id)}
                            completed={!!status.results[quiz.id]?.completed}
                            passed={!!status.results[quiz.id]?.passed}
                            onStart={() => startQuiz(quiz)}
                        />
                    );
                })}
            </div>
        </div>
    );

    const renderQuizPlay = () => {
        if (!selectedQuiz) return null;
        return (
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setView('list')}
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> ABORT MISSION
                    </button>
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {selectedQuiz.title}
                    </span>
                </div>
                <AnimatePresence mode='wait'>
                    <QuestionRenderer
                        question={selectedQuiz.questions[questionIndex]}
                        questionIndex={questionIndex}
                        total={selectedQuiz.questions.length}
                        selected={answers[questionIndex] ?? null}
                        onSelect={onSelectAnswer}
                        isLast={questionIndex === selectedQuiz.questions.length - 1}
                        onNext={onNextQuestion}
                    />
                </AnimatePresence>
            </div>
        );
    };

    const renderResult = () => {
        if (!selectedQuiz || !result) return null;
        const color = result.passed ? 'text-green-500' : 'text-red-500';
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl mx-auto bg-white/80 dark:bg-black/50 backdrop-blur-2xl rounded-[3rem] p-12 md:p-16 border border-white/20 dark:border-white/10 text-center shadow-2xl relative overflow-hidden"
            >
                {result.passed && <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />}
                {!result.passed && <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />}

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-10 shadow-sm">
                        Mission Debrief • {selectedQuiz.difficulty}
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                        {result.passed ? 'Mission Accomplished' : 'Mission Failed'}
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-12">
                        {result.passed ? 'Excellent work, Agent. Next authorization granted.' : 'Training objectives not met. Re-engagement recommended.'}
                    </p>

                    <div className="py-8 relative mb-8">
                        <div className={`text-9xl font-black ${color} tracking-tighter relative z-10 drop-shadow-sm`}>
                            {Math.round((result.score / result.total) * 100)}%
                        </div>
                        {result.passed ? (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/20 rounded-full blur-[80px] -z-10 animate-pulse" />
                        ) : (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/20 rounded-full blur-[80px] -z-10" />
                        )}
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{result.score} / {result.total} Correct</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => startQuiz(selectedQuiz)}
                            className="px-10 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-105 transition-all shadow-xl"
                        >
                            Retry Mission
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className="px-10 py-4 rounded-2xl bg-transparent border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                        >
                            Return to HQ
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans relative overflow-hidden">
            {/* --- AMBIENT BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="container mx-auto px-4 py-12 relative z-10">
                {view === 'difficulty' && renderDifficultyMenu()}
                {view === 'list' && renderQuizList()}
                {view === 'playing' && renderQuizPlay()}
                {view === 'result' && renderResult()}
            </div>
        </div>
    );
};

export default QuizPage;
