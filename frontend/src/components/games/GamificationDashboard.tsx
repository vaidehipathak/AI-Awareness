import React from 'react';
import { Trophy, Star, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const GamificationDashboard: React.FC = () => {
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
                    { label: 'Current Streak', value: '3 Days', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Total XP', value: '1,250', icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Accuracy', value: '87%', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Level', value: '5', icon: Trophy, color: 'text-green-500', bg: 'bg-green-500/10' },
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
