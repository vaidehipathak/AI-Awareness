import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Lock, Fingerprint, Eye, Shield, Gamepad2,
  Search, AlertTriangle, X, CheckCircle, XCircle, ArrowLeft, Lightbulb, UserCheck, BarChart, RotateCcw
} from 'lucide-react';

// --- DATA STRUCTURES & CONTENT (No changes here) ---

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
          summary: "PII can leak through careless habits, weak security, or untrusted platforms.",
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

// --- UPDATED QUIZ COMPONENT ---

const CorrectAnswerAnimation = () => {
  const emojis = ["🎉", "✨", "🚀", "👍", "✅"];
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      {emojis.map((emoji, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{
            y: -120 - (Math.random() * 50),
            x: (Math.random() - 0.5) * 160,
            scale: 1.2 + Math.random(),
            rotate: (Math.random() - 0.5) * 360,
            opacity: 0,
          }}
          transition={{
            duration: 1.0,
            ease: "easeOut",
            delay: i * 0.05,
          }}
          className="absolute text-4xl"
        >
          {emoji}
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="p-2 px-4 bg-green-500 text-white font-bold rounded-full shadow-lg"
      >
        Correct!
      </motion.div>
    </div>
  );
};


const QuizComponent = ({ quiz, onCorrectAnswer }: { quiz: Quiz; onCorrectAnswer: () => void }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const isCorrect = isAnswered && selectedAnswer === quiz.correctAnswerIndex;

  const handleAnswerClick = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === quiz.correctAnswerIndex) {
      setTimeout(onCorrectAnswer, 1800);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
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
    <div className="relative mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">

      <AnimatePresence>
        {isCorrect && <CorrectAnswerAnimation />}
      </AnimatePresence>

      <motion.h4
        className="font-bold text-lg text-slate-900 dark:text-white mb-3"
        animate={{ opacity: isCorrect ? 0.3 : 1 }}
      >
        {quiz.question}
      </motion.h4>
      <motion.div
        className="space-y-2"
        animate={{ opacity: isCorrect ? 0.3 : 1 }}
      >
        {quiz.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleAnswerClick(index)}
            className={`w-full text-left p-3 rounded-md transition-all flex items-center text-slate-800 dark:text-slate-200 ${getButtonClass(index)}`}
            disabled={isAnswered}
            animate={isAnswered && selectedAnswer === index && !isCorrect ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            {isAnswered && (index === quiz.correctAnswerIndex ? <CheckCircle className="w-5 h-5 mr-2 text-white" /> : (index === selectedAnswer ? <XCircle className="w-5 h-5 mr-2 text-white" /> : <span className="w-5 h-5 mr-2" />))}
            {option}
          </motion.button>
        ))}
      </motion.div>
      <AnimatePresence>
        {isAnswered && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-slate-200 dark:bg-slate-600 rounded-md"
          >
            {quiz.explanation && <p className="text-sm text-slate-800 dark:text-slate-100">{quiz.explanation}</p>}
            <button
              onClick={resetQuiz}
              className="mt-3 w-full flex items-center justify-center gap-2 text-center p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
              <RotateCcw size={16} />
              Try Again
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
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col h-full"
    >
      <div className={`h-2 bg-gradient-to-r ${resource.color}`} />
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-start mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${resource.color} rounded-xl flex items-center justify-center mr-4 flex-shrink-0`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{resource.category}</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {resource.title}
            </h3>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm flex-grow mb-4">
          {resource.teaser}
        </p>
        <div className="text-right text-sm font-semibold text-blue-600 dark:text-blue-400 mt-auto">
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="w-full h-full overflow-y-auto">
            <div className="flex items-center justify-center min-h-full py-8">
              <motion.div
                layoutId={`card-container-${resource.id}`}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
              >
                {/* --- MODAL HEADER --- */}
                <div className="p-6 sm:p-8 relative bg-white dark:bg-slate-800">
                  <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors z-10">
                    <X size={24} />
                  </button>

                  <div className="flex items-center mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${resource.color} rounded-xl flex items-center justify-center mr-5 flex-shrink-0`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                      {resource.title}
                    </h2>
                  </div>

                  {/* --- VISUAL PROGRESS BAR --- */}
                  <div className="flex items-center gap-2">
                    {modules.map((_, index) => (
                      <div key={index} className={`h-2 flex-1 rounded-full transition-colors duration-500 ${index < currentModuleIndex ? `bg-green-500` : (index === currentModuleIndex ? `bg-blue-500` : 'bg-slate-200 dark:bg-slate-600')}`}></div>
                    ))}
                  </div>
                </div>

                {/* --- LEARNING CONTENT AREA --- */}
                <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/50">
                  <AnimatePresence mode="wait">
                    {!isCompleted ? (
                      // --- CURRENT MODULE VIEW ---
                      <motion.div
                        key={currentModuleIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.4 }}
                      >
                        {/* --- LESSON CARD --- */}
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
                          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{currentModule.info.title}</h3>
                          <p className="text-slate-600 dark:text-slate-300 mb-4">
                            {currentModule.info.summary}
                          </p>
                          <div className="space-y-4">
                            {currentModule.info.points.map((point, index) => (
                              <div key={index} className="flex items-start">
                                <div className={`w-2 h-2 bg-gradient-to-r ${resource.color} rounded-full mt-1.5 mr-3 flex-shrink-0`}></div>
                                <div>
                                  <h4 className="font-semibold text-slate-800 dark:text-slate-100">{point.title}</h4>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{point.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* --- KNOWLEDGE CHECK CARD --- */}
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                          <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">Knowledge Check!</h3>
                          <QuizComponent quiz={currentModule.quiz} onCorrectAnswer={handleCorrectAnswer} />
                        </div>

                      </motion.div>
                    ) : (
                      // --- COMPLETION VIEW ---
                      <motion.div
                        key="completion"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg">
                          <div className={`w-16 h-16 bg-gradient-to-br ${resource.color} rounded-full flex items-center justify-center mx-auto mb-5`}>
                            <CheckCircle className="w-9 h-9 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Topic Completed!</h3>
                          <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto">{resource.finalAction}</p>
                          <button
                            onClick={onClose}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
          className="sticky top-0 z-10 py-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-lg mb-8 -mx-4 px-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search topics like 'PII' or 'Deepfakes'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
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
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
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