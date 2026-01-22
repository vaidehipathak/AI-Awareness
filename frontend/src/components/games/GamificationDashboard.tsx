import React, { useMemo } from 'react';
import { Trophy, Star, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

type QuizResult = {
    score: number;
    total: number;
    passed: boolean;
    completed: boolean;
};

type QuizProgress = {
    unlocked: string[];
    results: Record<string, QuizResult>;
};

type ProgressState = {
    easy: QuizProgress;
    medium: QuizProgress;
    hard: QuizProgress;
};

const calculateStats = (progress: ProgressState | null) => {
    if (!progress) {
        return {
            streak: 0,
            totalXP: 0,
            accuracy: 0,
            level: 1
        };
    }

    let totalCorrect = 0;
    let totalQuestions = 0;
    let totalXP = 0;
    let completedQuizzes = 0;

    // Calculate stats from all difficulties
    ['easy', 'medium', 'hard'].forEach((difficulty) => {
        const diffProgress = progress[difficulty as keyof ProgressState];
        if (diffProgress && diffProgress.results) {
            Object.values(diffProgress.results).forEach((result) => {
                if (result.completed) {
                    totalCorrect += result.score;
                    totalQuestions += result.total;
                    completedQuizzes++;

                    // XP calculation: base points + bonus for passing
                    const baseXP = result.score * 10;
                    const passBonus = result.passed ? 50 : 0;
                    const difficultyMultiplier =
                        difficulty === 'easy' ? 1 :
                            difficulty === 'medium' ? 1.5 : 2;

                    totalXP += Math.floor((baseXP + passBonus) * difficultyMultiplier);
                }
            });
        }
    });

    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const level = Math.floor(totalXP / 200) + 1; // Level up every 200 XP
    const streak = completedQuizzes > 0 ? Math.min(completedQuizzes, 30) : 0; // Simple streak based on completed quizzes

    return {
        streak,
        totalXP,
        accuracy,
        level
    };
};

const GamificationDashboard: React.FC = () => {
    const { user } = useAuth();

    const stats = useMemo(() => {
        try {
            const storageKey = `quiz-progress:${user?.id ?? user?.email ?? 'guest'}`;
            const raw = sessionStorage.getItem(storageKey);
            if (raw) {
                const progress: ProgressState = JSON.parse(raw);
                return calculateStats(progress);
            }
        } catch (err) {
            console.warn('Failed to load quiz progress for dashboard', err);
        }
        return calculateStats(null);
    }, [user?.id, user?.email]);

    return (
        <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                    <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Your Achievements</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Current Streak', value: `${stats.streak} ${stats.streak === 1 ? 'Quiz' : 'Quizzes'}`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Total XP', value: stats.totalXP.toLocaleString(), icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Accuracy', value: `${stats.accuracy}%`, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Level', value: stats.level.toString(), icon: Trophy, color: 'text-green-500', bg: 'bg-green-500/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm"
                    >
                        <div className={`p-2 w-fit rounded-lg mb-3 ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default GamificationDashboard;
