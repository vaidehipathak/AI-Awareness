import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, AlertTriangle, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

interface Email {
    subject: string;
    sender: string;
    body: string;
    headers: {
        from: string;
        reply_to: string;
    };
    red_flags: string[];
    is_phishing: boolean;
}

interface PhishingSorterProps {
    data: {
        emails: Email[];
    };
    onScoreUpdate?: (score: number) => void;
}

const PhishingSorter: React.FC<PhishingSorterProps> = ({ data, onScoreUpdate }) => {
    const [currentEmail, setCurrentEmail] = useState(0);
    const [score, setScore] = useState(0);

    if (!data || !data.emails || data.emails.length === 0) {
        return (
            <div className="text-center p-12 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">No phishing emails available at the moment.</p>
            </div>
        );
    }
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [gameActive, setGameActive] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [showHeaders, setShowHeaders] = useState(false);
    const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
    const [processedEmails, setProcessedEmails] = useState(0);

    const email = data.emails[currentEmail];

    useEffect(() => {
        if (gameActive && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && gameActive) {
            setGameComplete(true);
            setGameActive(false);
            if (onScoreUpdate) {
                onScoreUpdate(score);
            }
        }
    }, [timeLeft, gameActive, score, onScoreUpdate]);

    const handleSort = (isPhishing: boolean) => {
        if (!gameActive || !email) return;

        const correct = isPhishing === email.is_phishing;

        if (correct) {
            const points = 10 + combo * 2;
            setScore(score + points);
            setCombo(combo + 1);
            setFeedback({
                correct: true,
                message: `+${points} points! ${combo > 0 ? `${combo}x combo!` : ''}`
            });
        } else {
            setCombo(0);
            setFeedback({
                correct: false,
                message: `Wrong! ${email.is_phishing ? 'This was phishing!' : 'This was legitimate!'}`
            });
        }

        setProcessedEmails(processedEmails + 1);

        setTimeout(() => {
            setFeedback(null);
            setShowHeaders(false);

            if (currentEmail < data.emails.length - 1) {
                setCurrentEmail(currentEmail + 1);
            } else {
                setGameComplete(true);
                setGameActive(false);
            }
        }, 1500);
    };

    const startGame = () => {
        setGameActive(true);
        setScore(0);
        setCombo(0);
        setTimeLeft(60);
        setCurrentEmail(0);
        setProcessedEmails(0);
        setGameComplete(false);
    };

    if (gameComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center"
                >
                    <Mail className="w-20 h-20 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Time's Up!
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                        Final Score: {score} points
                    </p>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                        Emails Processed: {processedEmails} / {data.emails.length}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {score >= 100 ? "Phishing Expert! 🏆" : score >= 50 ? "Good job! 👍" : "Keep practicing! 📚"}
                    </p>
                    <button
                        onClick={startGame}
                        className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                    >
                        Play Again
                    </button>
                </motion.div>
            </div>
        );
    }

    if (!gameActive) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                <Mail className="w-20 h-20 text-blue-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Phishing Email Sorter
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md">
                    Sort emails as quickly as possible! Click to inspect headers for clues. Build combos for bonus points!
                </p>
                <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>How to play:</strong></p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Click ❌ for phishing emails</li>
                        <li>• Click ✓ for legitimate emails</li>
                        <li>• Click "Show Headers" to inspect email details</li>
                        <li>• Build combos for bonus points!</li>
                        <li>• You have 60 seconds!</li>
                    </ul>
                </div>
                <button
                    onClick={startGame}
                    className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                    Start Game
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}</p>
                    </div>
                    {combo > 0 && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                            <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{combo}x Combo!</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-xl font-bold text-red-600 dark:text-red-400">{timeLeft}s</span>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Email {currentEmail + 1} of {data.emails.length}</span>
                    <span>{processedEmails} processed</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${((currentEmail + 1) / data.emails.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Email Card */}
            <motion.div
                key={currentEmail}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
            >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Email Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-3 mb-3">
                            <Mail className="w-6 h-6 text-gray-400 mt-1" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">From:</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{email.sender}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Subject:</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{email.subject}</p>
                        </div>
                    </div>

                    {/* Email Body */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{email.body}</p>
                    </div>

                    {/* Headers Section */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setShowHeaders(!showHeaders)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                        >
                            {showHeaders ? '▼ Hide Headers' : '▶ Show Headers (Click to inspect)'}
                        </button>
                        {showHeaders && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs"
                            >
                                <p className="text-gray-600 dark:text-gray-400">From: {email.headers.from}</p>
                                <p className="text-gray-600 dark:text-gray-400">Reply-To: {email.headers.reply_to}</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Feedback Overlay */}
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute inset-0 flex items-center justify-center rounded-xl ${feedback.correct
                            ? 'bg-green-500/90'
                            : 'bg-red-500/90'
                            }`}
                    >
                        <div className="text-center text-white">
                            {feedback.correct ? (
                                <CheckCircle className="w-16 h-16 mx-auto mb-2" />
                            ) : (
                                <XCircle className="w-16 h-16 mx-auto mb-2" />
                            )}
                            <p className="text-2xl font-bold">{feedback.message}</p>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleSort(true)}
                    disabled={!!feedback}
                    className="py-4 px-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                    <AlertTriangle className="w-5 h-5" />
                    Phishing
                </button>
                <button
                    onClick={() => handleSort(false)}
                    disabled={!!feedback}
                    className="py-4 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-5 h-5" />
                    Legitimate
                </button>
            </div>

            {/* Hint */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                💡 Look for suspicious senders, urgent language, and mismatched domains!
            </p>
        </div>
    );
};

export default PhishingSorter;
