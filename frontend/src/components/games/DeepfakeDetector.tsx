import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Lightbulb } from 'lucide-react';

interface Round {
    image_a: string;
    image_b: string;
    clues: string[];
    correct_answer: 'a' | 'b';
    explanation: string;
}

interface DeepfakeDetectorProps {
    data: {
        rounds: Round[];
    };
    onScoreUpdate?: (score: number) => void;
}

const DeepfakeDetector: React.FC<DeepfakeDetectorProps> = ({ data, onScoreUpdate }) => {
    const [currentRound, setCurrentRound] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedImage, setSelectedImage] = useState<'a' | 'b' | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [revealedClues, setRevealedClues] = useState<number[]>([]);
    const [zoomedImage, setZoomedImage] = useState<'a' | 'b' | null>(null);
    const [gameComplete, setGameComplete] = useState(false);

    const round = data.rounds[currentRound];

    const handleImageSelect = (image: 'a' | 'b') => {
        if (showResult) return;
        setSelectedImage(image);
    };

    const handleSubmit = () => {
        if (!selectedImage) return;

        const isCorrect = selectedImage === round.correct_answer;
        if (isCorrect) {
            setScore(score + (10 - revealedClues.length * 2)); // Bonus for fewer clues used
        }
        setShowResult(true);
    };

    const handleNext = () => {
        if (currentRound < data.rounds.length - 1) {
            setCurrentRound(currentRound + 1);
            setSelectedImage(null);
            setShowResult(false);
            setRevealedClues([]);
            setZoomedImage(null);
        } else {
            setGameComplete(true);
            if (onScoreUpdate) {
                onScoreUpdate(score);
            }
        }
    };

    const revealClue = (index: number) => {
        if (!revealedClues.includes(index)) {
            setRevealedClues([...revealedClues, index]);
        }
    };

    if (gameComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center"
                >
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Game Complete!
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                        Final Score: {score} points
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                        {score >= 20 ? "Expert Deepfake Detective! 🏆" : score >= 10 ? "Good job! Keep practicing. 👍" : "Keep learning about deepfakes! 📚"}
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
                        Deepfake Detective Challenge
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Round {currentRound + 1} of {data.rounds.length}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{score}</p>
                </div>
            </div>

            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>Mission:</strong> One image is real, one is AI-generated. Click to zoom, reveal clues, and identify the deepfake!
                </p>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {(['a', 'b'] as const).map((img) => (
                    <motion.div
                        key={img}
                        whileHover={{ scale: 1.02 }}
                        className={`relative cursor-pointer rounded-xl overflow-hidden border-4 transition-all ${selectedImage === img
                            ? 'border-purple-500 shadow-lg shadow-purple-500/50'
                            : 'border-gray-300 dark:border-gray-700'
                            } ${showResult && round.correct_answer === img ? 'border-green-500' : ''} ${showResult && selectedImage === img && round.correct_answer !== img ? 'border-red-500' : ''
                            }`}
                        onClick={() => handleImageSelect(img)}
                    >
                        <img
                            src={img === 'a' ? round.image_a : round.image_b}
                            alt={`Option ${img.toUpperCase()}`}
                            className="w-full h-64 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2 z-20">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setZoomedImage(zoomedImage === img ? null : img);
                                }}
                                className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition shadow-lg"
                                type="button"
                            >
                                <Eye className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <p className="text-white font-bold text-lg">Image {img.toUpperCase()}</p>
                        </div>
                        {showResult && round.correct_answer === img && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                        )}
                        {showResult && selectedImage === img && round.correct_answer !== img && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                <XCircle className="w-16 h-16 text-red-500" />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Clues Section */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Investigation Clues
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {round.clues.map((clue, index) => (
                        <button
                            key={index}
                            onClick={() => revealClue(index)}
                            disabled={revealedClues.includes(index) || showResult}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${revealedClues.includes(index)
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-yellow-400'
                                }`}
                        >
                            {revealedClues.includes(index) ? (
                                <p className="text-sm text-gray-700 dark:text-gray-300">{clue}</p>
                            ) : (
                                <p className="text-sm text-gray-400 dark:text-gray-500">Click to reveal clue {index + 1}</p>
                            )}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    💡 Tip: Fewer clues used = higher score!
                </p>
            </div>

            {/* Result */}
            {showResult && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-xl mb-6 ${selectedImage === round.correct_answer
                        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700'
                        : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700'
                        }`}
                >
                    <h3 className={`text-xl font-bold mb-2 ${selectedImage === round.correct_answer ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                        }`}>
                        {selectedImage === round.correct_answer ? '✓ Correct!' : '✗ Incorrect'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{round.explanation}</p>
                </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
                {!showResult ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedImage}
                        className="flex-1 py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                    >
                        Submit Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                    >
                        {currentRound < data.rounds.length - 1 ? 'Next Round →' : 'View Results'}
                    </button>
                )}
            </div>

            {/* Zoom Modal */}
            {zoomedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setZoomedImage(null)}
                >
                    <div className="relative max-w-5xl w-full">
                        <button
                            onClick={() => setZoomedImage(null)}
                            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition z-10"
                        >
                            <XCircle className="w-6 h-6 text-gray-700" />
                        </button>
                        <img
                            src={zoomedImage === 'a' ? round.image_a : round.image_b}
                            alt={`Zoomed Image ${zoomedImage.toUpperCase()}`}
                            className="w-full h-auto rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                            <p className="font-bold">Image {zoomedImage.toUpperCase()} - Zoomed View</p>
                            <p className="text-sm text-gray-300">Click outside to close</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default DeepfakeDetector;
