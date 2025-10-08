// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Clock, Trophy, Brain, Target, Eye, BookOpen, Cpu, Moon, Sun, Zap, Layers, Code, AlertTriangle } from 'lucide-react';

// --- UTILITY FUNCTIONS ---
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const getRandomitems = (array, count) => {
    return shuffleArray(array).slice(0, count);
};

// --- DATA (Conceptual 50 items for all runnable games) ---

// NOTE: dragDropData is kept as a placeholder since 'Drag & Drop Matching' is still listed.
const dragDropData = [
    { term: "Machine Learning", definition: "Algorithm that learns from data" },
    { term: "Neural Network", definition: "Computing system inspired by biological neural networks" },
    { term: "Deep Learning", definition: "ML technique using multiple layers" },
    { term: "Natural Language Processing", definition: "AI that understands human language" },
    { term: "Computer Vision", definition: "AI that interprets visual information" },
    // ... 45 more items to reach 50
];

const trueFalseData = [
    // Data for True/False Lightning
]; 
const debuggingData = [
    // Data for Code Debugging
]; 
const performanceData = [
    { scenario: "Your model has 60% accuracy on validation set.", options: ["Add data augmentation", "Reduce learning rate", "Add more layers", "Use different optimizer"], bestChoice: 0, improvement: "+15% accuracy", explanation: "Data augmentation helps model generalize better." },
    { scenario: "Training loss decreases but validation loss increases after epoch 10.", options: ["Train for more epochs", "Add early stopping and regularization", "Increase batch size", "Use larger learning rate"], bestChoice: 1, improvement: "Prevents overfitting", explanation: "Diverging train/validation loss indicates overfitting." },
    { scenario: "Model training is very slow on large dataset.", options: ["Use smaller model", "Implement mini-batch gradient descent", "Reduce dataset size", "Use CPU instead of GPU"], bestChoice: 1, improvement: "10x faster training", explanation: "Mini-batches allow efficient use of vectorized operations and GPU memory." },
    { scenario: "Text sentiment model performs poorly on social media data.", options: ["Add domain-specific preprocessing", "Use bigger model", "Train for more epochs", "Change to different algorithm"], bestChoice: 0, improvement: "+20% accuracy", explanation: "Domain-specific preprocessing helps model understand social media language patterns." },
    { scenario: "Recommendation system suggests same items to all users.", options: ["Add collaborative filtering features", "Use more items in dataset", "Increase model complexity", "Change evaluation metric"], bestChoice: 0, improvement: "Personalized recommendations", explanation: "Collaborative filtering uses user-item interactions for personalized suggestions." },
    // ... 45 more items to reach 50
];
const architectureData = [
    { problem: "Build a CNN for image classification of 32x32 RGB images, 10 classes", components: ["Conv2D(32, 3x3)", "MaxPool2D(2x2)", "Dense(10)", "Flatten()", "ReLU", "Softmax", "LSTM"], correctArchitecture: ["Conv2D(32, 3x3)", "ReLU", "MaxPool2D(2x2)", "Flatten()", "Dense(10)", "Softmax"], explanation: "CNN uses Conv layers for feature extraction, pooling for reduction, and dense for classification." },
    { problem: "Design RNN for sequence prediction (time series forecasting)", components: ["LSTM(100)", "GRU(50)", "Dense(1)", "Dropout(0.2)", "Time Distributed", "Flatten"], correctArchitecture: ["LSTM(100)", "Dropout(0.2)", "Dense(1)"], explanation: "RNN for time series: LSTM layers capture temporal patterns, dropout prevents overfitting." },
    { problem: "Design a simple autoencoder for image denoising (28x28 grayscale).", components: ["Conv2D(32)", "Conv2DTranspose(32)", "Pooling", "Upsampling", "Dense"], correctArchitecture: ["Conv2D(32)", "Pooling", "Upsampling", "Conv2DTranspose(32)"], explanation: "Autoencoders use an encoder (Conv+Pooling) to compress and a decoder (ConvTranspose+Upsampling) to reconstruct the image." },
    { problem: "Create a simple Feed-Forward Network for binary classification.", components: ["Dense(128, 'relu')", "Dense(1, 'sigmoid')", "Dense(10, 'softmax')", "LSTM(50)"], correctArchitecture: ["Dense(128, 'relu')", "Dense(64, 'relu')", "Dense(1, 'sigmoid')"], explanation: "A simple FFN uses Dense layers with ReLU, and a final Dense layer with sigmoid for binary classification." },
    { problem: "Architecture for a basic Generative Adversarial Network (GAN) Generator.", components: ["Dense(256)", "Dense(784)", "LeakyReLU", "Sigmoid", "Conv2D"], correctArchitecture: ["Dense(256)", "LeakyReLU", "Dense(784)", "Sigmoid"], explanation: "GAN Generator typically uses Dense layers and a final Sigmoid activation to produce an image." },
    // ... 45 more items to reach 50
];

const scenarioData = [
    { scenario: "Facial recognition tests show a 15% higher error rate for people of color. Do you:", options: ["Launch and fix it later", "Delay the launch until the error rate is equitable", "Add a disclaimer"], bestChoice: 1, explanation: "Ethical choice is to delay the launch. Deploying known-flawed tech violates fairness." },
    { scenario: "An autonomous drone must choose between risking minor property damage or maintaining a course that frightens a child. What is the priority?", options: ["Prioritize the drone's payload", "Prioritize minimizing risk to humans, even if it causes property damage", "Default to minimizing financial cost"], bestChoice: 1, explanation: "AI ethics prioritizes human safety and well-being above property." },
    { scenario: "Predictive policing model is highly accurate but relies on racially biased arrest data. Removing the feature drops accuracy by 10%. Do you:", options: ["Keep the feature for accuracy", "Remove the feature for fairness, accepting lower accuracy", "Filter the historical arrest data to correct the bias and retrain"], bestChoice: 2, explanation: "Mitigate the bias in the data source itself for both accuracy and fairness." },
    { scenario: "A new language model generates hateful content when prompted aggressively. The model is 99% complete. Do you:", options: ["Release it with strong content filters and monitoring", "Scrap the model and start over", "Release it privately to a small group"], bestChoice: 0, explanation: "Using strong guardrails/filters is the standard and necessary practice to manage known risks while deploying." },
    { scenario: "Medical diagnosis AI performs poorly on rare diseases. Adding rare disease data dilutes performance on common diseases. What should you do?", options: ["Prioritize common diseases", "Develop a separate, specialized model for rare diseases", "Force the current model to learn all diseases"], bestChoice: 1, explanation: "Specialized models allow for dedicated tuning and adequate data focus for both rare and common diseases." },
    // ... 45 more items to reach 50
];

const biasData = [
    { scenario: "A loan approval AI trained only on data from affluent neighborhoods denies applicants from low-income areas at a higher rate.", biasType: "Selection/Sampling Bias", explanation: "The training data (sampling) does not represent the full population, leading to skewed outcomes." },
    { scenario: "An image recognition model performs well on light-skinned faces but poorly on dark-skinned faces because the dataset was mainly composed of lighter complexions.", biasType: "Underrepresentation/Demographic Bias", explanation: "The dataset lacks sufficient examples of a specific demographic." },
    { scenario: "A hiring tool rates female candidates lower for engineering roles because historical data showed fewer women in those roles.", biasType: "Historical/Pre-existing Bias", explanation: "The AI perpetuated societal bias present in the historical data it was trained on." },
    { scenario: "During labeling, human annotators subconsciously used negative terms to describe political posts they disagreed with.", biasType: "Labeling/Annotation Bias", explanation: "Bias was introduced by the human labelers' subjective opinions." },
    { scenario: "An AI designed to predict health risks uses a feature called 'zip code' which acts as a proxy for socioeconomic status and racial demographics.", biasType: "Proxy Bias (Feature Selection)", explanation: "The 'zip code' feature is correlated with protected attributes, causing the model to discriminate." },
    // ... 45 more items to reach 50
];


// --- STYLISTIC UTILITY COMPONENTS ---

const BackButton = ({ onClick }) => (
    <button onClick={onClick} className="flex items-center text-lg font-semibold text-blue-500 hover:text-blue-700 transition-colors mb-6">
        <ChevronRight className="w-5 h-5 rotate-180 mr-2" /> Back to Games
    </button>
);
const GameCard = ({ icon: Icon, title, description, onClick, color }) => (
    <div onClick={onClick} className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all hover:shadow-xl border-l-4 ${color} bg-white dark:bg-gray-800 hover:scale-[1.02]`}>
        <Icon className={`w-8 h-8 ${color.replace('border-l', 'text')} mb-3`} />
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
);
const PlaceholderGame = ({ game, darkMode, updateLifetimeScore }) => (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{game}</h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-4`}>Content for the fully functional {game} game is here.</p>
    </div>
);


// --- FULLY FUNCTIONAL GAME COMPONENTS (Modified for 5 questions/round and dark text) ---

// 1. Memory Match Game (5 pairs per round)
const MemoryMatchGame = ({ darkMode, updateLifetimeScore }) => {
    const [gameData, setGameData] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [score, setScore] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);

    const loadNewGame = () => {
        const selectedPairs = getRandomitems(dragDropData, 5); // 5 questions/items
        const cards = selectedPairs.flatMap(pair => [
            { id: Math.random(), type: 'term', value: pair.term, matchId: pair.term },
            { id: Math.random(), type: 'definition', value: pair.definition, matchId: pair.term }
        ]);
        
        setGameData(shuffleArray(cards));
        setFlippedIndices([]);
        setMatchedPairs([]);
        setScore(0);
        setIsChecking(false);
        setGameComplete(false);
    };

    useEffect(() => {
        if (dragDropData.length > 0) loadNewGame();
    }, []);

    useEffect(() => {
        if (matchedPairs.length === 5) {
            setGameComplete(true);
            updateLifetimeScore('memory', score);
        }
    }, [matchedPairs, score]);

    const handleCardClick = (index) => {
        if (isChecking || flippedIndices.includes(index) || gameComplete) return;

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setIsChecking(true);
            const [index1, index2] = newFlipped;
            const card1 = gameData[index1];
            const card2 = gameData[index2];

            if (card1.matchId === card2.matchId) {
                setMatchedPairs([...matchedPairs, card1.matchId]);
                setScore(score + 50);
                setTimeout(() => {
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 500);
            } else {
                setScore(Math.max(0, score - 10));
                setTimeout(() => {
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    };
    
    const Card = ({ index, value, isFlipped, isMatched, onClick }) => (
        <div 
            onClick={onClick}
            className={`
                p-4 h-24 rounded-lg text-center font-semibold cursor-pointer transition-all duration-300
                ${isMatched ? `${darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-700'} scale-95 opacity-50` : ''}
                ${isFlipped && !isMatched ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-300 text-gray-800'} shadow-xl` : ''}
                ${!isFlipped && !isMatched ? `${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} shadow-md` : ''}
                ${isChecking && !isMatched ? 'pointer-events-none' : ''}
            `}
        >
            <div className={`transition-opacity duration-300 ${isFlipped || isMatched ? 'opacity-100' : 'opacity-0'}`}>
                {value}
            </div>
        </div>
    );
    
    if (dragDropData.length === 0) return <div className="text-red-500">Error: Data is missing.</div>;
    if (gameData.length === 0) return <div>Loading...</div>;

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Memory Match (5 Pairs)</h2>
                <div className="flex items-center space-x-4">
                    <div className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Score: {score}</div>
                    <button onClick={loadNewGame} className={`px-4 py-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition-colors`}>
                        New Round (5 Items)
                    </button>
                </div>
            </div>

            {gameComplete && (
                <div className="text-center py-8">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>Round Complete!</h3>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Final Score: {score} points</p>
                    <button onClick={loadNewGame} className={`px-6 py-3 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition-colors`}> Play Again </button>
                </div>
            )}

            {!gameComplete && (
                <div className="grid grid-cols-5 gap-4">
                    {gameData.map((card, index) => {
                        const isFlipped = flippedIndices.includes(index);
                        const isMatched = matchedPairs.includes(card.matchId);
                        
                        return (
                            <Card
                                key={card.id}
                                index={index}
                                value={card.value}
                                isFlipped={isFlipped}
                                isMatched={isMatched}
                                onClick={() => handleCardClick(index)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// 2. Performance Tuning Game (5 scenarios per round)
const PerformanceTuningGame = ({ darkMode, updateLifetimeScore }) => {
    const [currentScenarios, setCurrentScenarios] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [roundComplete, setRoundComplete] = useState(false);

    const loadNewRound = () => {
        const scenarios = getRandomitems(performanceData, 5);
        setCurrentScenarios(scenarios);
        setCurrentIndex(0);
        setSelectedChoice(null);
        setShowResult(false);
        setRoundComplete(false);
        setScore(0);
    };

    useEffect(() => {
        if (performanceData.length > 0) loadNewRound();
    }, []);

    const currentScenario = currentScenarios[currentIndex];

    const handleChoice = (choiceIndex) => {
        if (showResult) return;
        setSelectedChoice(choiceIndex);
        setShowResult(true);

        if (choiceIndex === currentScenario.bestChoice) {
            setScore(score + 40);
        }
    };
    
    const nextScenario = () => {
        if (currentIndex + 1 < currentScenarios.length) {
            setCurrentIndex(currentIndex + 1);
            setSelectedChoice(null);
            setShowResult(false);
        } else {
            setRoundComplete(true);
            updateLifetimeScore('performance', score);
        }
    };

    if (performanceData.length === 0) return <div className="text-red-500">Error: Performance data is missing.</div>;
    if (!currentScenario) return <div>Loading...</div>;
    
    if (roundComplete) {
        return (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 text-center`}>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>Round Complete!</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Final Score: {score} points</p>
                <button onClick={loadNewRound} className={`px-6 py-3 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition-colors`}> Play Again </button>
            </div>
        );
    }
    
    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Performance Tuning (Question {currentIndex + 1} of 5)</h2>
                <div className="flex items-center space-x-4">
                    <div className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Score: {score}</div>
                </div>
            </div>
            
            <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
                <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Scenario:</h4>
                <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} leading-relaxed`}>{currentScenario.scenario}</p>
            </div>
            
            <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>How would you optimize this?</h4>
            <div className="space-y-3 mb-6">
                {currentScenario.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => !showResult && handleChoice(index)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all font-semibold ${
                            showResult
                            ? index === currentScenario.bestChoice
                                ? `${darkMode ? 'bg-green-900 border-green-600 text-green-200' : 'bg-green-50 border-green-300 text-green-700'}`
                                : selectedChoice === index
                                    ? `${darkMode ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-50 border-red-300 text-red-700'}`
                                    : `${darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'} cursor-not-allowed`
                            : `${darkMode ? 'border-gray-600 hover:bg-gray-700 hover:border-blue-500 text-gray-100' : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-800'}`
                        }`}
                    >
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                    </button>
                ))}
            </div>
            
            {showResult && (
                <div className={`${darkMode ? 'bg-yellow-900 border-yellow-600' : 'bg-yellow-50 border-yellow-400'} border-l-4 p-4 mb-6`}>
                    <h4 className={`font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-800'} mb-2`}>Result: {selectedChoice === currentScenario.bestChoice ? 'Correct Choice!' : 'Suboptimal Choice'}</h4>
                    <p className={`${darkMode ? 'text-green-200' : 'text-green-700'} mb-2`}><strong>Improvement:</strong> {currentScenario.improvement}</p>
                    <p className={`${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}><strong>Why:</strong> {currentScenario.explanation}</p>
                </div>
            )}
            
            <div className="text-center">
                <button onClick={nextScenario} disabled={!showResult} className={`px-6 py-3 ${showResult ? `${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white` : `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`} rounded-lg transition-colors`}>
                    {currentIndex + 1 < currentScenarios.length ? 'Next Scenario' : 'Finish Round'}
                </button>
            </div>
        </div>
    );
};

// 3. Architecture Builder Game (5 problems per round)
const ArchitectureBuilderGame = ({ darkMode, updateLifetimeScore }) => {
    const [currentProblems, setCurrentProblems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userArchitecture, setUserArchitecture] = useState([]);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);
    const [roundComplete, setRoundComplete] = useState(false);

    const loadNewRound = () => {
        const problems = getRandomitems(architectureData, 5);
        setCurrentProblems(problems);
        setCurrentIndex(0);
        setScore(0);
        setRoundComplete(false);
        if (problems.length > 0) loadProblem(problems[0]);
    };

    const loadProblem = (problem) => {
        setUserArchitecture([]);
        setAvailableComponents(shuffleArray(problem.components));
        setIsComplete(false);
    };

    useEffect(() => {
        if (architectureData.length > 0) loadNewRound();
    }, []);
    
    useEffect(() => {
        if (currentProblems.length > 0) {
            loadProblem(currentProblems[currentIndex]);
        }
    }, [currentIndex, currentProblems]);
    
    const currentProblem = currentProblems[currentIndex];

    const addComponent = (component) => {
        setUserArchitecture([...userArchitecture, component]);
        setAvailableComponents(availableComponents.filter(c => c !== component));
    };

    const removeComponent = (index) => {
        const component = userArchitecture[index];
        setUserArchitecture(userArchitecture.filter((_, i) => i !== index));
        setAvailableComponents([...availableComponents, component]);
    };

    const checkArchitecture = () => {
        const correctArch = currentProblem.correctArchitecture;
        const hasAllCorrectComponents = correctArch.every(comp => userArchitecture.includes(comp));
        
        if (hasAllCorrectComponents && userArchitecture.length === correctArch.length) {
            setScore(score + 100);
            setIsComplete(true);
        } else {
            alert(`Architecture needs improvement. You must include exactly the correct components. Hint: ${currentProblem.explanation}`);
        }
    };

    const nextProblem = () => {
        if (currentIndex + 1 < currentProblems.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setRoundComplete(true);
            updateLifetimeScore('architecture', score);
        }
    };
    
    if (architectureData.length === 0) return <div className="text-red-500">Error: Architecture data is missing.</div>;
    if (!currentProblem) return <div>Loading...</div>;

    if (roundComplete) {
        return (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 text-center`}>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>Round Complete!</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Final Score: {score} points</p>
                <button onClick={loadNewRound} className={`px-6 py-3 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition-colors`}> Play Again </button>
            </div>
        );
    }

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Architecture Builder (Problem {currentIndex + 1} of 5)</h2>
                <div className="flex items-center space-x-4">
                    <div className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Score: {score}</div>
                </div>
            </div>

            <div className="mb-6">
                <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Problem:</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{currentProblem.problem}</p>
            </div>

            {isComplete ? (
                <div className="text-center py-8">
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>Architecture Built! (+100 Points)</h3>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>**Solution:** {currentProblem.correctArchitecture.join(' → ')}</p>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>**Why:** {currentProblem.explanation}</p>
                    <button onClick={nextProblem} className={`px-6 py-3 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition-colors`}>
                        {currentIndex + 1 < currentProblems.length ? 'Next Problem' : 'Finish Round'}
                    </button>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div>
                        <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Available Components</h4>
                        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                            {availableComponents.map((component, index) => (
                                <button
                                    key={index}
                                    onClick={() => addComponent(component)}
                                    className={`p-2 rounded-lg text-sm font-mono text-center font-semibold transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-blue-300' : 'bg-gray-100 hover:bg-blue-100 text-gray-800'}`}>
                                    {component}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Your Architecture (Click to remove)</h4>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} h-64 overflow-y-auto`}>
                            {userArchitecture.length === 0 ? (
                                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Drag components here to build your network...</p>
                            ) : (
                                <div className="space-y-2">
                                    {userArchitecture.map((component, index) => (
                                        <div 
                                            key={index}
                                            onClick={() => removeComponent(index)}
                                            className={`flex items-center justify-between p-2 ${darkMode ? 'bg-gray-600 hover:bg-red-600 text-gray-100' : 'bg-white hover:bg-red-50 text-gray-800'} rounded cursor-pointer transition-colors font-semibold`}>
                                            <span className={`font-mono text-sm`}>
                                                {index + 1}. {component}
                                            </span>
                                            <span className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>×</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <button onClick={checkArchitecture} className={`px-6 py-3 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition-colors`}>
                                Check Architecture
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 4. AI Scenarios Game (AI Concept Puzzle) (5 scenarios per round)
const ScenarioGame = ({ darkMode, updateLifetimeScore }) => {
    const [currentScenarios, setCurrentScenarios] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [roundComplete, setRoundComplete] = useState(false);

    const loadNewRound = () => {
        const scenarios = getRandomitems(scenarioData, 5);
        setCurrentScenarios(scenarios);
        setCurrentIndex(0);
        setSelectedChoice(null);
        setShowResult(false);
        setRoundComplete(false);
        setScore(0);
    };

    useEffect(() => {
        if (scenarioData.length > 0) loadNewRound();
    }, []);

    const currentScenario = currentScenarios[currentIndex];

    const handleChoice = (choiceIndex) => {
        if (showResult) return;
        setSelectedChoice(choiceIndex);
        setShowResult(true);

        if (choiceIndex === currentScenario.bestChoice) {
            setScore(score + 40);
        }
    };
    
    const nextScenario = () => {
        if (currentIndex + 1 < currentScenarios.length) {
            setCurrentIndex(currentIndex + 1);
            setSelectedChoice(null);
            setShowResult(false);
        } else {
            setRoundComplete(true);
            updateLifetimeScore('scenario', score);
        }
    };

    if (scenarioData.length === 0) return <div className="text-red-500">Error: Scenario data is missing.</div>;
    if (!currentScenario) return <div>Loading...</div>;
    
    if (roundComplete) {
        return (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 text-center`}>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>Round Complete!</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Final Score: {score} points</p>
                <button onClick={loadNewRound} className={`px-6 py-3 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition-colors`}> Play Again </button>
            </div>
        );
    }
    
    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>AI Scenarios (Question {currentIndex + 1} of 5)</h2>
                <div className="flex items-center space-x-4">
                    <div className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Score: {score}</div>
                </div>
            </div>
            
            <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
                <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Ethical Dilemma:</h4>
                <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} leading-relaxed`}>{currentScenario.scenario}</p>
            </div>
            
            <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Your Decision:</h4>
            <div className="space-y-3 mb-6">
                {currentScenario.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => !showResult && handleChoice(index)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all font-semibold ${
                            showResult
                            ? index === currentScenario.bestChoice
                                ? `${darkMode ? 'bg-green-900 border-green-600 text-green-200' : 'bg-green-50 border-green-300 text-green-700'}`
                                : selectedChoice === index
                                    ? `${darkMode ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-50 border-red-300 text-red-700'}`
                                    : `${darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'} cursor-not-allowed`
                            : `${darkMode ? 'border-gray-600 hover:bg-gray-700 hover:border-blue-500 text-gray-100' : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-800'}`
                        }`}
                    >
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                    </button>
                ))}
            </div>
            
            {showResult && (
                <div className={`${darkMode ? 'bg-yellow-900 border-yellow-600' : 'bg-yellow-50 border-yellow-400'} border-l-4 p-4 mb-6`}>
                    <h4 className={`font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-800'} mb-2`}>Analysis:</h4>
                    <p className={`${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>**Justification:** {currentScenario.explanation}</p>
                </div>
            )}
            
            <div className="text-center">
                <button onClick={nextScenario} disabled={!showResult} className={`px-6 py-3 ${showResult ? `${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white` : `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`} rounded-lg transition-colors`}>
                    {currentIndex + 1 < currentScenarios.length ? 'Next Scenario' : 'Finish Round'}
                </button>
            </div>
        </div>
    );
};


// 5. Spot Bias Game (5 problems per round)
const SpotBiasGame = ({ darkMode, updateLifetimeScore }) => {
    const [currentProblems, setCurrentProblems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [roundComplete, setRoundComplete] = useState(false);

    const biasTypes = ["Selection/Sampling Bias", "Underrepresentation/Demographic Bias", "Historical/Pre-existing Bias", "Labeling/Annotation Bias", "Proxy Bias (Feature Selection)", "Measurement Bias"];

    const loadNewRound = () => {
        const problems = getRandomitems(biasData, 5);
        setCurrentProblems(problems);
        setCurrentIndex(0);
        setSelectedChoice(null);
        setShowResult(false);
        setRoundComplete(false);
        setScore(0);
    };

    useEffect(() => {
        if (biasData.length > 0) loadNewRound();
    }, []);

    const currentProblem = currentProblems[currentIndex];

    const handleChoice = (choice) => {
        if (showResult) return;
        setSelectedChoice(choice);
        setShowResult(true);

        if (choice === currentProblem.biasType) {
            setScore(score + 40);
        }
    };

    const nextProblem = () => {
        if (currentIndex + 1 < currentProblems.length) {
            setCurrentIndex(currentIndex + 1);
            setSelectedChoice(null);
            setShowResult(false);
        } else {
            setRoundComplete(true);
            updateLifetimeScore('spotbias', score);
        }
    };

    if (biasData.length === 0) return <div className="text-red-500">Error: Bias data is missing.</div>;
    if (!currentProblem) return <div>Loading...</div>;
    
    if (roundComplete) {
        return (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 text-center`}>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>Round Complete!</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Final Score: {score} points</p>
                <button onClick={loadNewRound} className={`px-6 py-3 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition-colors`}> Play Again </button>
            </div>
        );
    }

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Spot Bias (Question {currentIndex + 1} of 5)</h2>
                <div className="flex items-center space-x-4">
                    <div className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Score: {score}</div>
                </div>
            </div>
            
            <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
                <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Scenario:</h4>
                <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} leading-relaxed`}>{currentProblem.scenario}</p>
            </div>
            
            <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Identify the primary type of bias present:</h4>
            <div className="space-y-3 mb-6">
                {shuffleArray(biasTypes).map((type, index) => (
                    <button
                        key={index}
                        onClick={() => !showResult && handleChoice(type)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all font-semibold ${
                            showResult
                            ? type === currentProblem.biasType
                                ? `${darkMode ? 'bg-green-900 border-green-600 text-green-200' : 'bg-green-50 border-green-300 text-green-700'}`
                                : selectedChoice === type
                                    ? `${darkMode ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-50 border-red-300 text-red-700'}`
                                    : `${darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'} cursor-not-allowed`
                            : `${darkMode ? 'border-gray-600 hover:bg-gray-700 hover:border-blue-500 text-gray-100' : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-800'}`
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
            
            {showResult && (
                <div className={`${darkMode ? 'bg-yellow-900 border-yellow-600' : 'bg-yellow-50 border-yellow-400'} border-l-4 p-4 mb-6`}>
                    <h4 className={`font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-800'} mb-2`}>Result: {selectedChoice === currentProblem.biasType ? 'Correct!' : 'Incorrect.'}</h4>
                    <p className={`${darkMode ? 'text-green-200' : 'text-green-700'} mb-2`}><strong>Correct Bias:</strong> {currentProblem.biasType}</p>
                    <p className={`${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}><strong>Why:</strong> {currentProblem.explanation}</p>
                </div>
            )}
            
            <div className="text-center">
                <button onClick={nextProblem} disabled={!showResult} className={`px-6 py-3 ${showResult ? `${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white` : `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`} rounded-lg transition-colors`}>
                    {currentIndex + 1 < currentProblems.length ? 'Next Scenario' : 'Finish Round'}
                </button>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT: AlGamesSection ---

const AlGamesSection = () => {
    const [currentGame, setCurrentGame] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const updateLifetimeScore = () => {};
    const toggleDarkMode = () => { setDarkMode(!darkMode); };

    
    const renderCurrentGame = () => {
        const bgClass = darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100';
        
        switch(currentGame) {
            case 'dragdrop':
                return <PlaceholderGame game="Drag & Drop Matching" darkMode={darkMode} updateLifetimeScore={updateLifetimeScore} />;
            case 'truefalse':
                return <PlaceholderGame game="True/False Lightning" darkMode={darkMode} updateLifetimeScore={updateLifetimeScore} />;
            case 'debugging':
                return <PlaceholderGame game="Code Debugging" darkMode={darkMode} updateLifetimeScore={updateLifetimeScore} />;
            case 'performance':
                return (
                    <div className={`min-h-screen ${bgClass} p-8`}>
                        <div className="max-w-7xl mx-auto">
                            <BackButton onClick={() => setCurrentGame(null)} />
                            <PerformanceTuningGame darkMode={darkMode} updateLifetimeScore={updateLifetimeScore} />
                        </div>
                    </div>
                );
            case 'architecture':
                return (
                    <div className={`min-h-screen ${bgClass} p-8`}>
                        <div className="max-w-7xl mx-auto">
                            <BackButton onClick={() => setCurrentGame(null)} />
                            <ArchitectureBuilderGame darkMode={darkMode} updateLifetimeScore={updateLifetimeScore} />
                        </div>
                    </div>
                );
            case 'memory':
                return (
                    <div className={`min-h-screen ${bgClass} p-8`}>
                        <div className="max-w-7xl mx-auto">
                            <BackButton onClick={() => setCurrentGame(null)} />
                            <MemoryMatchGame darkMode={darkMode} updateLifetimeScore={updateLifetimeScore} />
                        </div>
                    </div>
                );
            case 'scenario':
                return (
                    <div className={`min-h-screen ${bgClass} p-8`}>
                        <div className="max-w-7xl mx-auto">
                            <BackButton onClick={() => setCurrentGame(null)} />
                            <ScenarioGame darkMode={darkMode} updateLifetimeScore={updateLifetimeScore} />
                        </div>
                    </div>
                );
            case 'spotbias':
                return (
                    <div className={`min-h-screen ${bgClass} p-8`}>
                        <div className="max-w-7xl mx-auto">
                            <BackButton onClick={() => setCurrentGame(null)} />
                            <SpotBiasGame darkMode={darkMode} updateLifetimeScore={updateLifetimeScore} />
                        </div>
                    </div>
                );
            default:
                return (
                    <div className={`min-h-screen ${bgClass} p-8`}>
                        <div className="max-w-7xl mx-auto">
                            <div className="flex justify-end items-center mb-6">
                                <button onClick={toggleDarkMode} className={`p-3 rounded-lg transition-colors ${ darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-white hover:bg-gray-100 text-gray-800' } shadow-lg`}>
                                    {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                                </button>
                            </div>
                            <h1 className={`text-4xl font-extrabold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>AI & ML Games</h1>
                            <p className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Test your knowledge and skills in Artificial Intelligence, Machine Learning, and Deep Learning.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                <GameCard icon={Target} title="Drag & Drop Matching" description="Match AI terms with their definitions." onClick={() => setCurrentGame('dragdrop')} color="border-l-blue-500" />
                                <GameCard icon={Clock} title="True/False Lightning" description="Quick-fire True/False questions." onClick={() => setCurrentGame('truefalse')} color="border-l-red-500" />
                                <GameCard icon={BookOpen} title="Memory Match" description="Flip cards to match AI concepts." onClick={() => setCurrentGame('memory')} color="border-l-yellow-500" /> 
                                <GameCard icon={Cpu} title="AI Scenarios (Concept Puzzle)" description="Make ethical decisions in realistic AI development situations." onClick={() => setCurrentGame('scenario')} color="border-l-indigo-500" /> 
                                <GameCard icon={AlertTriangle} title="Spot Bias" description="Identify the source and type of bias in flawed AI systems." onClick={() => setCurrentGame('spotbias')} color="border-l-purple-500" />
                                <GameCard icon={Code} title="Code Debugging" description="Find and fix bugs in AI/ML code snippets." onClick={() => setCurrentGame('debugging')} color="border-l-pink-500" />
                                <GameCard icon={Zap} title="Performance Tuning" description="Optimize AI model performance through strategic improvements." onClick={() => setCurrentGame('performance')} color="border-l-orange-500" /> 
                                <GameCard icon={Layers} title="Architecture Builder" description="Design neural networks by selecting and arranging components." onClick={() => setCurrentGame('architecture')} color="border-l-teal-500" />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
            {renderCurrentGame()}
        </div>
    );
};

export default AlGamesSection;
