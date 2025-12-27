import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Lock, Fingerprint, Eye, Shield, Gamepad2,
  Search, AlertTriangle, X, CheckCircle, XCircle, RotateCcw, Lightbulb, Zap
} from 'lucide-react';

// --- DATA STRUCTURES & CONTENT (Source of Truth) ---

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
          summary: "Artificial Intelligence teaches computers to perform tasks that normally require human intelligence. You use it every day, often without realizing it.",
          points: [
            { title: "Navigation", detail: "🚗 Google Maps predicts traffic and suggests the fastest route by analyzing millions of data points in real time." },
            { title: "Entertainment", detail: "🎬 Netflix and Spotify learn your tastes to recommend shows, movies, and music you’re likely to love." },
            { title: "Communication", detail: "📧 Spam filters automatically block junk mail so your inbox stays clean." }
          ]
        },
        quiz: {
          question: "Based on the info, which of these is a direct use of AI?",
          options: ["A simple calculator app", "Netflix recommending a new show", "A basic digital clock"],
          correctAnswerIndex: 1,
          explanation: "Recommendation engines are a classic example of AI learning from your past behavior to predict your future preferences."
        }
      },
      {
        info: {
          title: "Module 2: Myths vs. Facts",
          summary: "Let’s bust some common misconceptions about AI.",
          points: [
            { title: "Myth: AI is “conscious” or “thinks” like a human.", detail: "Fact: AI is just a tool that finds patterns in data. It has no emotions, no self-awareness." },
            { title: "Myth: AI is always objective and fair.", detail: "Fact: AI can inherit human bias if trained on biased data." }
          ]
        },
        quiz: {
          question: "If an AI system is biased, what’s the most likely reason?",
          options: ["The AI developed its own opinions", "It was trained on biased data", "A computer virus infected it"],
          correctAnswerIndex: 1,
          explanation: "Bias in AI almost always originates from the data it learned from. The principle 'garbage in, garbage out' is key here."
        }
      },
      {
        info: {
          title: "Module 3: Everyday AI Helpers",
          summary: "AI is not science fiction — it’s already built into the devices you use daily.",
          points: [
            { title: "Phone Camera", detail: "📱 Your phone camera uses AI to improve photos and detect faces." },
            { title: "Predictive Text", detail: "📝 Predictive text suggests words while you type." },
            { title: "Voice Assistants", detail: "🗣️ Voice assistants like Siri or Alexa understand commands using AI." }
          ]
        },
        quiz: {
          question: "Which of these is NOT an example of AI?",
          options: ["A traditional landline telephone", "Predictive text on your phone", "Siri setting a reminder"],
          correctAnswerIndex: 0,
          explanation: "A traditional landline is an analog device and doesn't have the computational power or programming for AI, unlike modern smartphones."
        }
      },
      {
        info: {
          title: "Module 4: The Power & Limits of AI",
          summary: "AI is powerful, but it also has clear limitations.",
          points: [
            { title: "Strengths", detail: "✅ Processes huge amounts of data quickly, recognizes patterns humans might miss, and automates repetitive tasks." },
            { title: "Limits", detail: "❌ Cannot think or feel like a human, needs quality data to work well, and can make mistakes in unfamiliar situations." }
          ]
        },
        quiz: {
          question: "Which of these is a limitation of AI?",
          options: ["It can process large datasets", "It automates tasks", "It cannot think or feel like humans"],
          correctAnswerIndex: 2,
          explanation: "AI lacks genuine consciousness, emotions, and understanding, which are fundamental human traits and a key limitation of the technology today."
        }
      },
      {
        info: {
          title: "Module 5: AI Around the World",
          summary: "AI is shaping industries everywhere:",
          points: [
            { title: "Healthcare", detail: "🏥 AI scans medical images for early disease detection." },
            { title: "Finance", detail: "💰 AI monitors fraud and suggests investment strategies." },
            { title: "Transport", detail: "🚗 Self-driving cars use AI to detect objects and navigate." },
            { title: "Education", detail: "📚 Personalized learning platforms adapt to each student’s pace." }
          ]
        },
        quiz: {
          question: "Which of these is a real-world AI application?",
          options: ["A mechanical clock showing time", "A chalkboard in a classroom", "An AI system detecting fraud in online banking"],
          correctAnswerIndex: 2,
          explanation: "Banks use AI to analyze millions of transactions in real-time to spot patterns that indicate fraudulent activity, a task impossible for humans."
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
          title: "Module 1: Data — The Fuel of AI",
          summary: "AI runs on data — your clicks, searches, photos, and even voice commands. The more data AI collects, the better it learns and predicts your behavior.",
          points: [
            { title: "Search History", detail: "Google collects your search history to improve results." },
            { title: "Voice Commands", detail: "Smart assistants like Alexa or Siri record voice commands to respond accurately." },
            { title: "Social Media", detail: "Platforms analyze your posts and likes to show you personalized content." }
          ]
        },
        quiz: {
          question: "What is the main “fuel” that powers AI?",
          options: ["Data", "Electricity", "Hardware only"],
          correctAnswerIndex: 0,
          explanation: "Data is the raw material that AI systems learn from. Without it, they can't make predictions or improvements."
        }
      },
      {
        info: {
          title: "Module 2: The Hidden Trade — Privacy vs. Personalization",
          summary: "AI uses your personal data to offer customized experiences — but that often means giving up some privacy. Every time you get personalized ads or recommendations, AI is analyzing your behavior.",
          points: [
            { title: "Shopping", detail: "Shopping sites suggesting products you recently browsed." },
            { title: "Videos", detail: "YouTube recommending videos based on watch history." },
            { title: "Health", detail: "Fitness apps tracking your location and health stats." }
          ]
        },
        quiz: {
          question: "When AI gives personalized recommendations, what are you often trading?",
          options: ["Speed", "Privacy", "Entertainment"],
          correctAnswerIndex: 1,
          explanation: "To personalize your experience, services need to know about your habits and preferences, which involves collecting your data."
        }
      },
      {
        info: {
          title: "Module 3: Risks — When Data Becomes Dangerous",
          summary: "If your data isn’t protected, it can be misused for identity theft, targeted scams, or unwanted tracking. AI systems sometimes store more data than necessary, creating privacy risks.",
          points: [
            { title: "Data Leaks", detail: "Exposing personal information." },
            { title: "Background Collection", detail: "Apps collecting data without permission." },
            { title: "Facial Recognition", detail: "Used without consent in public spaces." }
          ]
        },
        quiz: {
          question: "Which of these is a privacy risk related to AI?",
          options: ["Unauthorized use of facial recognition", "Watching an online video", "Using airplane mode"],
          correctAnswerIndex: 0,
          explanation: "Using facial recognition without consent is a major privacy violation, as your biometric data is being used without your knowledge."
        }
      },
      {
        info: {
          title: "Module 4: Protecting Yourself in the AI Era",
          summary: "You can enjoy AI safely by understanding how to protect your data. Always check what permissions apps ask for and control what data you share.",
          points: [
            { title: "Limit Permissions", detail: "Turn off microphone and camera access for unnecessary apps." },
            { title: "Review Settings", detail: "Review your privacy settings regularly." },
            { title: "Use Strong Security", detail: "Use strong passwords and two-factor authentication." }
          ]
        },
        quiz: {
          question: "What’s one simple way to protect your privacy when using AI-powered apps?",
          options: ["Limit unnecessary app permissions", "Ignore privacy settings", "Use the same password everywhere"],
          correctAnswerIndex: 0,
          explanation: "If an app doesn't need your location to function, don't give it permission. This is a simple but powerful way to control your data."
        }
      },
      {
        info: {
          title: "Module 5: The Future — Ethical and Transparent AI",
          summary: "The goal is to make AI systems that respect privacy, follow data protection laws, and stay transparent about what they collect. Governments and companies are now focusing on “ethical AI”.",
          points: [
            { title: "Consent", detail: "AI tools asking for consent before data collection." },
            { title: "User Control", detail: "Companies adding “privacy dashboards” for users." },
            { title: "Regulation", detail: "Laws like GDPR ensuring your data rights." }
          ]
        },
        quiz: {
          question: "What is “ethical AI”?",
          options: ["AI that works faster than humans", "AI that respects privacy and fairness", "AI used only in entertainment"],
          correctAnswerIndex: 1,
          explanation: "Ethical AI is about building systems that are not only powerful but also responsible, fair, and transparent in how they operate."
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
          title: "Module 1: What Is PII — Your Digital Identity",
          summary: "PII stands for Personally Identifiable Information — the data that can identify you as a unique individual. Protecting it is crucial because if someone gets this data, they can impersonate you online.",
          points: [
            { title: "Examples", detail: "Your name, address, phone number, Aadhaar, passport, or bank account details, and login credentials." }
          ]
        },
        quiz: {
          question: "Which of these is an example of PII?",
          options: ["Favorite movie", "Aadhaar number", "Type of smartphone"],
          correctAnswerIndex: 1,
          explanation: "An Aadhaar number is a unique government identifier, making it a highly sensitive piece of PII."
        }
      },
      {
        info: {
          title: "Module 2: Why PII Matters",
          summary: "PII is the key to your digital identity — and cybercriminals target it to steal money, open fake accounts, or perform identity theft. Once leaked, it can spread quickly across the internet.",
          points: [
            { title: "Financial Theft", detail: "A hacker uses stolen bank details to make purchases." },
            { title: "Impersonation", detail: "Fake social media profiles created using real names and photos." }
          ]
        },
        quiz: {
          question: "Why is PII valuable to hackers?",
          options: ["To send greetings", "To steal identity or financial data", "To improve search results"],
          correctAnswerIndex: 1,
          explanation: "Hackers can use your PII to impersonate you for financial gain, which is the core of identity theft."
        }
      },
      {
        info: {
          title: "Module 3: Common Ways PII Gets Exposed",
          summary: "PII can leak through careless habits, scavenger security, or untrusted platforms.",
          points: [
            { title: "Public Wi-Fi", detail: "Using public Wi-Fi for banking." },
            { title: "Phishing", detail: "Clicking phishing links or fake websites." },
            { title: "Weak Passwords", detail: "Reusing weak passwords across multiple sites." }
          ]
        },
        quiz: {
          question: "Which action can put your PII at risk?",
          options: ["Logging into bank accounts on public Wi-Fi", "Watching movies online", "Reading news articles"],
          correctAnswerIndex: 0,
          explanation: "Public Wi-Fi is often unsecured, making it easy for hackers on the same network to intercept your data."
        }
      },
      {
        info: {
          title: "Module 4: How to Protect Your PII",
          summary: "You can protect your digital identity with strong habits and security tools.",
          points: [
            { title: "Passwords", detail: "Use strong, unique passwords for every account." },
            { title: "2FA", detail: "Turn on two-factor authentication (2FA)." },
            { title: "Oversharing", detail: "Avoid oversharing on social media." }
          ]
        },
        quiz: {
          question: "Which of these is a good way to protect your PII?",
          options: ["Using one password for all sites", "Ignoring app permissions", "Enabling two-factor authentication"],
          correctAnswerIndex: 2,
          explanation: "2FA adds a critical layer of security, making it much harder for anyone to access your accounts even if they steal your password."
        }
      },
      {
        info: {
          title: "Module 5: The Future of Digital Identity",
          summary: "Governments and companies are developing secure digital ID systems that protect privacy and prevent misuse of data. The future of PII protection depends on awareness + strong cybersecurity laws.",
          points: [
            { title: "Encryption", detail: "Digital IDs that use encryption to protect your information." },
            { title: "Laws", detail: "Privacy laws like India’s DPDP Act or Europe’s GDPR." }
          ]
        },
        quiz: {
          question: "What will make digital identity safer in the future?",
          options: ["Strong privacy laws and encrypted digital IDs", "Sharing data freely", "Using public Wi-Fi"],
          correctAnswerIndex: 0,
          explanation: "A combination of strong technology (encryption) and clear legal protections (privacy laws) is the key to a safer digital future."
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
          title: "Module 1: When Smart Machines Go Wrong",
          summary: "AI can be a powerful tool — but in the wrong hands, it becomes a weapon. Cybercriminals now use AI to automate attacks, create fake content, and exploit weaknesses faster than ever before.",
          points: [
            { title: "Automated Attacks", detail: "Hackers using AI to guess passwords or bypass security." },
            { title: "Fake Content", detail: "Deepfake videos spreading misinformation." }
          ]
        },
        quiz: {
          question: "What makes AI dangerous in cyberattacks?",
          options: ["It works slowly", "It can automate and enhance attacks", "It requires human typing"],
          correctAnswerIndex: 1,
          explanation: "AI's ability to automate attacks on a massive scale is what makes it a significant threat in cybersecurity."
        }
      },
      {
        info: {
          title: "Module 2: Deepfakes — The New Face of Deception",
          summary: "Deepfakes are AI-generated images, videos, or voices that look and sound real but are completely fake. They can be used to spread false information or manipulate public opinion.",
          points: [
            { title: "Examples", detail: "Fake political speeches, scam calls using cloned voices, false evidence." }
          ]
        },
        quiz: {
          question: "What is a “deepfake”?",
          options: ["An AI-generated fake video or voice", "A blurry photo", "A software update"],
          correctAnswerIndex: 0,
          explanation: "Deepfakes are synthetic media created by AI, and they are becoming increasingly difficult to distinguish from reality."
        }
      },
      {
        info: {
          title: "Module 3: AI-Powered Cyberattacks",
          summary: "Attackers use AI to find and exploit system vulnerabilities faster than humans. AI can scan thousands of targets in seconds, making cyberattacks more precise and harder to detect.",
          points: [
            { title: "Examples", detail: "AI bots performing automated password attacks, malware that learns to avoid antivirus detection." }
          ]
        },
        quiz: {
          question: "How do hackers use AI in cyberattacks?",
          options: ["To improve system security", "To automate and personalize attacks", "To fix software bugs"],
          correctAnswerIndex: 1,
          explanation: "AI helps attackers work faster and smarter, automating the process of finding vulnerabilities and crafting personalized scam messages."
        }
      },
      {
        info: {
          title: "Module 4: Privacy and Data Exploitation",
          summary: "AI systems depend on large amounts of personal data — which can be stolen, misused, or sold. When data protection fails, AI can be turned into a surveillance tool.",
          points: [
            { title: "Examples", detail: "Companies tracking user behavior without consent, AI models trained on leaked personal data." }
          ]
        },
        quiz: {
          question: "What is a major privacy concern with AI?",
          options: ["Misuse of personal data for surveillance or profit", "AI forgetting data too quickly", "Using AI in gaming"],
          correctAnswerIndex: 0,
          explanation: "The massive amount of data AI requires creates significant risks if that data is misused for tracking or sold without consent."
        }
      },
      {
        info: {
          title: "Module 5: Defending Against AI Threats",
          summary: "As AI threats rise, cybersecurity must evolve too. We need ethical AI, better detection tools, and strong digital awareness to stay protected.",
          points: [
            { title: "Solutions", detail: "AI-based systems that detect deepfakes, governments enforcing AI safety laws, and users learning to verify digital content." }
          ]
        },
        quiz: {
          question: "How can society fight AI threats?",
          options: ["Ignore them", "Develop ethical AI and public awareness", "Ban all technology"],
          correctAnswerIndex: 1,
          explanation: "A combination of better technology, stronger laws, and more educated users is the best defense against emerging AI threats."
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
          title: "Module 1: Why You Need a Digital Defense Kit",
          summary: "Your digital life — emails, bank accounts, social media — can be attacked anytime. A digital self-defense kit is a set of tools and habits that protect your personal information and online identity.",
          points: [
            { title: "Key Areas", detail: "Protecting your passwords, avoiding phishing scams, and securing your devices from hackers." }
          ]
        },
        quiz: {
          question: "Why is a digital self-defense kit important?",
          options: ["To protect your online identity and data", "To make your phone faster", "To watch more videos"],
          correctAnswerIndex: 0,
          explanation: "Just like in the real world, you need tools and knowledge to protect yourself and your valuable assets online."
        }
      },
      {
        info: {
          title: "Module 2: Strong Passwords and Authentication",
          summary: "Passwords are the first line of defense. Strong, unique passwords plus two-factor authentication (2FA) make it much harder for hackers to access your accounts.",
          points: [
            { title: "Best Practices", detail: "Using a password manager, enabling 2FA on important apps, and avoiding simple passwords." }
          ]
        },
        quiz: {
          question: "Which is the most secure way to protect your accounts?",
          options: ["Strong, unique passwords + 2FA", "Using “password123” for all accounts", "Writing passwords on paper"],
          correctAnswerIndex: 0,
          explanation: "This combination provides two different layers of security, making it extremely difficult for attackers to get in."
        }
      },
      {
        info: {
          title: "Module 3: Safe Browsing and Email Habits",
          summary: "Many attacks happen when you click unsafe links or download malicious files. Being cautious online is essential to stay safe.",
          points: [
            { title: "Key Habits", detail: "Avoid clicking links in suspicious emails, check website URLs before entering sensitive info, and use updated antivirus software." }
          ]
        },
        quiz: {
          question: "Which is a safe online habit?",
          options: ["Avoid clicking unknown links", "Clicking every pop-up", "Sharing passwords over email"],
          correctAnswerIndex: 0,
          explanation: "Unsolicited links are a primary way that attackers spread malware or lead you to phishing sites."
        }
      },
      {
        info: {
          title: "Module 4: Securing Your Devices",
          summary: "Your devices are gateways to your digital identity. Protect them from malware, viruses, and unauthorized access.",
          points: [
            { title: "Device Security", detail: "Enable device lock screens, keep your operating system updated, and install trusted security apps." }
          ]
        },
        quiz: {
          question: "How can you protect your devices?",
          options: ["Use locks, updates, and security apps", "Ignore updates", "Share passwords with friends"],
          correctAnswerIndex: 0,
          explanation: "These three pillars—access control, software patches, and security software—form a strong defense for your devices."
        }
      },
      {
        info: {
          title: "Module 5: Awareness and Backup Plans",
          summary: "Even with strong tools, threats may occur. Awareness and backup plans are essential.",
          points: [
            { title: "Stay Prepared", detail: "Learn to identify scams, backup important files, and regularly review privacy settings." }
          ]
        },
        quiz: {
          question: "What’s a good practice for digital self-defense?",
          options: ["Regular backups and awareness of scams", "Ignoring suspicious messages", "Using the same password everywhere"],
          correctAnswerIndex: 0,
          explanation: "Backups protect you from data loss, and awareness helps you avoid threats in the first place."
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
          title: "Scenario 1: Navigation – AI in Daily Life",
          summary: "Google Maps suggests a longer route to avoid traffic. Do you follow it?",
          points: [{ title: "Topic", detail: "AI in Daily Life" }]
        },
        quiz: {
          question: "What do you do?",
          options: ["Follow the AI suggestion", "Stick to your usual route", "Guess a route yourself"],
          correctAnswerIndex: 0,
          explanation: "AI uses real-time data to make smarter navigation choices, saving time."
        }
      },
      {
        info: {
          title: "Scenario 2: Entertainment – Personalized Recommendations",
          summary: "Netflix recommends a movie based on your past watches. Do you click “Play”?",
          points: [{ title: "Topic", detail: "AI in Daily Life" }]
        },
        quiz: {
          question: "What's your next move?",
          options: ["Try the recommendation", "Ignore suggestions", "Pick a random movie"],
          correctAnswerIndex: 0,
          explanation: "AI learns your preferences to improve content recommendations."
        }
      },
      {
        info: {
          title: "Scenario 3: Social Media – Privacy Risks",
          summary: "A social media app recommends connecting with someone you don’t know.",
          points: [{ title: "Topic", detail: "AI & Your Privacy" }]
        },
        quiz: {
          question: "How do you handle it?",
          options: ["Ignore suspicious accounts", "Add everyone suggested", "Message them to verify identity"],
          correctAnswerIndex: 0,
          explanation: "AI suggests connections based on your activity, but privacy awareness is essential."
        }
      },
      {
        info: {
          title: "Scenario 4: Email – Detecting Phishing",
          summary: "You get an email asking for banking info. AI flags it as phishing.",
          points: [{ title: "Topic", detail: "Your Digital Self-Defense Kit / AI & Privacy" }]
        },
        quiz: {
          question: "What should you do?",
          options: ["Don’t click links, report it", "Reply with info", "Ignore AI warning"],
          correctAnswerIndex: 0,
          explanation: "AI can identify phishing emails and help protect your data."
        }
      },
      {
        info: {
          title: "Scenario 5: Banking – Fraud Alerts",
          summary: "Your bank AI flags a suspicious transaction.",
          points: [{ title: "Topic", detail: "Protecting Your Digital ID (PII)" }]
        },
        quiz: {
          question: "What's the right action?",
          options: ["Cancel or verify transaction", "Ignore warning", "Pay anyway"],
          correctAnswerIndex: 0,
          explanation: "AI monitors financial data to prevent fraud."
        }
      },
      {
        info: {
          title: "Scenario 6: Smart Home – Energy Optimization",
          summary: "Smart assistant suggests turning off unused lights to save electricity.",
          points: [{ title: "Topic", detail: "AI in Daily Life" }]
        },
        quiz: {
          question: "Do you listen?",
          options: ["Follow AI suggestion", "Ignore and manage manually", "Turn off all devices at once"],
          correctAnswerIndex: 0,
          explanation: "AI learns habits to optimize energy and convenience."
        }
      },
      {
        info: {
          title: "Scenario 7: Health App – Personalized Fitness",
          summary: "Your AI fitness app suggests a new workout plan based on your activity.",
          points: [{ title: "Topic", detail: "AI in Daily Life / Digital Self-Defense (personal security awareness)" }]
        },
        quiz: {
          question: "What's your plan?",
          options: ["Follow AI plan", "Stick to your routine", "Ignore AI suggestions"],
          correctAnswerIndex: 0,
          explanation: "AI can enhance personal health, but sharing data should be controlled."
        }
      },
      {
        info: {
          title: "Scenario 8: App Permissions – Protecting PII",
          summary: "A new game requests camera, microphone, and contacts access.",
          points: [{ title: "Topic", detail: "Protecting Your Digital ID (PII) / AI & Privacy" }]
        },
        quiz: {
          question: "What permissions do you grant?",
          options: ["Grant only necessary permissions", "Grant all permissions", "Ignore the permissions"],
          correctAnswerIndex: 0,
          explanation: "Limiting app access protects personal data from misuse."
        }
      },
      {
        info: {
          title: "Scenario 9: Deepfakes – AI Threats",
          summary: "You receive a video message from a “friend” doing something unusual. AI flags it as a deepfake.",
          points: [{ title: "Topic", detail: "The Rise of AI Threats" }]
        },
        quiz: {
          question: "How do you react?",
          options: ["Don’t trust immediately, verify source", "Share with everyone", "Assume it’s real"],
          correctAnswerIndex: 0,
          explanation: "AI-generated content can deceive, and verification is crucial."
        }
      },
      {
        info: {
          title: "Scenario 10: Fake News Detection – AI Threats / Digital Defense",
          summary: "An article goes viral claiming a major event. AI warns it may be fake.",
          points: [{ title: "Topic", detail: "The Rise of AI Threats / Digital Self-Defense Kit" }]
        },
        quiz: {
          question: "What's the responsible action?",
          options: ["Verify before sharing", "Share immediately", "Ignore AI alert"],
          correctAnswerIndex: 0,
          explanation: "AI can help detect misinformation, protecting both you and others."
        }
      }
    ]
  }
];

// --- STYLING UTILS ---

const COMIC_BORDER = "border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]";
const SPEECH_BUBBLE = "relative bg-white dark:bg-slate-800 p-5 border-[4px] border-black dark:border-white rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] after:content-[''] after:absolute after:bottom-[-20px] after:left-10 after:w-0 after:h-0 after:border-l-[15px] after:border-l-transparent after:border-r-[15px] after:border-r-transparent after:border-t-[20px] after:border-t-black dark:after:border-t-white";

// --- COMPONENTS ---

const ComicSFX = ({ text }: { text: string }) => (
  <motion.div 
    initial={{ scale: 0, rotate: -20 }} 
    animate={{ scale: [0, 1.4, 1], rotate: [-20, 10, -5], opacity: [0, 1, 0] }} 
    transition={{ duration: 0.8 }} 
    className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
  >
    <span className="text-7xl md:text-9xl font-black italic text-yellow-400 drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] uppercase tracking-tighter">
      {text}
    </span>
  </motion.div>
);

const QuizComponent = ({ quiz, onCorrectAnswer }: { quiz: Quiz; onCorrectAnswer: () => void }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showSFX, setShowSFX] = useState(false);

  const isCorrect = isAnswered && selectedAnswer === quiz.correctAnswerIndex;

  const handleAnswerClick = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === quiz.correctAnswerIndex) {
      setShowSFX(true);
      setTimeout(() => {
        setShowSFX(false);
        onCorrectAnswer();
      }, 1800);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return "bg-white dark:bg-slate-700 hover:translate-x-1 hover:translate-y-1 transition-all";
    }
    if (index === quiz.correctAnswerIndex) {
      return "bg-green-400 text-black translate-x-1 translate-y-1 shadow-none";
    }
    if (index === selectedAnswer) {
      return "bg-red-500 text-white";
    }
    return "bg-slate-200 dark:bg-slate-800 opacity-50 shadow-none";
  };

  return (
    <div className="relative mt-2">
      <AnimatePresence>
        {showSFX && <ComicSFX text="BINGO!" />}
      </AnimatePresence>

      <motion.div 
        className={`p-6 bg-cyan-50 dark:bg-blue-900/10 border-[4px] border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)]`}
        animate={{ opacity: isCorrect ? 0.3 : 1 }}
      >
        <h4 className="font-black text-xl text-black dark:text-white mb-6 italic uppercase tracking-tighter flex items-center gap-2">
          <Zap className="text-yellow-500 fill-yellow-500" size={24} /> {quiz.question}
        </h4>
        <div className="space-y-3">
          {quiz.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleAnswerClick(index)}
              className={`w-full text-left p-4 border-[4px] border-black dark:border-white font-black uppercase italic text-sm md:text-base flex items-center shadow-[4px_4px_0px_rgba(0,0,0,1)] ${getButtonClass(index)}`}
              disabled={isAnswered}
              animate={isAnswered && selectedAnswer === index && !isCorrect ? { x: [0, -5, 5, -5, 5, 0] } : {}}
            >
              <div className="mr-3 flex-shrink-0">
                {isAnswered && (index === quiz.correctAnswerIndex ? <CheckCircle className="w-6 h-6" /> : (index === selectedAnswer ? <XCircle className="w-6 h-6" /> : <div className="w-6" />))}
                {!isAnswered && <div className="w-6 h-6 border-[3px] border-black dark:border-slate-400 rounded-full" />}
              </div>
              {option}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {isAnswered && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-6 p-5 bg-yellow-300 dark:bg-slate-800 border-[4px] border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)]`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-8 h-8 text-black dark:text-yellow-400 flex-shrink-0" />
              <div>
                <span className="font-black uppercase italic text-xs bg-black text-white px-2 py-0.5 mb-2 inline-block">Intel Update</span>
                <p className="text-sm font-black text-black dark:text-slate-100 leading-tight italic uppercase tracking-tighter">{quiz.explanation}</p>
              </div>
            </div>
            <button
              onClick={resetQuiz}
              className={`mt-4 w-full flex items-center justify-center gap-2 text-center p-3 bg-black text-white font-black uppercase italic border-[3px] border-black hover:bg-slate-800 transition-colors`}
            >
              <RotateCcw size={18} strokeWidth={4} />
              Retry Mission
            </button>
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
      layoutId={`card-container-${resource.id}`}
      whileHover={{ y: -8, rotate: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 cursor-pointer overflow-hidden flex flex-col h-full ${COMIC_BORDER}`}
    >
      <div className={`h-8 bg-gradient-to-r ${resource.color} border-b-[4px] border-black flex items-center px-4 overflow-hidden`}>
         <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-white/50" />
            <div className="w-2 h-2 rounded-full bg-white/50" />
            <div className="w-2 h-2 rounded-full bg-white/50" />
         </div>
      </div>
      <div className="p-6 flex-grow flex flex-col relative">
        <div className="absolute top-2 right-2 opacity-10">
            <IconComponent size={80} />
        </div>
        <div className="flex items-start mb-4">
          <div className={`w-14 h-14 bg-white dark:bg-slate-800 border-[4px] border-black dark:border-white flex items-center justify-center mr-4 flex-shrink-0 -rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            <IconComponent className="w-8 h-8 text-black dark:text-white" />
          </div>
          <div className="flex-1">
            <span className="inline-block px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-black uppercase italic tracking-tighter mb-1 border-2 border-black">
              {resource.category}
            </span>
            <h3 className="text-2xl font-black text-black dark:text-white leading-none uppercase italic tracking-tighter">
              {resource.title}
            </h3>
          </div>
        </div>
        <p className="text-slate-800 dark:text-slate-300 text-sm font-black italic leading-tight mb-6 line-clamp-3 uppercase tracking-tighter">
          {resource.teaser}
        </p>
        <div className="mt-auto flex justify-between items-center">
          <div className="h-1 flex-grow bg-slate-200 dark:bg-slate-800 mr-4" />
          <span className="flex-shrink-0 px-4 py-1 bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase italic border-[2px] border-black">
            Start &rarr;
          </span>
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

  if (!resource) return null;

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
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-6 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            layoutId={`card-container-${resource.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-[#f8f8f8] dark:bg-slate-900 my-auto relative border-[6px] border-black dark:border-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_rgba(255,255,255,0.1)]"
          >
            {/* --- MODAL HEADER --- */}
            <div className={`relative h-32 md:h-44 border-b-[6px] border-black overflow-hidden flex items-center bg-gradient-to-r ${resource.color}`}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }} />
              
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 bg-red-600 border-[4px] border-black p-2 hover:scale-110 transition-transform z-20 text-white shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              >
                <X size={24} strokeWidth={4} />
              </button>

              <div className="flex items-center gap-6 px-6 md:px-12 w-full z-10">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-white border-[6px] border-black flex items-center justify-center flex-shrink-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-3">
                  <IconComponent className="w-12 h-12 md:w-16 md:h-16 text-black" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] leading-none">
                    {resource.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-4">
                    {modules.map((_, index) => (
                      <div key={index} className={`h-4 w-10 border-[3px] border-black transition-all duration-300 ${index < currentModuleIndex ? 'bg-yellow-400' : (index === currentModuleIndex ? 'bg-white scale-110' : 'bg-black/20')}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="p-4 md:p-10">
              <AnimatePresence mode="wait">
                {!isCompleted ? (
                  <motion.div
                    key={currentModuleIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* --- LESSON PANEL --- */}
                    <div className="flex flex-col gap-6">
                      <div className="bg-yellow-400 border-[4px] border-black px-4 py-1 self-start shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-2">
                         <span className="text-sm font-black uppercase italic text-black tracking-tighter">Current Briefing</span>
                      </div>
                      
                      <div className={SPEECH_BUBBLE}>
                        <h3 className="text-xl md:text-2xl font-black text-black dark:text-white mb-3 uppercase italic tracking-tighter underline decoration-cyan-400 decoration-4">
                           {currentModule.info.title}
                        </h3>
                        <p className="text-base md:text-lg font-black text-slate-800 dark:text-slate-200 leading-tight italic uppercase tracking-tighter">
                          {currentModule.info.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {currentModule.info.points.map((point, index) => (
                          <div key={index} className="p-4 bg-white dark:bg-slate-800 border-[4px] border-black dark:border-white shadow-[4px_4px_0px_rgba(0,0,0,1)] group hover:translate-x-1 transition-transform">
                            <h4 className="font-black text-black dark:text-white uppercase text-xs md:text-sm mb-1 italic flex items-center gap-2">
                               <div className="w-2 h-2 bg-blue-500 rounded-full" /> {point.title}
                            </h4>
                            <p className="text-xs md:text-sm font-black italic text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{point.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* --- QUIZ PANEL --- */}
                    <div className="flex flex-col">
                       <div className="bg-blue-600 border-[4px] border-black px-4 py-1 self-start shadow-[4px_4px_0px_rgba(0,0,0,1)] rotate-2 z-10 translate-y-2 translate-x-4 text-white">
                        <span className="text-sm font-black uppercase italic tracking-tighter">Mission Assessment</span>
                       </div>
                       <QuizComponent quiz={currentModule.quiz} onCorrectAnswer={handleCorrectAnswer} />
                       
                       <div className="mt-8 p-4 bg-slate-200 dark:bg-slate-800 border-[4px] border-dashed border-black dark:border-white text-center">
                          <p className="text-2xl font-black italic uppercase text-slate-400 dark:text-slate-600 tracking-widest">Knowledge is Power</p>
                       </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="completion"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="inline-block relative mb-10">
                       <div className="absolute inset-0 bg-yellow-400 rotate-12 border-[4px] border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]" />
                       <div className={`relative w-32 h-32 bg-white border-[6px] border-black flex items-center justify-center -rotate-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]`}>
                         <CheckCircle className="w-20 h-20 text-green-500" strokeWidth={4} />
                       </div>
                    </div>
                    <h3 className="text-5xl md:text-6xl font-black text-black dark:text-white italic uppercase tracking-tighter mb-6 drop-shadow-[4px_4px_0px_rgba(34,197,94,0.3)]">Chapter Mastered!</h3>
                    <div className="max-w-xl mx-auto p-8 bg-white dark:bg-slate-800 border-[4px] border-black dark:border-white shadow-[10px_10px_0px_rgba(0,0,0,1)] mb-10 -rotate-1">
                       <p className="text-xl md:text-2xl font-black italic text-black dark:text-slate-200 uppercase tracking-tighter leading-tight">"{resource.finalAction}"</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-12 py-5 bg-black text-white dark:bg-white dark:text-black font-black text-2xl uppercase italic border-[4px] border-black hover:bg-slate-800 hover:translate-x-2 hover:translate-y-2 transition-all shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]"
                    >
                      Next Mission &rarr;
                    </button>
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
    <div className="min-h-screen bg-[#f0f0f0] dark:bg-slate-950 text-black dark:text-white font-sans selection:bg-yellow-400 selection:text-black" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* --- HERO SECTION --- */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-20 pt-10"
        >
          
          <div className="bg-white dark:bg-slate-900 border-[6px] border-black dark:border-white p-10 md:p-16 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_rgba(255,255,255,0.05)] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Brain size={200} />
            </div>
            <h1 className="text-6xl md:text-9xl font-black mb-6 italic uppercase tracking-tighter text-black dark:text-white drop-shadow-[8px_8px_0px_rgba(59,130,246,0.8)] leading-none">
              AI AWARENESS <span className="text-blue-600 block md:inline">HUB</span>
            </h1>
            <div className="h-2 w-32 bg-yellow-400 mx-auto mb-8 border-2 border-black" />
            <p className="text-xl md:text-3xl font-black text-slate-700 dark:text-slate-300 max-w-4xl mx-auto italic uppercase tracking-tighter">
              "Your interactive field guide to surviving and thriving in the age of intelligence."
            </p>
          </div>
        </motion.div>

        {/* --- CONTROLS --- */}
        <motion.div className="sticky top-6 z-30 mb-16 flex flex-col gap-6">
          <div className={`flex flex-col md:flex-row gap-6 p-6 bg-white dark:bg-slate-800 ${COMIC_BORDER}`}>
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 text-black dark:text-slate-400" />
              <input
                type="text"
                placeholder="Scan intelligence logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-slate-100 dark:bg-slate-900 border-[4px] border-black dark:border-white font-black italic uppercase tracking-tighter outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 border-[4px] font-black uppercase italic text-sm transition-all whitespace-nowrap shadow-[4px_4px_0px_rgba(0,0,0,1)] ${selectedCategory === category
                    ? 'bg-yellow-400 text-black border-black translate-x-1 translate-y-1 shadow-none'
                    : 'bg-white dark:bg-slate-700 text-black dark:text-white border-black dark:border-white hover:-translate-y-1'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <AnimatePresence>
            {filteredTopics.map((topic) => (
              <motion.div
                key={topic.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
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
          <div className="text-center py-24 bg-white dark:bg-slate-900 border-[6px] border-dashed border-black dark:border-white shadow-[12px_12px_0px_rgba(0,0,0,1)]">
            <Search className="w-24 h-24 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
            <h3 className="text-4xl font-black uppercase italic text-slate-400 dark:text-slate-600 tracking-tighter">Intel Not Found</h3>
          </div>
        )}

        {/* --- FOOTER BANNER --- */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 p-10 bg-cyan-400 dark:bg-slate-900 border-[6px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center gap-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-black/10" />
          <div className="w-24 h-24 bg-white border-[6px] border-black flex items-center justify-center flex-shrink-0 rotate-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <AlertTriangle className="w-14 h-14 text-black" strokeWidth={3} />
          </div>
          <div className="text-center md:text-left z-10">
            <h3 className="text-3xl md:text-4xl font-black text-black dark:text-white uppercase italic tracking-tighter mb-3">
              Final Intel: Vigilance is Required
            </h3>
            <p className="text-lg md:text-xl font-black italic text-black dark:text-slate-300 leading-tight uppercase tracking-tighter">
              AI technology evolves in every frame. The best defense is a sharp mind. Keep learning, stay curious, and always verify the source.
            </p>
          </div>
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