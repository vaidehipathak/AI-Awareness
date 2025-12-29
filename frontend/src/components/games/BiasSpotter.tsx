import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Search, AlertTriangle, ThumbsUp } from 'lucide-react';

interface DataPoint {
    clue: string;
    is_bias: boolean;
}

interface Scenario {
    title: string;
    ai_decision: string;
    visible_data: string[];
    hidden_data: DataPoint[];
    bias_type: string;
}

interface BiasSpotterProps {
    data: {
        scenarios: Scenario[];
    };
    onScoreUpdate?: (score: number) => void;
}

const BiasSpotter: React.FC<BiasSpotterProps> = ({ data, onScoreUpdate }) => {
    const [currentScenario, setCurrentScenario] = useState(0);
    const [score, setScore] = useState(0);
    const [revealedData, setRevealedData] = useState<number[]>([]);
    const [categorizedData, setCategorizedData] = useState<{
        bias: number[];
        fair: number[];
    }>({ bias: [], fair: [] });
    const [showResult, setShowResult] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);

    const [showAllAnswers, setShowAllAnswers] = useState(false);

    const scenario = data.scenarios[currentScenario];

    const revealDataPoint = (index: number) => {
        if (!revealedData.includes(index) && !showResult) {
            setRevealedData([...revealedData, index]);
        }
    };

    const showAllCorrectAnswers = () => {
        setShowAllAnswers(true);
        // Reveal all data points
        setRevealedData(scenario.hidden_data.map((_, index) => index));
        // Set correct categorizations
        const correctCategorization = {
            bias: scenario.hidden_data.map((data, index) => data.is_bias ? index : -1).filter(i => i !== -1),
            fair: scenario.hidden_data.map((data, index) => !data.is_bias ? index : -1).filter(i => i !== -1)
        };
        setCategorizedData(correctCategorization);
    };

    const categorizeData = (index: number, category: 'bias' | 'fair') => {
        if (showResult || showAllAnswers) return;

        // Remove from both categories first
        const newCategorized = {
            bias: categorizedData.bias.filter(i => i !== index),
            fair: categorizedData.fair.filter(i => i !== index)
        };

        // Add to selected category
        newCategorized[category].push(index);
        setCategorizedData(newCategorized);
    };

    const handleSubmit = () => {
        if (showAllAnswers) {
            // If showing all answers, just show the result without scoring
            setShowResult(true);
            return;
        }

        let correct = 0;
        let total = scenario.hidden_data.length;

        scenario.hidden_data.forEach((data, index) => {
            const inBias = categorizedData.bias.includes(index);
            const inFair = categorizedData.fair.includes(index);

            if ((data.is_bias && inBias) || (!data.is_bias && inFair)) {
                correct++;
            }
        });

        const accuracy = (correct / total) * 100;
        const points = Math.round(accuracy / 10);
        setScore(score + points);
        setShowResult(true);
    };

    const handleNext = () => {
        if (currentScenario < data.scenarios.length - 1) {
            setCurrentScenario(currentScenario + 1);
            setRevealedData([]);
            setCategorizedData({ bias: [], fair: [] });
            setShowResult(false);
            setShowAllAnswers(false);
        } else {
            setGameComplete(true);
            if (onScoreUpdate) {
                onScoreUpdate(score);
            }
        }
    };

    if (gameComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center"
                >
                    <Search className="w-20 h-20 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Investigation Complete!
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                        Final Score: {score} points
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                        {score >= 20 ? "Expert Bias Detective! 🏆" : score >= 10 ? "Good investigative skills! 👍" : "Keep learning about AI bias! 📚"}
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        AI Bias Investigation
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Case {currentScenario + 1} of {data.scenarios.length}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{score}</p>
                </div>
            </div>

            {/* Scenario Card */}
            <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {scenario.title}
                </h3>
                <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">AI Decision:</p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {scenario.ai_decision}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Initial Data:</p>
                    <ul className="space-y-1">
                        {scenario.visible_data.map((data, index) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                                {data}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>Mission:</strong> Investigate the AI's decision. Reveal hidden data points and categorize them as "Bias Evidence" or "Fair Practice" to build your case.
                </p>
            </div>

            {/* Hidden Data Points */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Search className="w-5 h-5 text-orange-500" />
                    Hidden Data (Click to Investigate)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {scenario.hidden_data.map((data, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border-2 transition-all ${revealedData.includes(index)
                                ? 'bg-white dark:bg-gray-800 border-orange-300 dark:border-orange-700'
                                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-orange-400'
                                }`}
                        >
                            {revealedData.includes(index) ? (
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{data.clue}</p>
                                    {!showResult && !showAllAnswers && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => categorizeData(index, 'bias')}
                                                className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition cursor-pointer ${categorizedData.bias.includes(index)
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/40'
                                                    }`}
                                            >
                                                <AlertTriangle className="w-3 h-3 inline mr-1" />
                                                Bias
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => categorizeData(index, 'fair')}
                                                className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition cursor-pointer ${categorizedData.fair.includes(index)
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/40'
                                                    }`}
                                            >
                                                <ThumbsUp className="w-3 h-3 inline mr-1" />
                                                Fair
                                            </button>
                                        </div>
                                    )}
                                    {(showResult || showAllAnswers) && (
                                        <div className="mt-2">
                                            {data.is_bias ? (
                                                <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Bias Evidence
                                                    {categorizedData.bias.includes(index) && <CheckCircle className="w-3 h-3 text-green-500 ml-1" />}
                                                    {categorizedData.fair.includes(index) && <XCircle className="w-3 h-3 text-red-500 ml-1" />}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                                                    <ThumbsUp className="w-3 h-3" />
                                                    Fair Practice
                                                    {categorizedData.fair.includes(index) && <CheckCircle className="w-3 h-3 text-green-500 ml-1" />}
                                                    {categorizedData.bias.includes(index) && <XCircle className="w-3 h-3 text-red-500 ml-1" />}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => revealDataPoint(index)}
                                    disabled={showResult}
                                    className="w-full text-left cursor-pointer"
                                >
                                    <p className="text-sm text-gray-400 dark:text-gray-500">🔒 Click to reveal data point {index + 1}</p>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Result */}
            {showResult && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl mb-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700"
                >
                    <h3 className="text-xl font-bold text-orange-700 dark:text-orange-300 mb-4">
                        Investigation Results
                    </h3>

                    {/* Score Summary */}
                    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                        {showAllAnswers ? (
                            <div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Correct Answers Shown
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    All correct categorizations are displayed below for learning purposes.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Your Score: {Math.round((scenario.hidden_data.filter((data, index) => {
                                        const inBias = categorizedData.bias.includes(index);
                                        const inFair = categorizedData.fair.includes(index);
                                        return (data.is_bias && inBias) || (!data.is_bias && inFair);
                                    }).length / scenario.hidden_data.length) * 100)}%
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {scenario.hidden_data.filter((data, index) => {
                                        const inBias = categorizedData.bias.includes(index);
                                        const inFair = categorizedData.fair.includes(index);
                                        return (data.is_bias && inBias) || (!data.is_bias && inFair);
                                    }).length} out of {scenario.hidden_data.length} correct
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Your Choices Review */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            {showAllAnswers ? 'Correct Categorizations:' : 'Your Categorizations:'}
                        </h4>
                        <div className="space-y-2">
                            {scenario.hidden_data.map((data, index) => {
                                if (!revealedData.includes(index)) return null;

                                const inBias = categorizedData.bias.includes(index);
                                const inFair = categorizedData.fair.includes(index);
                                const isCorrect = (data.is_bias && inBias) || (!data.is_bias && inFair);
                                const userChoice = inBias ? 'Bias' : inFair ? 'Fair' : 'Not categorized';

                                return (
                                    <div key={index} className={`p-3 rounded-lg border-2 ${showAllAnswers || isCorrect
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                                        }`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{data.clue}</p>
                                            <div className="flex items-center gap-2">
                                                {(showAllAnswers || isCorrect) ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-xs">
                                            <span className={`font-semibold ${showAllAnswers || isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                                                }`}>
                                                {showAllAnswers ? `Correct: ${data.is_bias ? 'Bias' : 'Fair'}` : `You chose: ${userChoice}`}
                                            </span>
                                            {!showAllAnswers && !isCorrect && (
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    (Correct: {data.is_bias ? 'Bias' : 'Fair'})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bias Type Explanation */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                            Bias Type Identified:
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            {scenario.bias_type}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
                {!showResult ? (
                    <button
                        onClick={handleSubmit}
                        disabled={revealedData.length === 0}
                        className="flex-1 py-3 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                    >
                        Submit Investigation
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleNext}
                            className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                        >
                            {currentScenario < data.scenarios.length - 1 ? 'Next Case →' : 'View Results'}
                        </button>
                        {!showAllAnswers && (
                            <button
                                onClick={showAllCorrectAnswers}
                                className="py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                            >
                                Show All Correct Answers
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BiasSpotter;
