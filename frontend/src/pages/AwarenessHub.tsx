import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Lock, Fingerprint, Eye, Shield, Gamepad2,
  Search, AlertTriangle, X, CheckCircle, XCircle
} from 'lucide-react';

// --- ENHANCED TYPES FOR MULTI-STAGE LEARNING ---

type Quiz = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

type LearningModule = {
  info: {
    title: string;
    summary: string;
    points: { title: string; detail: string }[];
  };
  quiz: Quiz;
};

type Resource = {
  id: number;
  title: string;
  category: 'AI Basics' | 'Privacy & Data' | 'AI Threats' | 'Digital Safety' | 'Interactive Scenarios';
  teaser: string;
  icon: React.ElementType;
  color: string;
  finalAction: string;
  learningModules: LearningModule[];
};

// --- COMPLETELY REWORKED CONTENT WITH ALL 6 TOPICS AND MULTIPLE MODULES ---

const topics: Resource[] = [
  {
    id: 1,
    title: "What is AI, Really?",
    category: "AI Basics",
    teaser: "It's not just robots. Discover the invisible intelligence you use every single day.",
    icon: Brain,
    color: "from-blue-500 to-purple-600",
    finalAction: "You've got the basics! Now, start noticing the AI around you and think critically about how it helps or influences you.",
    learningModules: [
      {
        info: {
          title: "Module 1: AI in Your Pocket",
          summary: "Artificial Intelligence teaches computers to perform tasks that normally require human intelligence. You use it constantly without even realizing it.",
          points: [
            { title: "Navigation", detail: "Google Maps predicts traffic and finds the fastest route by analyzing data from millions of users." },
            { title: "Entertainment", detail: "Netflix and Spotify learn your taste to suggest movies and music you'll probably love." },
            { title: "Communication", detail: "Spam filters in your email automatically catch junk mail before you see it." }
          ]
        },
        quiz: {
          question: "Based on the info, which of these is a direct use of AI?",
          options: ["A simple calculator app", "Netflix recommending a new show", "A basic digital clock"],
          correctAnswerIndex: 1,
          explanation: "Recommendation engines like Netflix's are a classic example of AI learning from your past behavior to predict future preferences."
        }
      },
      {
        info: {
          title: "Module 2: Myths vs. Facts",
          summary: "Let's clear up some common misconceptions about Artificial Intelligence.",
          points: [
            { title: "Myth: AI is 'conscious' or 'thinks' like a human.", detail: "Fact: AI today is a tool that recognizes patterns in data. It doesn't have feelings, consciousness, or self-awareness." },
            { title: "Myth: AI is always objective and unbiased.", detail: "Fact: AI systems can inherit biases from the data they are trained on, sometimes leading to unfair or discriminatory outcomes." }
          ]
        },
        quiz: {
          question: "If an AI system is found to be biased, what is the most likely cause?",
          options: ["The AI developed its own opinions", "It was trained on biased data", "A computer virus infected it"],
          correctAnswerIndex: 1,
          explanation: "Bias in AI almost always originates from the data it learned from. 'Garbage in, garbage out' is a fundamental concept."
        }
      }
    ]
  },
  {
    id: 2,
    title: "AI & Your Privacy",
    category: "Privacy & Data",
    teaser: "Your data is the new gold. Learn who's mining it and how to protect your treasure.",
    icon: Lock,
    color: "from-red-500 to-pink-600",
    finalAction: "You are now more aware of the data you generate. Use your app permissions and privacy settings to take control!",
    learningModules: [
      {
        info: {
          title: "Module 1: The Data Trail",
          summary: "Every action you take online creates a digital footprint. AI systems use this trail to learn about you.",
          points: [
            { title: "What They Collect", detail: "Apps and sites can log your clicks, searches, watch history, location, and even listen for keywords from your microphone." },
            { title: "Why They Collect It", detail: "Companies use this data to sell highly targeted ads, improve their products, and understand consumer behavior on a massive scale." }
          ]
        },
        quiz: {
          question: "What is the primary reason companies collect user data for their AI?",
          options: ["To help law enforcement", "To sell targeted advertising and improve services", "To use up storage space"],
          correctAnswerIndex: 1,
          explanation: "Data is incredibly valuable for advertising and making products more engaging, which in turn generates more revenue."
        }
      },
      {
        info: {
          title: "Module 2: The Risks of Oversharing",
          summary: "Sharing too much information, even unintentionally, can have serious consequences.",
          points: [
            { title: "Manipulation", detail: "Detailed profiles allow platforms to show you content designed to influence your mood, opinions, and purchasing decisions." },
            { title: "Security Breaches", detail: "The more of your data a company stores, the more you stand to lose if that company gets hacked." },
            { title: "Your Control Panel", detail: "You have the power to limit this. Regularly check app permissions and disable access to your microphone, contacts, or location if it's not needed." }
          ]
        },
        quiz: {
          question: "What is the best first step to limit an app's data collection?",
          options: ["Deleting the app", "Turning off your phone", "Reviewing and restricting its permissions in your phone's settings"],
          correctAnswerIndex: 2,
          explanation: "Your phone's settings give you granular control over what each app is allowed to access. It's your most powerful tool for privacy."
        }
      }
    ]
  },
  {
    id: 3,
    title: "Protecting Your Digital ID (PII)",
    category: "Privacy & Data",
    teaser: "PII is your personal fingerprint online. Learn what it is and why it's crucial to keep it safe.",
    icon: Fingerprint,
    color: "from-teal-500 to-cyan-600",
    finalAction: "You're now a PII protector! By treating your personal data like the valuable asset it is, you've taken a huge step in securing your digital life.",
    learningModules: [
      {
        info: {
          title: "Module 1: What is PII?",
          summary: "Personally Identifiable Information (PII) is any data that can be used to directly or indirectly identify you.",
          points: [
            { title: "Direct PII", detail: "This is obvious data: Your full name, email (john.smith@work.com), phone number (555-5678), address, or Passport/Aadhaar number." },
            { title: "Indirect PII", detail: "These are pieces of data that can be combined to identify you, like your date of birth, geolocation, or IP address." }
          ]
        },
        quiz: {
          question: "Which of these is generally NOT considered PII?",
          options: ["Your email address", "Your favorite color", "Your phone number", "Your passport ID"],
          correctAnswerIndex: 1,
          explanation: "Your favorite color is a preference and is not unique enough to identify you, unlike your email or passport number."
        }
      },
      {
        info: {
          title: "Module 2: Why PII Matters",
          summary: "In the wrong hands, your PII can be a powerful weapon against you.",
          points: [
            { title: "Identity Theft", detail: "Scammers use stolen PII to open bank accounts, take out loans, or commit crimes in your name." },
            { title: "Data Markets", detail: "Your PII can be packaged and sold on the dark web to other criminals or malicious advertisers." },
            { title: "AI Misuse", detail: "Leaked data can be used to train AI models for malicious purposes, such as creating more convincing scams." }
          ]
        },
        quiz: {
          question: "What is the primary risk of your PII being sold on the dark web?",
          options: ["You might get more spam emails", "It could be used for identity theft", "Your computer will slow down"],
          correctAnswerIndex: 1,
          explanation: "While more spam is a possibility, the most severe risk is identity theft, where criminals impersonate you for financial gain."
        }
      }
    ]
  },
  {
    id: 4,
    title: "The Rise of AI Threats",
    category: "AI Threats",
    teaser: "Seeing isn't believing anymore. Learn to spot the digital ghosts in the machine.",
    icon: Eye,
    color: "from-orange-500 to-red-600",
    finalAction: "You are now aware of the most common AI threats. Remember to always think critically and verify information.",
    learningModules: [
      {
        info: {
          title: "Module 1: The New Wave of Fakes",
          summary: "Malicious actors are using AI to create sophisticated scams and spread misinformation at an unprecedented scale.",
          points: [
            { title: "Deepfakes", detail: "AI can generate realistic but entirely fake videos or images to defame individuals or spread false narratives." },
            { title: "Voice Cloning", detail: "Scammers can use a few seconds of someone's voice from social media to clone it and make fake emergency calls asking for money." }
          ]
        },
        quiz: {
          question: "What is a 'deepfake'?",
          options: ["A very deep secret", "An AI-generated fake video or image", "A type of computer virus"],
          correctAnswerIndex: 1,
          explanation: "Deepfakes are synthetic media created by AI, and they are becoming increasingly difficult to distinguish from reality."
        }
      },
      {
        info: {
          title: "Module 2: Spotting the Deception",
          summary: "While AI fakes are getting better, they're not perfect. A healthy dose of skepticism is your best defense.",
          points: [
            { title: "Look for Flaws", detail: "In videos, look for unnatural eye movements, strange lighting, or awkward lip-syncing." },
            { title: "Question Urgency", detail: "Scammers often create a false sense of emergency. If a message or call demands immediate action and money, be suspicious." },
            { title: "Verify, Verify, Verify", detail: "If you see a shocking video of a public figure, check trusted news sources to see if they are also reporting it." }
          ]
        },
        quiz: {
          question: "A friend calls you in a panic, asking for money to be wired immediately. What should you do first?",
          options: ["Wire the money right away", "Ask them a personal question only they would know", "Hang up and call them back on their known phone number"],
          correctAnswerIndex: 2,
          explanation: "This is the best way to defeat a voice cloning scam. By initiating a new call to a number you trust, you ensure you're speaking to the real person."
        }
      }
    ]
  },
  {
    id: 5,
    title: "Your Digital Self-Defense Kit",
    category: "Digital Safety",
    teaser: "Simple habits can be your strongest shield against complex AI-driven threats.",
    icon: Shield,
    color: "from-green-500 to-lime-600",
    finalAction: "You are now equipped with the essential tools for digital safety. Stay vigilant!",
    learningModules: [
      {
        info: {
          title: "Module 1: The Digital Lock",
          summary: "Your password is the first line of defense. Let's make it a strong one.",
          points: [
            { title: "Password Strength", detail: "A strong password is long (12+ characters), random, and unique to each site. Think 'correct horse battery staple' not 'Password123!'." },
            { title: "Password Managers", detail: "Use a password manager to securely store complex, unique passwords for every service you use. You only have to remember one master password." }
          ]
        },
        quiz: {
          question: "Which of the following is the strongest password?",
          options: ["Summer2024!", "MyDogSparky", "blue-ocean-tree-rocket"],
          correctAnswerIndex: 2,
          explanation: "Long passphrases of random words are significantly harder for computers to guess than common words with simple substitutions."
        }
      },
      {
        info: {
          title: "Module 2: The Digital Deadbolt",
          summary: "Two-Factor Authentication (2FA) is the deadbolt on your digital door.",
          points: [
            { title: "What is 2FA?", detail: "It's a second layer of security that requires you to provide two different types of verification to log in, like your password and a code from your phone." },
            { title: "Why it's Crucial", detail: "Even if a scammer steals your password, they can't access your account without your second factor (your phone)." }
          ]
        },
        quiz: {
          question: "Why is 2FA so effective?",
          options: ["It makes your password longer", "It alerts you to every login attempt", "It requires physical access to your device, which a hacker doesn't have"],
          correctAnswerIndex: 2,
          explanation: "2FA's strength comes from requiring something you know (password) and something you have (your phone), stopping remote attackers in their tracks."
        }
      }
    ]
  },
  {
    id: 6,
    title: "Interactive Scenarios",
    category: "Interactive Scenarios",
    teaser: "Knowledge is power. Put yours to the test with these real-world challenges.",
    icon: Gamepad2,
    color: "from-fuchsia-500 to-pink-600",
    finalAction: "Congratulations! You've successfully navigated these tricky scenarios. Keep this critical mindset as you browse the web.",
    learningModules: [
      {
        info: {
          title: "Scenario 1: The Suspicious Email",
          summary: "You receive an email from 'Netflix Billing' with the subject 'Action Required: Your Account is on Hold'. It looks official and asks you to click a link to update your payment details.",
          points: [
            { title: "The Urgency Trap", detail: "Scammers use threatening language ('account on hold') to make you panic and act without thinking." },
            { title: "The Link Deception", detail: "The link might look real, but it likely leads to a fake phishing site designed to steal your login and credit card info." }
          ]
        },
        quiz: {
          question: "What is the safest action to take?",
          options: [
            "Click the link to verify your details quickly.",
            "Delete the email and ignore it.",
            "Open a new browser tab, go to Netflix.com yourself, and check your account status there."
          ],
          correctAnswerIndex: 2,
          explanation: "Never trust links in unexpected emails. Always navigate to the official website directly to verify any account issues."
        }
      },
      {
        info: {
          title: "Scenario 2: The AI Photo Challenge",
          summary: "You see a photo on social media of a famous landmark covered in snow... in the middle of summer. It looks incredibly real, and people are arguing in the comments.",
          points: [
            { title: "AI Image Generation", detail: "Modern AI can create photorealistic images from a simple text prompt, making it easy to generate believable fake events." },
            { title: "Check for Flaws", detail: "Look closely at details. AI can struggle with hands, text in the background, and the way light interacts with complex surfaces." }
          ]
        },
        quiz: {
          question: "Before sharing this surprising photo, what should you do?",
          options: [
            "Share it immediately because it's interesting.",
            "Check reputable news sources to see if they have reported this unusual weather event.",
            "Assume it's real because it looks so good."
          ],
          correctAnswerIndex: 1,
          explanation: "Verifying information with trusted sources before sharing is the best way to avoid spreading AI-generated misinformation."
        }
      }
    ]
  }
];


// --- REUSABLE SUB-COMPONENTS (NO LOGIC CHANGES) ---

const QuizComponent = ({ quiz, onCorrectAnswer }: { quiz: Quiz; onCorrectAnswer: () => void }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswerClick = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === quiz.correctAnswerIndex) {
      setTimeout(onCorrectAnswer, 1500);
    }
  };

  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600";
    }
    if (index === quiz.correctAnswerIndex) {
      return "bg-green-500 text-white";
    }
    if (index === selectedAnswer) {
      return "bg-red-500 text-white";
    }
    return "bg-slate-100 dark:bg-slate-700 opacity-50";
  };

  return (
    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-3">{quiz.question}</h4>
      <div className="space-y-2">
        {quiz.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(index)}
            className={`w-full text-left p-3 rounded-md transition-all flex items-center text-slate-800 dark:text-slate-200 ${getButtonClass(index)}`}
            disabled={isAnswered}
          >
            {isAnswered && (index === quiz.correctAnswerIndex ? <CheckCircle className="w-5 h-5 mr-2 text-white" /> : (index === selectedAnswer ? <XCircle className="w-5 h-5 mr-2 text-white" /> : <span className="w-5 h-5 mr-2" />))}
            {option}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-slate-200 dark:bg-slate-600 rounded-md"
          >
            <p className="text-sm text-slate-800 dark:text-slate-100">{quiz.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const ResourceCard = ({ resource, onClick }: { resource: Resource; onClick: () => void }) => {
  const IconComponent = resource.icon;
  return (
    <motion.div
      layoutId={`card-${resource.id}`}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col"
    >
      <div className={`h-3 bg-gradient-to-r ${resource.color}`} />
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${resource.color} rounded-xl flex items-center justify-center mr-4 flex-shrink-0`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">{resource.category}</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {resource.title}
            </h3>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm flex-grow">
          {resource.teaser}
        </p>
        <div className="text-right text-sm font-semibold text-blue-600 dark:text-blue-400 mt-4">
          Start Learning &rarr;
        </div>
      </div>
    </motion.div>
  );
};

const ResourceModal = ({ resource, onClose }: { resource: Resource | null; onClose: () => void }) => {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  React.useEffect(() => {
    if (resource) {
      setCurrentModuleIndex(0);
    }
  }, [resource]);

  if (!resource) {
    return null;
  }

  const IconComponent = resource.icon;
  const modules = resource.learningModules;
  const currentModule = modules[currentModuleIndex];
  const isCompleted = currentModuleIndex >= modules.length;

  const handleCorrectAnswer = () => {
    setCurrentModuleIndex(prev => prev + 1);
  };

  return (
    <AnimatePresence>
      {resource && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            layoutId={`card-${resource.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 my-8"
          >
            <div className="p-6 sm:p-8 relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors z-10">
                <X size={24} />
              </button>

              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${resource.color} rounded-xl flex items-center justify-center mr-4 flex-shrink-0`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {resource.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 mb-6">
                {modules.map((_, index) => (
                  <div key={index} className={`h-2 flex-1 rounded-full transition-colors ${index < currentModuleIndex ? `bg-green-500` : (index === currentModuleIndex ? `bg-blue-500` : 'bg-slate-200 dark:bg-slate-700')}`}></div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {!isCompleted ? (
                  <motion.div
                    key={currentModuleIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{currentModule.info.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {currentModule.info.summary}
                    </p>

                    <div className="space-y-4 mb-6">
                      {currentModule.info.points.map((point, index) => (
                        <div key={index} className="flex items-start">
                          <div className={`w-2.5 h-2.5 bg-gradient-to-r ${resource.color} rounded-full mt-1.5 mr-4 flex-shrink-0`}></div>
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100">{point.title}</h4>
                            <p className="text-slate-600 dark:text-slate-400">{point.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <QuizComponent quiz={currentModule.quiz} onCorrectAnswer={handleCorrectAnswer} />

                  </motion.div>
                ) : (
                  <motion.div
                    key="completion"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="text-center p-6 bg-green-50 dark:bg-green-900/50 rounded-lg">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">Topic Completed!</h3>
                      <p className="text-green-700 dark:text-green-300 mt-2">{resource.finalAction}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- MAIN AWARENESS HUB PAGE COMPONENT ---

const AwarenessHub: React.FC = () => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(topics.map(t => t.category)))];

  const filteredTopics = useMemo(() => {
    return topics.filter(topic => {
      const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory;
      const matchesSearch = searchTerm === '' ||
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.teaser.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Awareness Hub
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Your interactive guide to understanding and navigating the world of AI.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="sticky top-0 z-10 py-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-lg mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search topics like 'PII' or 'Deepfakes'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap border ${selectedCategory === category
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <AnimatePresence>
            {filteredTopics.map((topic) => (
              <motion.div
                key={topic.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <ResourceCard
                  resource={topic}
                  onClick={() => setSelectedResource(topic)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center col-span-full mt-10">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">No Topics Found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filter.</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg max-w-4xl mx-auto border border-slate-200 dark:border-slate-700"
        >
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Stay Vigilant & Curious
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            AI is a powerful tool that's constantly evolving. The best way to stay safe is to stay informed and always think critically about the technology you use.
          </p>
        </motion.div>
      </div>

      <ResourceModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
      />
    </div>
  );
};

export default AwarenessHub;