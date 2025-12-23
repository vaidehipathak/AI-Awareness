import React, { useEffect, useMemo, useState } from 'react';

/* ---------------- TYPES ---------------- */

type Difficulty = 'easy' | 'medium' | 'hard';

type Question = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

/* ---------------- QUESTION BANK ---------------- */
/*
  IMPORTANT:
  - Put YOUR 25 easy, 25 medium, 25 hard questions here
  - I am NOT repeating questions as requested
*/

const QUESTION_BANK: Record<Difficulty, Question[]> = {
  easy: [
  {
    prompt: 'What does AI stand for?',
    options: ['Automatic Interface', 'Artificial Intelligence', 'Advanced Internet', 'Applied Innovation'],
    correctIndex: 1,
    explanation: 'AI stands for Artificial Intelligence.',
  },
  {
    prompt: 'Which of these uses AI?',
    options: ['Smartphone camera', 'Electric fan', 'Calculator', 'Light bulb'],
    correctIndex: 0,
    explanation: 'Smartphone cameras use AI for face detection and enhancement.',
  },
  {
    prompt: 'AI mainly works using?',
    options: ['Magic', 'Data', 'Electricity only', 'Luck'],
    correctIndex: 1,
    explanation: 'AI systems learn patterns from data.',
  },
  {
    prompt: 'Which is an AI assistant?',
    options: ['Google Assistant', 'Notepad', 'Calculator', 'Paint'],
    correctIndex: 0,
    explanation: 'Google Assistant is an AI-powered virtual assistant.',
  },
  {
    prompt: 'Can AI learn from experience?',
    options: ['Yes', 'No', 'Only humans can', 'Only robots'],
    correctIndex: 0,
    explanation: 'Machine learning allows AI to learn from experience.',
  },
  {
    prompt: 'Which task can AI perform?',
    options: ['Weather prediction', 'Feeling emotions', 'Thinking like humans', 'Sleeping'],
    correctIndex: 0,
    explanation: 'AI can analyze data to predict weather.',
  },
  {
    prompt: 'Is AI the same as a robot?',
    options: ['Yes', 'No', 'Sometimes', 'Only in movies'],
    correctIndex: 1,
    explanation: 'AI is software intelligence; robots are physical machines.',
  },
  {
    prompt: 'Which of these is AI-based?',
    options: ['Face unlock', 'Light switch', 'Fan regulator', 'Door lock'],
    correctIndex: 0,
    explanation: 'Face unlock uses AI-based image recognition.',
  },
  {
    prompt: 'AI systems need which resource most?',
    options: ['Fuel', 'Data', 'Water', 'Paper'],
    correctIndex: 1,
    explanation: 'Data is essential for training AI models.',
  },
  {
    prompt: 'Which is a benefit of AI?',
    options: ['Automation of tasks', 'More human errors', 'Slower work', 'Manual effort'],
    correctIndex: 0,
    explanation: 'AI helps automate repetitive tasks.',
  },
  {
    prompt: 'Can AI make mistakes?',
    options: ['No', 'Yes', 'Never', 'Only robots do'],
    correctIndex: 1,
    explanation: 'AI can make mistakes depending on data and design.',
  },
  {
    prompt: 'Which industry uses AI?',
    options: ['Healthcare', 'Education', 'Banking', 'All of the above'],
    correctIndex: 3,
    explanation: 'AI is used across many industries.',
  },
  {
    prompt: 'AI recommendations are used in?',
    options: ['Netflix', 'YouTube', 'Amazon', 'All of the above'],
    correctIndex: 3,
    explanation: 'Recommendation systems use AI.',
  },
  {
    prompt: 'Which of these is NOT AI?',
    options: ['Voice assistant', 'Spam filter', 'Basic calculator', 'Face recognition'],
    correctIndex: 2,
    explanation: 'Basic calculators do not use AI.',
  },
  {
    prompt: 'AI can help humans by?',
    options: ['Reducing workload', 'Replacing all humans', 'Creating confusion', 'Increasing errors'],
    correctIndex: 0,
    explanation: 'AI supports humans by automating tasks.',
  },
  {
    prompt: 'AI decisions depend on?',
    options: ['Data quality', 'Emotions', 'Mood', 'Weather'],
    correctIndex: 0,
    explanation: 'Better data leads to better AI decisions.',
  },
  {
    prompt: 'Which is a common AI feature?',
    options: ['Speech recognition', 'Handwriting only', 'Manual typing', 'Physical strength'],
    correctIndex: 0,
    explanation: 'Speech recognition is AI-based.',
  },
  {
    prompt: 'AI systems are created by?',
    options: ['Humans', 'Machines only', 'Aliens', 'Nature'],
    correctIndex: 0,
    explanation: 'Humans design and train AI systems.',
  },
  {
    prompt: 'Which is an AI risk?',
    options: ['Privacy loss', 'Faster work', 'Automation', 'Accuracy'],
    correctIndex: 0,
    explanation: 'AI can risk privacy if data is misused.',
  },
  {
    prompt: 'AI should be used?',
    options: ['Responsibly', 'Without rules', 'Without limits', 'Secretly'],
    correctIndex: 0,
    explanation: 'Responsible AI ensures safety and fairness.',
  },
  {
    prompt: 'AI systems improve by?',
    options: ['More data', 'Guessing', 'Randomness', 'Luck'],
    correctIndex: 0,
    explanation: 'More quality data helps AI learn better.',
  },
  {
    prompt: 'AI can help in education by?',
    options: ['Personalized learning', 'Replacing teachers', 'Stopping exams', 'Ignoring students'],
    correctIndex: 0,
    explanation: 'AI can personalize learning experiences.',
  },
  {
    prompt: 'AI systems should respect?',
    options: ['Privacy', 'Rules', 'Ethics', 'All of the above'],
    correctIndex: 3,
    explanation: 'Ethical AI respects privacy and laws.',
  },
  {
    prompt: 'Which is a safe AI practice?',
    options: ['User consent', 'Data misuse', 'No testing', 'No rules'],
    correctIndex: 0,
    explanation: 'User consent is essential for ethical AI.',
  },
  {
    prompt: 'AI awareness is important because?',
    options: ['AI impacts daily life', 'AI is magic', 'AI replaces everything', 'AI is fictional'],
    correctIndex: 0,
    explanation: 'AI affects many aspects of daily life.',
  },
],
     // ← your 25 easy questions
  medium: [
  {
    prompt: 'What is PII?',
    options: ['Public Internet Info', 'Personal Identifiable Information', 'Private Internal Input', 'Processed Info'],
    correctIndex: 1,
    explanation: 'PII can identify an individual.',
  },
  {
    prompt: 'Which is PII?',
    options: ['Email address', 'Weather report', 'News headline', 'Public website'],
    correctIndex: 0,
    explanation: 'Email addresses are personal identifiers.',
  },
  {
    prompt: 'Why is PII protection important?',
    options: ['Prevent identity theft', 'Improve speed', 'Reduce storage', 'Increase ads'],
    correctIndex: 0,
    explanation: 'Protecting PII prevents misuse.',
  },
  {
    prompt: 'What is AI bias?',
    options: ['Unfair behavior due to data', 'Slow processing', 'Hardware issue', 'Network failure'],
    correctIndex: 0,
    explanation: 'Bias comes from biased data.',
  },
  {
    prompt: 'Consent in AI means?',
    options: ['User permission', 'Automatic approval', 'Hidden usage', 'Free access'],
    correctIndex: 0,
    explanation: 'Consent means informed user permission.',
  },
  {
    prompt: 'Which is a responsible AI practice?',
    options: ['Transparency', 'Hidden models', 'No testing', 'Unlimited data'],
    correctIndex: 0,
    explanation: 'Transparency improves trust.',
  },
  {
    prompt: 'What does data anonymization do?',
    options: ['Removes identifiers', 'Deletes data', 'Encrypts servers', 'Adds noise'],
    correctIndex: 0,
    explanation: 'Anonymization reduces identifiability.',
  },
  {
    prompt: 'What is machine learning?',
    options: ['AI learning from data', 'Manual coding', 'Hardware design', 'Networking'],
    correctIndex: 0,
    explanation: 'ML enables learning from data.',
  },
  {
    prompt: 'Which learning uses labels?',
    options: ['Supervised learning', 'Unsupervised', 'Reinforcement', 'None'],
    correctIndex: 0,
    explanation: 'Supervised learning uses labeled data.',
  },
  {
    prompt: 'What is inference?',
    options: ['Using trained model', 'Training phase', 'Data collection', 'Evaluation'],
    correctIndex: 0,
    explanation: 'Inference means making predictions.',
  },
  {
    prompt: 'Which is an AI misuse?',
    options: ['Deepfake scams', 'Spam filtering', 'Medical alerts', 'Accessibility tools'],
    correctIndex: 0,
    explanation: 'Deepfakes can be harmful.',
  },
  {
    prompt: 'What is a model card?',
    options: ['Model documentation', 'UI design', 'Source code', 'User data'],
    correctIndex: 0,
    explanation: 'Model cards document usage and risks.',
  },
  {
    prompt: 'What is data minimization?',
    options: ['Collect only needed data', 'Collect everything', 'Delete rules', 'Ignore privacy'],
    correctIndex: 0,
    explanation: 'Collecting minimal data reduces risk.',
  },
  {
    prompt: 'Why is fairness testing needed?',
    options: ['Detect bias', 'Increase speed', 'Reduce storage', 'Improve UI'],
    correctIndex: 0,
    explanation: 'Fairness testing identifies bias.',
  },
  {
    prompt: 'What is explainable AI?',
    options: ['Understand model decisions', 'Faster AI', 'Larger models', 'Encrypted AI'],
    correctIndex: 0,
    explanation: 'Explainability helps humans understand decisions.',
  },
  {
    prompt: 'Which data is sensitive?',
    options: ['Aadhaar number', 'Temperature', 'City name', 'Public post'],
    correctIndex: 0,
    explanation: 'Government IDs are sensitive.',
  },
  {
    prompt: 'AI governance focuses on?',
    options: ['Rules and accountability', 'Speed', 'UI design', 'Marketing'],
    correctIndex: 0,
    explanation: 'Governance ensures responsible AI.',
  },
  {
    prompt: 'What is data leakage?',
    options: ['Unauthorized data exposure', 'Slow network', 'Low accuracy', 'High latency'],
    correctIndex: 0,
    explanation: 'Data leakage exposes private data.',
  },
  {
    prompt: 'What is training data?',
    options: ['Data used to learn', 'Final output', 'UI code', 'Logs'],
    correctIndex: 0,
    explanation: 'Training data teaches the model.',
  },
  {
    prompt: 'Which law protects personal data?',
    options: ['Data protection laws', 'Traffic laws', 'Education laws', 'Copyright laws'],
    correctIndex: 0,
    explanation: 'Data protection laws safeguard privacy.',
  },
  {
    prompt: 'What is AI transparency?',
    options: ['Clear documentation', 'Hidden logic', 'Secret models', 'No disclosure'],
    correctIndex: 0,
    explanation: 'Transparency builds trust.',
  },
  {
    prompt: 'Which metric evaluates classification?',
    options: ['Accuracy', 'Latency', 'FPS', 'Memory'],
    correctIndex: 0,
    explanation: 'Accuracy is common for classification.',
  },
  {
    prompt: 'What is overfitting?',
    options: ['Poor generalization', 'High accuracy everywhere', 'Fast inference', 'Low memory'],
    correctIndex: 0,
    explanation: 'Overfitting memorizes training data.',
  },
  {
    prompt: 'Which AI principle ensures safety?',
    options: ['Robustness', 'Opacity', 'Speed', 'Virality'],
    correctIndex: 0,
    explanation: 'Robustness ensures reliable behavior.',
  },
  {
    prompt: 'What is federated learning?',
    options: ['Training without centralizing data', 'Central storage', 'Encryption only', 'UI design'],
    correctIndex: 0,
    explanation: 'Data stays on devices.',
  },
],
   // ← your 25 medium questions
 hard: [
  {
    prompt: 'What is differential privacy?',
    options: ['Adding noise to protect individuals', 'Deleting data', 'Encrypting storage', 'Blocking access'],
    correctIndex: 0,
    explanation: 'Noise prevents individual identification.',
  },
  {
    prompt: 'What causes model drift?',
    options: ['Changing real-world data', 'Faster GPUs', 'New UI', 'Better accuracy'],
    correctIndex: 0,
    explanation: 'Data changes degrade performance.',
  },
  {
    prompt: 'What is adversarial testing?',
    options: ['Testing with malicious inputs', 'Speed testing', 'UI testing', 'UX testing'],
    correctIndex: 0,
    explanation: 'It finds model weaknesses.',
  },
  {
    prompt: 'Which tool explains model predictions?',
    options: ['SHAP', 'Dropout', 'Adam', 'BatchNorm'],
    correctIndex: 0,
    explanation: 'SHAP provides explanations.',
  },
  {
    prompt: 'What is AI accountability?',
    options: ['Clear responsibility and audits', 'Hidden ownership', 'No logs', 'Anonymous systems'],
    correctIndex: 0,
    explanation: 'Accountability ensures responsibility.',
  },
  {
    prompt: 'What is hallucination in AI?',
    options: ['Confident wrong output', 'Slow response', 'Model crash', 'Network error'],
    correctIndex: 0,
    explanation: 'Hallucinations are fabricated answers.',
  },
  {
    prompt: 'What is dataset governance?',
    options: ['Tracking data source and consent', 'Deleting metadata', 'Ignoring lineage', 'Open sharing'],
    correctIndex: 0,
    explanation: 'Governance ensures compliance.',
  },
  {
    prompt: 'What is a deepfake?',
    options: ['AI-generated fake media', 'Encrypted video', 'Low quality image', 'UI bug'],
    correctIndex: 0,
    explanation: 'Deepfakes impersonate people.',
  },
  {
    prompt: 'What is privacy-by-design?',
    options: ['Privacy built from start', 'Added later', 'Optional feature', 'Marketing term'],
    correctIndex: 0,
    explanation: 'Privacy must be foundational.',
  },
  {
    prompt: 'What is re-identification risk?',
    options: ['Linking anonymized data back to individuals', 'Low accuracy', 'Fast inference', 'Overfitting'],
    correctIndex: 0,
    explanation: 'Anonymized data can sometimes be reversed.',
  },
  {
    prompt: 'What does model monitoring detect?',
    options: ['Performance issues', 'UI bugs', 'CSS errors', 'Hardware failure'],
    correctIndex: 0,
    explanation: 'Monitoring ensures reliability.',
  },
  {
    prompt: 'What is an audit trail?',
    options: ['Record of decisions', 'UI design', 'Training data', 'Model weights'],
    correctIndex: 0,
    explanation: 'Audit trails support accountability.',
  },
  {
    prompt: 'What is consent withdrawal?',
    options: ['User revokes permission', 'Permanent approval', 'No control', 'Hidden consent'],
    correctIndex: 0,
    explanation: 'Users can withdraw consent.',
  },
  {
    prompt: 'What is responsible deployment?',
    options: ['Controlled rollout', 'Instant release', 'No testing', 'Unlimited access'],
    correctIndex: 0,
    explanation: 'Deployment should be cautious.',
  },
  {
    prompt: 'What is fairness metric?',
    options: ['Group performance comparison', 'Latency check', 'FPS', 'Memory'],
    correctIndex: 0,
    explanation: 'Fairness metrics detect bias.',
  },
  {
    prompt: 'What is AI regulation?',
    options: ['Legal framework for AI', 'UI rules', 'Coding standards', 'Design patterns'],
    correctIndex: 0,
    explanation: 'Regulations govern AI usage.',
  },
  {
    prompt: 'What is data provenance?',
    options: ['Origin of data', 'Model size', 'Inference speed', 'Accuracy'],
    correctIndex: 0,
    explanation: 'Provenance tracks data origin.',
  },
  {
    prompt: 'What is access control?',
    options: ['Restricting data access', 'Free access', 'Public sharing', 'No security'],
    correctIndex: 0,
    explanation: 'Access control protects data.',
  },
  {
    prompt: 'What is threat modeling?',
    options: ['Identifying security risks', 'UI testing', 'Speed optimization', 'Color selection'],
    correctIndex: 0,
    explanation: 'Threat modeling improves security.',
  },
  {
    prompt: 'What is ethical AI?',
    options: ['AI aligned with human values', 'Fast AI', 'Profitable AI', 'Autonomous AI'],
    correctIndex: 0,
    explanation: 'Ethical AI prioritizes humans.',
  },
  {
    prompt: 'What is secure data storage?',
    options: ['Encryption and access control', 'Public access', 'No backup', 'Plain text'],
    correctIndex: 0,
    explanation: 'Security protects sensitive data.',
  },
  {
    prompt: 'What is incident response?',
    options: ['Handling security breaches', 'UI redesign', 'Model training', 'Deployment'],
    correctIndex: 0,
    explanation: 'Incident response manages breaches.',
  },
  {
    prompt: 'What is model versioning?',
    options: ['Tracking model changes', 'UI updates', 'Data deletion', 'Hardware upgrade'],
    correctIndex: 0,
    explanation: 'Versioning ensures traceability.',
  },
  {
    prompt: 'What is AI misuse detection?',
    options: ['Monitoring harmful usage', 'Faster training', 'Better UI', 'Design testing'],
    correctIndex: 0,
    explanation: 'Misuse detection improves safety.',
  },
  {
    prompt: 'What is safe AI by default?',
    options: ['Safety enabled automatically', 'Optional safety', 'No restrictions', 'Hidden filters'],
    correctIndex: 0,
    explanation: 'Safety should be default.',
  },
],
     // ← your 25 hard questions
};

/* ---------------- UTILS ---------------- */

function shuffleArray<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleQuestionOptions(q: Question): Question {
  const indexedOptions = q.options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === q.correctIndex,
  }));

  const shuffled = shuffleArray(indexedOptions);

  return {
    ...q,
    options: shuffled.map(o => o.text),
    correctIndex: shuffled.findIndex(o => o.isCorrect),
  };
}

function sampleQuestions(level: Difficulty, count: number): Question[] {
  return shuffleArray(QUESTION_BANK[level])
    .slice(0, count)
    .map(shuffleQuestionOptions);
}


/* ---------------- COMPONENT ---------------- */

const Quiz: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const total = sessionQuestions.length;
  const current = sessionQuestions[currentIndex];

  const percent = useMemo(
    () => Math.round((currentIndex / total) * 100),
    [currentIndex, total]
  );

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    if (isFinished || isAnswered) return;

    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isFinished, isAnswered, currentIndex]);

  useEffect(() => {
    setTimeLeft(15);
  }, [currentIndex]);

  /* ---------------- HANDLERS ---------------- */

  function startQuiz() {
    setHasStarted(true);
  }

  function selectDifficulty(level: Difficulty) {
    setDifficulty(level);
    setSessionQuestions(sampleQuestions(level, 5));
    setCurrentIndex(0);
    setSelectedIndex(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setTimeLeft(15);
  }

  function handleSelect(idx: number) {
    if (isAnswered) return;
    setSelectedIndex(idx);
  }

  function submitAnswer() {
    if (selectedIndex === null) return;
    if (selectedIndex === current.correctIndex) {
      setScore(s => s + 1);
    }
    setIsAnswered(true);
  }

  function nextQuestion() {
    if (currentIndex + 1 >= total) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelectedIndex(null);
    setIsAnswered(false);
  }

  function handleTimeout() {
    if (currentIndex + 1 >= total) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelectedIndex(null);
    setIsAnswered(false);
  }

  function restart() {
    setHasStarted(false);
    setDifficulty(null);
    setSessionQuestions([]);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setTimeLeft(15);
  }

  /* ---------------- UI ---------------- */

  /* 🔹 INSTRUCTION SCREEN (UNCHANGED) */
  if (!hasStarted) {
    return (
      <div className="container mx-auto max-w-3xl p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8">
          <h1 className="text-4xl font-extrabold text-center mb-4 text-primary">
            AI Awareness Quiz
          </h1>

          <p className="text-center mb-6 text-gray-700 dark:text-gray-300">
            Read the instructions carefully before starting.
          </p>

          <div className="space-y-3">
            <p>📌 Total Questions: <strong>5</strong></p>
            <p>⏱ Time per Question: <strong>15 seconds</strong></p>
            <p>✅ One correct answer per question</p>
            <p>📖 Explanation shown after each answer</p>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={startQuiz}
              className="bg-primary text-white px-10 py-3 rounded-lg text-lg font-semibold"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* 🔹 DIFFICULTY SELECTION */
  if (!difficulty) {
    return (
      <div className="container mx-auto max-w-3xl p-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Select Difficulty</h2>
        <div className="space-y-4">
          <button onClick={() => selectDifficulty('easy')} className="w-full bg-green-500 text-white py-3 rounded-lg">Easy</button>
          <button onClick={() => selectDifficulty('medium')} className="w-full bg-yellow-500 text-white py-3 rounded-lg">Medium</button>
          <button onClick={() => selectDifficulty('hard')} className="w-full bg-red-500 text-white py-3 rounded-lg">Hard</button>
        </div>
      </div>
    );
  }

  /* 🔹 RESULT SCREEN */
  if (isFinished) {
    return (
      <div className="container mx-auto max-w-3xl p-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Quiz Complete</h2>
        <p className="mb-6">You scored {score} out of {total}</p>
        <button onClick={restart} className="bg-primary text-white px-8 py-3 rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  /* 🔹 QUIZ SCREEN (SAME AS BEFORE) */
  return (
    <div className="container mx-auto max-w-3xl p-4">
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${percent}%` }} />
        </div>

        <div className="flex justify-between mt-2 text-sm">
          <span>Question {currentIndex + 1} of {total}</span>
          <span>⏱ {timeLeft}s | Score: {score}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">{current.prompt}</h2>

        <div className="space-y-3">
          {current.options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = idx === current.correctIndex;

            let cls =
  'w-full px-4 py-3 rounded-lg border text-left font-medium ' +
  'text-gray-900 dark:text-gray-100 ';
if (!isAnswered) {
  cls += isSelected
    ? ' bg-blue-100 dark:bg-blue-900/30 border-blue-300'
    : ' bg-gray-50 dark:bg-gray-700 border-gray-300';
}

if (isAnswered && isSelected) {
  cls += isCorrect
    ? ' bg-green-100 dark:bg-green-900/30 border-green-400 text-green-900 dark:text-green-100'
    : ' bg-red-100 dark:bg-red-900/30 border-red-400 text-red-900 dark:text-red-100';
}

if (isAnswered && !isSelected && isCorrect) {
  cls += ' bg-green-100 dark:bg-green-900/30 border-green-400 text-green-900 dark:text-green-100';
}


            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={cls}
              >
                {String.fromCharCode(65 + idx)}. {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {!isAnswered ? (
            <button onClick={submitAnswer} disabled={selectedIndex === null} className="bg-primary text-white px-6 py-3 rounded-lg">
              Submit Answer
            </button>
          ) : (
            <button onClick={nextQuestion} className="bg-primary text-white px-6 py-3 rounded-lg">
              Next Question
            </button>
          )}
        </div>

       {isAnswered && (
  <div className="mt-6 p-4 rounded-lg border 
                  bg-gray-100 dark:bg-gray-800 
                  border-gray-300 dark:border-gray-600">

    <p className="text-sm uppercase tracking-wide 
                  text-gray-600 dark:text-gray-400 mb-1">
      Explanation
    </p>

    <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
      {current.explanation}
    </p>
  </div>
)}

      </div>
    </div>
  );
};

export default Quiz;
