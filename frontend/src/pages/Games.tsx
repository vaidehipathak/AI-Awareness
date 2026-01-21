import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTheme } from 'next-themes';
import { ChevronRight, Clock, Trophy, Brain, Target, Eye, BookOpen, Cpu, Zap, Shuffle, Award, Plus, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AdminActionButtons from '../components/admin/AdminActionButtons';
import ContentEditModal from '../components/admin/ContentEditModal';

// New Interactive Games
import DeepfakeDetector from '../components/games/DeepfakeDetector';
import BiasSpotter from '../components/games/BiasSpotter';
import PhishingSorter from '../components/games/PhishingSorter';
import GamificationDashboard from '../components/games/GamificationDashboard';
import { motion, AnimatePresence } from 'framer-motion';

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
        deepfake: 0,
        biasspotter: 0,
        phishing: 0,
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
            dragdrop: 0, truefalse: 0, quiz: 0, bias: 0, memory: 0, matching: 0, sequence: 0, classification: 0, wordpuzzle: 0, deepfake: 0, biasspotter: 0, phishing: 0,
            total: 0, gamesPlayed: 0
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


    // Game Data State
    const { user } = useAuth();
    const [allGames, setAllGames] = useState<any[]>([]);
    const [dragDropData, setDragDropData] = useState<any[]>([]);
    const [trueFalseData, setTrueFalseData] = useState<any[]>([]);
    const [multipleChoiceData, setMultipleChoiceData] = useState<any[]>([]);
    const [biasData, setBiasData] = useState<any[]>([]);
    const [memoryData, setMemoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGames = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/content/games/');
            const games = res.data;
            setAllGames(games);

            let dd: any[] = [];
            let tf: any[] = [];
            let mc: any[] = [];
            let bias: any[] = [];
            let mem: any[] = [];

            games.forEach((g: any) => {
                if (!g.is_active || !g.game_data) return;
                const data = Array.isArray(g.game_data) ? g.game_data : (g.game_data.items || []);
                switch (g.game_type) {
                    case 'DRAG_DROP': dd = [...dd, ...data]; break;
                    case 'TRUE_FALSE': tf = [...tf, ...data]; break;
                    case 'MULTIPLE_CHOICE': mc = [...mc, ...data]; break;
                    case 'SPOT_BIAS': bias = [...bias, ...data]; break;
                    case 'MEMORY': mem = [...mem, ...data]; break;
                }
            });

            setDragDropData(dd);
            setTrueFalseData(tf);
            setMultipleChoiceData(mc);
            setBiasData(bias);
            setMemoryData(mem);
        } catch (err) {
            console.error("Failed to load games", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    // --- UI COMPONENTS ---

    const GameCard: React.FC<any> = ({ icon: Icon, title, description, onClick, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative group h-full flex flex-col overflow-hidden rounded-[2.5rem] cursor-pointer bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300`}
            onClick={onClick}
        >
            <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-20 rounded-bl-full transition-opacity duration-500 blur-2xl pointer-events-none`} />

            <div className="p-8 flex flex-col h-full relative z-10">
                <div className="flex items-center mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold ml-4 tracking-tight text-slate-900 dark:text-white leading-tight">{title}</h3>
                </div>
                <p className={`text-slate-600 dark:text-slate-400 leading-relaxed flex-grow text-sm font-medium`}>{description}</p>

                <div className="mt-8 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Challenge Ready</span>
                    <div className={`flex items-center text-sm font-bold uppercase tracking-wider bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full shadow-lg group-hover:shadow-${color.split('-')[2]}-500/30 transition-shadow`}>
                        Play <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const BackButton: React.FC<any> = ({ onClick }) => (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-2 mb-8 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-white/50 dark:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md"
        >
            <ArrowLeft className="w-4 h-4" /> Exit Game
        </button>
    );

    // --- INTERNAL GAME COMPONENTS (Refactored) ---

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

        const handleDragStart = (e: any, term: string) => setDraggedItem(term);
        const handleDragOver = (e: any) => e.preventDefault();
        const handleDrop = (e: any, definition: string) => {
            e.preventDefault();
            if (!draggedItem) return;

            const correctMatch = gameData.find(item => item.term === draggedItem && item.definition === definition);
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
            setGameData(getRandomItems(dragDropData, 5));
            setMatches([]);
            setScore(0);
            setGameComplete(false);
        };

        return (
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 p-10">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Drag & Drop Matching</h2>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold">
                            Score: {score}
                        </div>
                        <button onClick={resetGame} className="px-4 py-2 bg-slate-200 dark:bg-white/10 rounded-lg font-bold text-sm hover:bg-slate-300 dark:hover:bg-white/20 transition-colors">
                            Reset
                        </button>
                    </div>
                </div>

                {gameComplete ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30 text-white">
                            <Trophy size={48} />
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Awesome Job!</h3>
                        <p className="text-slate-500 mb-8 font-medium">You matched all terms correctly.</p>
                        <button onClick={resetGame} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform shadow-xl">
                            Play Again
                        </button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Terms</h3>
                            <div className="space-y-4">
                                {gameData.map((item, index) => {
                                    const isMatched = matches.find(m => m.term === item.term);
                                    return (
                                        <motion.div
                                            key={index}
                                            draggable={!isMatched}
                                            onDragStart={(e) => handleDragStart(e, item.term)}
                                            whileHover={!isMatched ? { scale: 1.02 } : {}}
                                            whileTap={!isMatched ? { scale: 0.98 } : {}}
                                            className={`p-5 rounded-xl border-2 font-medium transition-all ${isMatched
                                                ? 'bg-green-500 text-white border-green-500 shadow-lg'
                                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 cursor-move hover:border-indigo-500 dark:hover:border-indigo-400 shadow-sm'
                                                }`}
                                        >
                                            {item.term} {isMatched && '✓'}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Definitions</h3>
                            <div className="space-y-4">
                                {shuffleArray(gameData).map((item, index) => {
                                    const isMatched = matches.find(m => m.definition === item.definition);
                                    return (
                                        <motion.div
                                            key={index}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, item.definition)}
                                            className={`p-5 rounded-xl border-2 border-dashed transition-all ${isMatched
                                                ? 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
                                                : 'bg-slate-50/50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300'
                                                }`}
                                        >
                                            {item.definition}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Game 2: True/False
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
                timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            } else if (timeLeft === 0 && gameActive) {
                endGame();
            }
            return () => clearTimeout(timerRef.current);
        }, [timeLeft, gameActive]);

        const startGame = () => {
            setCurrentQuestions(getRandomItems(trueFalseData, Math.min(trueFalseData.length, 10)));
            setCurrentIndex(0); setScore(0); setTimeLeft(30); setGameActive(true); setGameComplete(false); setAnswered(false); setIsCorrect(null);
        };

        const endGame = () => {
            setGameActive(false); setGameComplete(true); clearTimeout(timerRef.current); updateLifetimeScore('truefalse', score);
        };

        const handleAnswer = (userAnswer: boolean) => {
            if (answered || !gameActive) return;
            setAnswered(true);
            const correct = userAnswer === currentQuestions[currentIndex].answer;
            setIsCorrect(correct);
            if (correct) setScore(score + 10 + Math.max(1, Math.floor(timeLeft / 6)));

            setTimeout(() => {
                if (currentIndex + 1 < currentQuestions.length) {
                    setCurrentIndex(currentIndex + 1); setAnswered(false); setIsCorrect(null);
                } else {
                    endGame();
                }
            }, 1500);
        };

        return (
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-white/20 dark:border-white/10 p-10">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">True/False Lightning</h2>
                    {gameActive && (
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-red-500 font-bold text-xl bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                                <Clock size={20} /> {timeLeft}s
                            </div>
                            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Score: {score}</div>
                        </div>
                    )}
                </div>

                {!gameActive && !gameComplete && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Zap size={40} />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Speed Challenge</h3>
                        <p className="text-slate-500 mb-8 text-lg">Answer as many questions as you can in 30 seconds.</p>
                        <button onClick={startGame} className="px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105">
                            Start
                        </button>
                    </div>
                )}

                {gameActive && currentQuestions.length > 0 && (
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="mb-8">
                            <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mb-8">
                                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold leading-tight text-slate-900 dark:text-white mb-10">
                                {currentQuestions[currentIndex].question}
                            </h3>

                            <div className="flex gap-6 justify-center">
                                <button
                                    onClick={() => handleAnswer(true)}
                                    disabled={answered}
                                    className="flex-1 py-6 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                                >
                                    TRUE
                                </button>
                                <button
                                    onClick={() => handleAnswer(false)}
                                    disabled={answered}
                                    className="flex-1 py-6 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                                >
                                    FALSE
                                </button>
                            </div>
                        </div>
                        {answered && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`text-2xl font-black ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                {isCorrect ? 'CORRECT!' : 'WRONG!'}
                            </motion.div>
                        )}
                    </div>
                )}

                {gameComplete && (
                    <div className="text-center py-12">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Time's Up!</h3>
                        <p className="text-xl text-slate-500 mb-8">Final Score: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{score}</span></p>
                        <button onClick={startGame} className="px-8 py-3 border-2 border-slate-200 dark:border-white/10 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Play Again</button>
                    </div>
                )}
            </div>
        );
    };

    // Game 3: Multiple Choice (Simplified for brevity as structure mimics Quiz.tsx but simpler)
    const MultipleChoiceGame: React.FC = () => {
        const [questions, setQuestions] = useState<any[]>([]);
        const [currentIndex, setCurrentIndex] = useState(0);
        const [score, setScore] = useState(0);
        const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
        const [gameComplete, setGameComplete] = useState(false);

        useEffect(() => { startNewGame(); }, []);

        const startNewGame = () => {
            setQuestions(getRandomItems(multipleChoiceData, 5));
            setCurrentIndex(0); setScore(0); setSelectedAnswer(null); setGameComplete(false);
        };

        const handleAnswer = (idx: number) => {
            setSelectedAnswer(idx);
            if (idx === questions[currentIndex].correct) setScore(score + 20);
            setTimeout(() => {
                if (currentIndex + 1 < questions.length) {
                    setCurrentIndex(currentIndex + 1); setSelectedAnswer(null);
                } else {
                    setGameComplete(true); updateLifetimeScore('quiz', score + (idx === questions[currentIndex].correct ? 20 : 0));
                }
            }, 1000);
        };

        if (!questions.length) return <div className="p-10 text-center">Loading...</div>;

        return (
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-white/20 dark:border-white/10 p-10">
                <div className="flex justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quick Quiz</h2>
                    <div className="font-bold text-indigo-600">Score: {score}</div>
                </div>
                {!gameComplete ? (
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">{questions[currentIndex].question}</h3>
                        <div className="space-y-3">
                            {questions[currentIndex].options.map((opt: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => selectedAnswer === null && handleAnswer(i)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium
                                    ${selectedAnswer === i
                                            ? i === questions[currentIndex].correct ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500'
                                        }
                                `}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
                        <p className="mb-6">Score: {score}</p>
                        <button onClick={startNewGame} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Restart</button>
                    </div>
                )}
            </div>
        );
    };

    // Game 4: Spot Bias
    const SpotBiasGame: React.FC = () => {
        const [scenario, setScenario] = useState<any>(null);
        const [selected, setSelected] = useState<number | null>(null);
        const [score, setScore] = useState(0);

        useEffect(() => { loadScenario(); }, []);
        const loadScenario = () => {
            setScenario(biasData[Math.floor(Math.random() * biasData.length)]);
            setSelected(null);
        };

        if (!scenario) return <div>Loading...</div>;

        return (
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-white/20 dark:border-white/10 p-10">
                <div className="flex justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pattern Recognition</h2>
                    <div className="font-bold text-indigo-600">Score: {score}</div>
                </div>

                <div className="mb-8 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{scenario.scenario}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{scenario.description}</p>
                </div>

                <div className="grid gap-4 mb-8">
                    {scenario.candidates.map((cand: string, i: number) => (
                        <button
                            key={i}
                            onClick={() => {
                                if (selected !== null) return;
                                setSelected(i);
                                if (i === scenario.correctAnswer) {
                                    setScore(score + 25); updateLifetimeScore('bias', 25);
                                }
                            }}
                            className={`p-4 text-left rounded-xl border-2 transition-all font-medium ${selected !== null
                                ? i === scenario.correctAnswer ? 'bg-green-100 border-green-500 text-green-800' : selected === i ? 'bg-red-100 border-red-500 text-red-800' : 'bg-white border-slate-200 opacity-50'
                                : 'bg-white hover:border-indigo-500 cursor-pointer border-slate-200'
                                } dark:bg-white/5 dark:border-white/10`}
                        >
                            {cand}
                        </button>
                    ))}
                </div>

                {selected !== null && (
                    <div className="text-center">
                        <button onClick={loadScenario} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Next Scenario</button>
                    </div>
                )}
            </div>
        );
    };

    // Game 5: Memory Match
    const MemoryGame: React.FC = () => {
        const [cards, setCards] = useState<any[]>([]);
        const [flipped, setFlipped] = useState<any[]>([]);
        const [matched, setMatched] = useState<any[]>([]);
        const [score, setScore] = useState(0);
        const [moves, setMoves] = useState(0);

        useEffect(() => { init(); }, []);

        const init = () => {
            const items = getRandomItems(memoryData, 6);
            const deck = shuffleArray([...items.map((i, idx) => ({ id: `t-${idx}`, content: i.term, match: idx })), ...items.map((i, idx) => ({ id: `d-${idx}`, content: i.definition, match: idx }))]);
            setCards(deck); setFlipped([]); setMatched([]); setScore(0); setMoves(0);
        };

        const clickDetails = (id: string, matchId: number) => {
            if (flipped.length === 2 || flipped.find(f => f.id === id) || matched.includes(matchId)) return;
            const newFlipped = [...flipped, { id, matchId }];
            setFlipped(newFlipped);
            if (newFlipped.length === 2) {
                setMoves(moves + 1);
                if (newFlipped[0].matchId === newFlipped[1].matchId) {
                    setMatched([...matched, matchId]);
                    setScore(score + 20);
                    setFlipped([]);
                    if (matched.length + 1 === cards.length / 2) updateLifetimeScore('memory', score + 20);
                } else {
                    setTimeout(() => setFlipped([]), 1000);
                }
            }
        };

        return (
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-white/20 dark:border-white/10 p-10">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Neural Memory</h2>
                    <div className="flex gap-4 font-bold text-slate-500">
                        <span>Moves: {moves}</span>
                        <span className="text-indigo-600">Score: {score}</span>
                        <button onClick={init} className="text-xs uppercase bg-slate-200 dark:bg-white/10 px-3 py-1 rounded-lg">Reset</button>
                    </div>
                </div>

                {matched.length === cards.length / 2 ? (
                    <div className="text-center py-12">
                        <h3 className="text-3xl font-bold mb-4">You Win!</h3>
                        <button onClick={init} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">Play Again</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                        {cards.map((c, i) => {
                            const isFlipped = flipped.find(f => f.id === c.id) || matched.includes(c.match);
                            return (
                                <motion.div
                                    key={c.id}
                                    layoutId={c.id}
                                    onClick={() => clickDetails(c.id, c.match)}
                                    className={`aspect-square rounded-xl flex items-center justify-center p-2 text-center text-xs font-bold cursor-pointer transition-all border-2
                                    ${isFlipped
                                            ? matched.includes(c.match) ? 'bg-green-500 border-green-500 text-white' : 'bg-indigo-500 border-indigo-500 text-white'
                                            : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-300'
                                        }
                                `}
                                >
                                    {isFlipped ? c.content : <Brain className="opacity-20" />}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    /* ---------------- LEARNER VIEW ---------------- */

    const LearnerGamesMenu = () => (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans relative overflow-hidden">
            {/* --- AMBIENT BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/40 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-8 border border-white/20 backdrop-blur-md shadow-sm"
                    >
                        <Target size={14} /> Interactive Training
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">AI Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Arena</span></h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Sharpen your skills with interactive challenges designed to test your knowledge of AI safety and ethics.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    <GameCard
                        icon={Clock}
                        title="Speed Protocols"
                        description="Quick-fire True/False questions. Test your reaction time."
                        onClick={() => setCurrentGame('truefalse')}
                        color="from-red-500 to-pink-500"
                    />

                    <GameCard
                        icon={Eye}
                        title="Deepfake Scan"
                        description="Analyze video feeds and identify synthetic manipulations."
                        onClick={() => setCurrentGame('deepfake')}
                        color="from-purple-500 to-indigo-500"
                    />

                    <GameCard
                        icon={Target}
                        title="Bias Detection"
                        description="Uncover hidden biases in algorithmic decision making."
                        onClick={() => setCurrentGame('bias-spotter')}
                        color="from-orange-500 to-amber-500"
                    />

                    <GameCard
                        icon={Zap}
                        title="Phishing Filter"
                        description="Sort incoming comms. Isolate threats from safe messages."
                        onClick={() => setCurrentGame('phishing')}
                        color="from-cyan-500 to-blue-500"
                    />
                    <GameCard
                        icon={Shuffle}
                        title="Drag & Matach"
                        description="Connect terms with their correct definitions."
                        onClick={() => setCurrentGame('dragdrop')}
                        color="from-green-500 to-emerald-500"
                    />
                    <GameCard
                        icon={Brain}
                        title="Neural Memory"
                        description="Train your memory recall with AI concepts."
                        onClick={() => setCurrentGame('memory')}
                        color="from-teal-500 to-green-500"
                    />
                </div>

                <div className="mt-12">
                    <GamificationDashboard />
                </div>
            </div>
        </div>
    );

    /* ---------------- ROUTING ---------------- */

    const AdminGameList = () => {
        const [isCreating, setIsCreating] = useState(false);
        if (user?.role !== 'ADMIN') return null;
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} p-8`}>
                {/* Admin table code matching other pages, abbreviated for length but preserving functional components */}
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Game Management</h1>
                        <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"><Plus size={20} /> Create Game</button>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-bold border-b border-slate-100 dark:border-slate-700">Type</th>
                                        <th className="p-4 font-bold border-b border-slate-100 dark:border-slate-700">Content Preview</th>
                                        <th className="p-4 font-bold border-b border-slate-100 dark:border-slate-700">Status</th>
                                        <th className="p-4 font-bold border-b border-slate-100 dark:border-slate-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {allGames.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                                No games found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        allGames.map((game: any) => {
                                            // Helper to get a preview string based on game type
                                            const getPreview = (g: any) => {
                                                const data = g.game_data;
                                                if (!data) return 'No data';
                                                if (g.game_type === 'TRUE_FALSE' || g.game_type === 'MULTIPLE_CHOICE') return data.question || 'Question';
                                                if (g.game_type === 'DRAG_DROP') return `${data.term} - ${data.definition}`;
                                                if (g.game_type === 'SPOT_BIAS') return data.scenario?.substring(0, 50) + '...';
                                                if (g.game_type === 'MEMORY') return `${data.term}`;
                                                return 'Game Content';
                                            };

                                            return (
                                                <tr key={game.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="p-4 align-middle">
                                                        <span className="px-2 py-1 rounded text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                            {game.game_type.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 align-middle text-sm font-medium text-slate-700 dark:text-slate-300 max-w-md truncate">
                                                        {getPreview(game)}
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${game.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                            {game.is_active ? 'Active' : 'Draft'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                                                            <AdminActionButtons item={game} contentType="games" onUpdate={fetchGames} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <ContentEditModal isOpen={isCreating} onClose={() => setIsCreating(false)} item={null} contentType="games" onSuccess={fetchGames} />
                </div>
            </div>
        );
    };


    if (user?.role === 'ADMIN' && !currentGame) return <AdminGameList />;

    const renderCurrentGame = () => {
        const Container = ({ children }: { children: React.ReactNode }) => (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans relative overflow-hidden p-8 flex flex-col">
                {/* --- AMBIENT BACKGROUND for internal pages too --- */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 mix-blend-overlay"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto w-full flex-grow">
                    <BackButton onClick={() => setCurrentGame(null)} />
                    {children}
                </div>
            </div>
        );

        switch (currentGame) {
            case 'dragdrop': return <Container><DragDropGame /></Container>;
            case 'truefalse': return <Container><TrueFalseGame /></Container>;
            case 'quiz': return <Container><MultipleChoiceGame /></Container>;
            case 'bias': return <Container><SpotBiasGame /></Container>;
            case 'memory': return <Container><MemoryGame /></Container>;
            case 'deepfake': return <Container><DeepfakeDetector data={allGames.find(g => g.game_type === 'DEEPFAKE_DETECTOR')?.game_data || { rounds: [] }} onScoreUpdate={(score) => updateLifetimeScore('deepfake', score)} /></Container>;
            case 'bias-spotter': return <Container><BiasSpotter data={allGames.find(g => g.game_type === 'BIAS_SPOTTER')?.game_data || { scenarios: [] }} onScoreUpdate={(score) => updateLifetimeScore('biasspotter', score)} /></Container>;
            case 'phishing': return <Container><PhishingSorter data={allGames.find(g => g.game_type === 'PHISHING_SORTER')?.game_data || { emails: [] }} onScoreUpdate={(score) => updateLifetimeScore('phishing', score)} /></Container>;
            default: return <LearnerGamesMenu />;
        }
    };

    return renderCurrentGame();
};

export default GamesPage;
