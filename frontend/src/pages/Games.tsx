import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTheme } from 'next-themes';
import {
  Clock, Trophy, Target, Eye, Zap, Lock, Play, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

import { useAuth } from '../contexts/AuthContext';
import AdminActionButtons from '../components/admin/AdminActionButtons';
import ContentEditModal from '../components/admin/ContentEditModal';
import BackButton from '../components/BackButton';
import GamificationDashboard from '../components/games/GamificationDashboard';

// Complex Game Components
import DeepfakeDetector from '../components/games/DeepfakeDetector';
import BiasSpotter from '../components/games/BiasSpotter';
import PhishingSorter from '../components/games/PhishingSorter';

/* ---------------- STATIC FALLBACK DATA ---------------- */
// Ensures games are always playable even if API fails

const FALLBACK_TF_DATA = [
  { question: "AI can feel human emotions.", answer: false },
  { question: "Deep learning is a subset of Machine Learning.", answer: true },
  { question: "All AI requires the internet to function.", answer: false },
  { question: "GPT stands for Generative Pre-trained Transformer.", answer: true },
  { question: "Machine Learning models never make mistakes.", answer: false },
  { question: "AI bias comes from the data it is trained on.", answer: true },
  { question: "Siri and Alexa are examples of Narrow AI.", answer: true },
  { question: "AI can legally hold a copyright in the US.", answer: false }
];

const FALLBACK_DEEPFAKE_DATA = {
  rounds: [
    {
      image_a: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=600",
      image_b: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=600&h=600&blur=2", // Simulate slight blur/AI feel
      clues: ["Look closely at the hair strands.", "Check for asymmetry in the earrings.", "Examine the background texture."],
      correct_answer: "b", // Assuming B is the 'fake' one for this simulation
      explanation: "Image B shows subtle blurring in the background and unnatural hair blending, common artifacts in AI generation."
    },
    {
      image_a: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=600",
      image_b: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?auto=format&fit=crop&q=80&w=600&h=600",
      clues: ["Check the teeth alignment.", "Look at the lighting on the face.", "Are the glasses symmetrical?"],
      correct_answer: "b",
      explanation: "The lighting on the subject's face in Image B doesn't consistently match the background light source."
    }
  ]
};

const FALLBACK_BIAS_DATA = {
  scenarios: [
    {
      title: "Hiring Algorithm",
      ai_decision: "Resume Rejected: 'Captain of Women's Chess Club'",
      visible_data: ["GPA: 3.9", "Experience: 4 years", "Skills: Python, Java"],
      hidden_data: [
        { clue: "Training data was 85% male resumes.", is_bias: true },
        { clue: "The role requires 5 years experience.", is_bias: false },
        { clue: "The model penalizes the word 'Women's'.", is_bias: true },
        { clue: "The applicant lacks a specific requested certification.", is_bias: false }
      ],
      bias_type: "Gender Bias / Selection Bias"
    },
    {
      title: "Loan Approval System",
      ai_decision: "Loan Denied: Applicant D",
      visible_data: ["Income: $80,000", "Credit Score: 720", "Debt: Low"],
      hidden_data: [
        { clue: "Model uses zip code as a risk proxy.", is_bias: true },
        { clue: "Applicant has a recent bankruptcy explicitly listed.", is_bias: false },
        { clue: "Historically redlined districts are weighted negatively.", is_bias: true },
        { clue: "Debt-to-income ratio is actually acceptable.", is_bias: true }
      ],
      bias_type: "Socioeconomic Bias / Redlining"
    }
  ]
};

const FALLBACK_PHISHING_DATA = {
  emails: [
    {
      sender: "security@paypa1-support.com",
      subject: "URGENT: Your account has been suspended!",
      body: "Dear User,\n\nWe noticed suspicious activity on your account. Please click the link below to verify your identity within 24 hours or your account will be permanently closed.\n\n[Verify Now]",
      headers: { from: "security@paypa1-support.com", reply_to: "no-reply@paypa1.com" },
      red_flags: ["Mispelled domain (paypa1)", "Urgent threat", "Generic greeting"],
      is_phishing: true
    },
    {
      sender: "newsletter@techweekly.io",
      subject: "This Week in AI: New breakthroughs",
      body: "Hi Jane,\n\nHere are the top stories in Artificial Intelligence this week...\n\nRead more on our blog.",
      headers: { from: "newsletter@techweekly.io", reply_to: "newsletter@techweekly.io" },
      red_flags: [],
      is_phishing: false
    },
    {
      sender: "hr-department@company-intranet.net",
      subject: "Update your direct deposit info",
      body: "Please log in to the portal to update your banking information for the upcoming payroll cycle.",
      headers: { from: "hr-department@company-intranet.net", reply_to: "hr-admin@gmail.com" },
      red_flags: [" mismatched reply-to", "asking for sensitive info via email link"],
      is_phishing: true
    }
  ]
};


const GamesPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  // --- INTERNAL TRUE/FALSE GAME ---
  const TrueFalseGame: React.FC = () => {
    const [questions, setQuestions] = useState<any[]>(FALLBACK_TF_DATA);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameActive, setGameActive] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const timerRef = useRef<any>(null);

    useEffect(() => {
      // Shuffle fallback data on load
      setQuestions([...FALLBACK_TF_DATA].sort(() => Math.random() - 0.5));
    }, []);

    useEffect(() => {
      if (gameActive && timeLeft > 0) {
        timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      } else if (timeLeft === 0 && gameActive) {
        endGame();
      }
      return () => clearTimeout(timerRef.current);
    }, [timeLeft, gameActive]);

    const startGame = () => {
      setCurrentIndex(0);
      setScore(0);
      setTimeLeft(30);
      setGameActive(true);
      setGameComplete(false);
      setAnswered(false);
      setIsCorrect(null);
    };

    const endGame = () => {
      setGameActive(false);
      setGameComplete(true);
      if (score > 50) confetti({ spread: 70, origin: { y: 0.6 } });
    };

    const handleAnswer = (ans: boolean) => {
      if (answered) return;
      setAnswered(true);
      const correct = ans === questions[currentIndex].answer;
      setIsCorrect(correct);

      if (correct) setScore(s => s + 20); // Simple scoring

      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(i => i + 1);
          setAnswered(false);
          setIsCorrect(null);
        } else {
          endGame();
        }
      }, 1000);
    };

    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 max-w-2xl mx-auto`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Lightning Round</h2>
          {gameActive && <div className="text-xl font-bold text-red-500">{timeLeft}s</div>}
        </div>

        {!gameActive && !gameComplete ? (
          <div className="text-center py-8">
            <Zap className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-lg mb-6">Answer as many as you can!</p>
            <button onClick={startGame} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold">Start</button>
          </div>
        ) : gameComplete ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Time's Up!</h3>
            <p className="text-xl mb-4">Score: {score}</p>
            <button onClick={startGame} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Retry</button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-8 p-6 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <h3 className="text-xl font-bold">{questions[currentIndex].question}</h3>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleAnswer(true)}
                disabled={answered}
                className={`px-8 py-4 rounded-xl font-bold text-white transition-transform hover:scale-105 ${answered && isCorrect ? 'bg-green-500' : 'bg-green-600'}`}
              >
                TRUE
              </button>
              <button
                onClick={() => handleAnswer(false)}
                disabled={answered}
                className={`px-8 py-4 rounded-xl font-bold text-white transition-transform hover:scale-105 ${answered && !isCorrect ? 'bg-red-500' : 'bg-red-600'}`}
              >
                FALSE
              </button>
            </div>
            {answered && (
              <div className={`mt-4 font-bold text-lg ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ---------------- MAIN RENDER ---------------- */

  const GameCard = ({ icon: Icon, title, description, onClick, color }: any) => (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer rounded-2xl p-6 h-full border-l-4 ${color} ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} shadow-lg transition-all`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10"><Icon size={100} /></div>
      <div className="relative z-10 flex flex-col h-full">
        <div className={`p-3 w-fit rounded-xl mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}><Icon size={32} /></div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 flex-grow">{description}</p>
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-indigo-500 font-bold text-sm">
          Play Now <Play size={16} />
        </div>
      </div>
    </motion.div>
  );

  if (user?.role === 'ADMIN' && !currentGame) {
    // Basic Admin view placeholder or link to full dashboard
    return (
      <div className="min-h-screen p-8 text-center text-gray-500">
        Admin Game Management available in Dashboard.
      </div>
    );
  }

  if (currentGame) {
    const bgClass = darkMode ? 'bg-gray-900' : 'bg-slate-50';
    let GameComponent = null;

    switch (currentGame) {
      case 'truefalse':
        GameComponent = <TrueFalseGame />;
        break;
      case 'deepfake':
        // Pass fallback data directly
        GameComponent = <DeepfakeDetector data={FALLBACK_DEEPFAKE_DATA} />;
        break;
      case 'bias-spotter':
        GameComponent = <BiasSpotter data={FALLBACK_BIAS_DATA} />;
        break;
      case 'phishing':
        GameComponent = <PhishingSorter data={FALLBACK_PHISHING_DATA} />;
        break;
      default:
        GameComponent = <div>Game Not Found</div>;
    }

    return (
      <div className={`min-h-screen ${bgClass} p-8`}>
        <div className="max-w-6xl mx-auto">
          <BackButton onClick={() => setCurrentGame(null)} />
          {GameComponent}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} p-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Learning Games</h1>
          <p className="text-xl text-gray-500">Master AI concepts with these interactive challenges.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <GameCard
            icon={Clock}
            title="True/False Lightning"
            description="Quick-fire questions to test your AI knowledge under pressure."
            onClick={() => setCurrentGame('truefalse')}
            color="border-l-red-500"
          />
          <GameCard
            icon={Eye}
            title="Deepfake Detective"
            description="Can you spot the difference? Identify AI-generated images."
            onClick={() => setCurrentGame('deepfake')}
            color="border-l-purple-600"
          />
          <GameCard
            icon={Target}
            title="Bias Investigation"
            description="Uncover hidden biases in AI decision making systems."
            onClick={() => setCurrentGame('bias-spotter')}
            color="border-l-orange-500"
          />
          <GameCard
            icon={Zap}
            title="Phishing Sorter"
            description="Sort legitimate emails from malicious phishing attempts."
            onClick={() => setCurrentGame('phishing')}
            color="border-l-cyan-500"
          />
        </div>

        <GamificationDashboard />
      </div>
    </div>
  );
};

export default GamesPage;