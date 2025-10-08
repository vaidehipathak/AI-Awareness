// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock, Trophy, Brain, Target, Eye, BookOpen, Cpu, Moon, Sun, Zap, Layers, Code, AlertTriangle } from 'lucide-react';

// --- UTILITY FUNCTIONS (Needed for game logic) ---
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

// --- DATA (Conceptual placeholders) ---
const dragDropData = [];
const trueFalseData = [];
const debuggingData = [];
const performanceData = [];
const architectureData = [];

// NEW DATA FOR SPOT BIAS (sample)
const biasData = [
  { scenario: "A loan approval AI trained only on data from affluent neighborhoods denies applicants from low-income areas at a higher rate.", biasType: "Selection/Sampling Bias", explanation: "The training data (sampling) does not represent the full population, leading to skewed outcomes." },
  { scenario: "An image recognition model performs well on light-skinned faces but poorly on dark-skinned faces because the dataset was mainly composed of lighter complexions.", biasType: "Underrepresentation/Demographic Bias", explanation: "The dataset lacks sufficient examples of a specific demographic, resulting in poor performance for that group." },
  { scenario: "A hiring tool rates female candidates lower for engineering roles because historical data showed fewer women in those roles, leading the AI to learn that pattern.", biasType: "Historical/Pre-existing Bias", explanation: "The AI perpetuated societal bias present in the historical data it was trained on." },
  { scenario: "During labeling, human annotators subconsciously used negative terms to describe political posts they disagreed with, which trained the AI to see those posts as inherently negative.", biasType: "Labeling/Annotation Bias", explanation: "Bias was introduced by the human labelers' subjective opinions rather than objective fact." },
  { scenario: "An AI designed to predict health risks uses a feature called 'zip code' which acts as a proxy for socioeconomic status and racial demographics.", biasType: "Proxy Bias (Feature Selection)", explanation: "The 'zip code' feature is correlated with protected attributes, causing the model to discriminate without explicitly using sensitive data." },
];

// DATA FOR AI SCENARIOS (sample)
const scenarioData = [
  { scenario: "You are the CEO of a company launching facial recognition software. The initial tests show a 15% higher error rate for people of color. Do you:", options: ["Launch immediately and fix it later (gain market share)", "Delay the launch until the error rate is equitable", "Add a disclaimer about the error rate and launch"], bestChoice: 1, explanation: "Ethical choice is to delay the launch. Deploying technology known to harm one demographic disproportionately is a violation of fairness and equity principles." },
];

// --- BASIC UI/COMPONENT STUBS to ensure the page compiles ---
const BackButton = ({ onClick }) => (
  <button onClick={onClick} className="mb-6 inline-flex items-center text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100">
    <ChevronRight className="mr-2 rotate-180" size={18} /> Back
  </button>
);

const GameCard = ({ icon: Icon, title, description, onClick, color }) => (
  <button onClick={onClick} className={`text-left bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg border-l-4 ${color} p-5 transition`}> 
    <div className="flex items-start space-x-4">
      <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700">
        <Icon className="w-6 h-6 text-gray-800 dark:text-gray-100" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
      </div>
    </div>
  </button>
);

// Minimal placeholder game components
const PlaceholderPanel = ({ title, children }) => (
  <div className="rounded-xl shadow-lg p-8 bg-white dark:bg-gray-800">
    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>
    <div className="text-gray-700 dark:text-gray-300">{children}</div>
  </div>
);

const MemoryMatchGame = ({ darkMode, updateLifetimeScore }) => (
  <PlaceholderPanel title="Memory Match">
    Flip cards to match AI concepts. (Placeholder)
  </PlaceholderPanel>
);

const ArchitectureBuilderGame = ({ darkMode, updateLifetimeScore }) => (
  <PlaceholderPanel title="Architecture Builder">
    Design neural networks by selecting components. (Placeholder)
  </PlaceholderPanel>
);

const PerformanceTuningGame = ({ darkMode, updateLifetimeScore }) => (
  <PlaceholderPanel title="Performance Tuning">
    Optimize model performance through improvements. (Placeholder)
  </PlaceholderPanel>
);

const DragDropGame = ({ darkMode, updateLifetimeScore }) => (
  <PlaceholderPanel title="Drag & Drop Matching">
    Match AI terms with definitions. (Placeholder)
  </PlaceholderPanel>
);

const TrueFalseGame = ({ darkMode, updateLifetimeScore }) => (
  <PlaceholderPanel title="True/False Lightning">
    Quick-fire true/false questions. (Placeholder)
  </PlaceholderPanel>
);

const CodeDebuggingGame = ({ darkMode, updateLifetimeScore }) => (
  <PlaceholderPanel title="Code Debugging">
    Find and fix bugs in code snippets. (Placeholder)
  </PlaceholderPanel>
);

// --- NEW GAME COMPONENTS ---

// NEW: Spot Bias Game (5 questions per round)
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
    loadNewRound();
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
            className={`w-full text-left p-4 rounded-lg border-2 transition-all text-sm font-medium ${
              showResult
                ? type === currentProblem.biasType
                  ? `${darkMode ? 'bg-green-900 border-green-600 text-green-200' : 'bg-green-50 border-green-300 text-green-700'}`
                  : selectedChoice === type
                    ? `${darkMode ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-50 border-red-300 text-red-700'}`
                    : `${darkMode ? 'bg-gray-700 border-gray-600 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-500'} cursor-not-allowed`
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

// MODIFIED: AI Scenarios Game (Using the 5-question per round structure)
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
    loadNewRound();
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
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              showResult
                ? index === currentScenario.bestChoice
                  ? `${darkMode ? 'bg-green-900 border-green-600 text-green-200' : 'bg-green-50 border-green-300 text-green-700'}`
                  : selectedChoice === index
                    ? `${darkMode ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-50 border-red-300 text-red-700'}`
                    : `${darkMode ? 'bg-gray-700 border-gray-600 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-500'} cursor-not-allowed`
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

// --- MAIN COMPONENT: AlGamesSection ---
const AlGamesSection = () => {
  const [currentGame, setCurrentGame] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const updateLifetimeScore = () => {};
  const toggleDarkMode = () => { setDarkMode(!darkMode); };

  const renderCurrentGame = () => {
    const bgClass = darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100';

    const PlaceholderGame = ({ game, component }) => (
      <div className={`min-h-screen ${bgClass} p-8`}>
        <div className="max-w-7xl mx-auto">
          <BackButton onClick={() => setCurrentGame(null)} />
          {component}
          <p className={`${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Placeholder for {game} content. Text is now dark mode styled.</p>
        </div>
      </div>
    );

    switch(currentGame) {
      case 'dragdrop':
        return <PlaceholderGame game="Drag & Drop Matching" component={<DragDropGame darkMode={darkMode} updateLifetimeScore={updateLifetimeScore} />} />;
      case 'truefalse':
        return <PlaceholderGame game="True/False Lightning" component={<TrueFalseGame darkMode={darkMode} updateLifetimeScore={updateLifetimeScore} />} />;
      case 'debugging':
        return <PlaceholderGame game="Code Debugging" component={<CodeDebuggingGame darkMode={darkMode} updateLifetimeScore={updateLifetimeScore} />} />;
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