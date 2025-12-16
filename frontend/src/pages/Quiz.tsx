import React, { useEffect, useMemo, useState } from 'react';

type Question = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const AI_QUESTIONS: Question[] = [
  {
    prompt: 'Which of the following best describes Artificial Intelligence (AI)?',
    options: [
      'A system that always thinks exactly like a human',
      'Any technique that enables machines to mimic cognitive functions like learning and reasoning',
      'A physical robot with human-like appearance',
      'A database that stores large amounts of information only',
    ],
    correctIndex: 1,
    explanation:
      'AI refers to systems that perform tasks requiring human-like intelligence such as learning, reasoning, problem-solving, perception, and language understanding. It does not have to be human-like or embodied.',
  },
  {
    prompt: 'Which statement about AI bias is true?',
    options: [
      'AI is always unbiased because it is mathematical',
      'Bias can appear in AI if the training data reflects historical or sampling biases',
      'Only facial recognition systems can be biased',
      'Bias can be fully eliminated by adding more compute power',
    ],
    correctIndex: 1,
    explanation:
      'AI systems learn from data; if data contains biases, the model can reproduce or amplify them. This applies across domains, not just vision tasks.',
  },
  {
    prompt: 'What is the primary difference between Narrow AI and General AI?',
    options: [
      'Narrow AI is conscious; General AI is not',
      'Narrow AI excels at specific tasks; General AI would match or exceed human performance across most tasks',
      'Narrow AI uses data; General AI does not',
      'There is no difference',
    ],
    correctIndex: 1,
    explanation:
      'Narrow AI is specialized (e.g., translation, image recognition). General AI would be broadly capable like a human across many tasks—something that does not exist today.',
  },
  {
    prompt: 'Which of the following is a responsible AI practice?',
    options: [
      'Hiding model limitations from users',
      'Collecting any data without consent to improve accuracy',
      'Performing fairness testing and documenting known limitations',
      'Allowing the model to operate without human oversight',
    ],
    correctIndex: 2,
    explanation:
      'Responsible AI includes practices like fairness testing, transparency, privacy protection, human oversight, and documenting risks and limitations.',
  },
  {
    prompt: 'What does “training data” mean in machine learning?',
    options: [
      'The set of rules the model follows at runtime',
      'The examples used to learn patterns that map inputs to outputs',
      'The code that defines the user interface',
      'The benchmark used only for final reporting',
    ],
    correctIndex: 1,
    explanation:
      'Training data provides examples that the model uses to adjust its parameters so it can generalize to new, unseen inputs.',
  },
  {
    prompt: 'Which is an example of a potential AI misuse risk?',
    options: [
      'Detecting spam emails',
      'Providing safety warnings in medical devices',
      'Generating deepfakes to deceive the public',
      'Translating languages to improve communication',
    ],
    correctIndex: 2,
    explanation:
      'Deepfakes can be used maliciously to impersonate people or spread misinformation, posing serious societal risks when misused.',
  },
  {
    prompt: 'Which approach helps improve model robustness and reduce overfitting?',
    options: [
      'Training and evaluating on the exact same examples only',
      'Using diverse datasets and validating on held-out data',
      'Increasing model size indefinitely',
      'Avoiding any evaluation because it introduces bias',
    ],
    correctIndex: 1,
    explanation:
      'Diverse, representative data and proper validation on held-out sets help ensure the model generalizes rather than memorizes.',
  },
  {
    prompt: 'What is a privacy-preserving technique in AI development?',
    options: [
      'Publishing raw user data for transparency',
      'Differential privacy or federated learning to protect individual data',
      'Storing all data forever in case it is needed later',
      'Ignoring privacy if the model is accurate',
    ],
    correctIndex: 1,
    explanation:
      'Techniques like differential privacy and federated learning help train useful models while minimizing risks to individual privacy.',
  },
  {
    prompt: 'What does "inference" mean in the context of ML models?',
    options: [
      'Collecting raw data from users',
      'Running a trained model to make predictions on new inputs',
      'Tuning hyperparameters during training',
      'Visualizing model architecture',
    ],
    correctIndex: 1,
    explanation:
      'Inference is the phase where a trained model is used to generate outputs (predictions) for new, unseen inputs.',
  },
  {
    prompt: 'Which metric is typically used to evaluate classification models?',
    options: [
      'Mean Squared Error',
      'Accuracy, precision, recall, or F1-score',
      'BLEU for all tasks',
      'PSNR exclusively',
    ],
    correctIndex: 1,
    explanation:
      'Classification tasks commonly use accuracy, precision, recall, F1-score, and AUC to assess performance.',
  },
  {
    prompt: 'What is the purpose of a validation dataset?',
    options: [
      'Training the final model parameters',
      'Tuning hyperparameters and preventing overfitting',
      'Decreasing dataset size',
      'Serving the model in production',
    ],
    correctIndex: 1,
    explanation:
      'Validation sets are used during development to select models and hyperparameters while avoiding overfitting.',
  },
  {
    prompt: 'Which of the following is an example of transparency in AI?',
    options: [
      'Withholding the data sources',
      'Providing model cards or documentation on limitations and intended use',
      'Obfuscating audit logs',
      'Only sharing marketing materials',
    ],
    correctIndex: 1,
    explanation:
      'Transparency includes documentation like model cards, data sheets, and clear disclosures about limitations and risks.',
  },
  {
    prompt: 'What is a common mitigation for dataset imbalance?',
    options: [
      'Ignoring minority classes',
      'Resampling, class weighting, or collecting more representative data',
      'Using a deeper network only',
      'Training longer without changes',
    ],
    correctIndex: 1,
    explanation:
      'Techniques like oversampling, undersampling, class weighting, and better data collection address class imbalance.',
  },
  {
    prompt: 'Which practice supports privacy-by-design?',
    options: [
      'Collect first, ask later',
      'Data minimization and explicit consent',
      'Unlimited retention without policy',
      'Sharing PII with third parties by default',
    ],
    correctIndex: 1,
    explanation:
      'Privacy-by-design emphasizes data minimization, informed consent, and strict retention/usage controls from the start.',
  },
  {
    prompt: 'What does "explainability" in AI refer to?',
    options: [
      'Making models faster',
      'Ability to make the model’s decisions understandable to humans',
      'Publishing training data',
      'Ensuring zero bias',
    ],
    correctIndex: 1,
    explanation:
      'Explainability focuses on helping humans understand why a model made a specific prediction or decision.',
  },
  {
    prompt: 'Which of these is an example of AI helping accessibility?',
    options: [
      'Text-to-speech for visually impaired users',
      'Advertising tracking',
      'Cryptocurrency mining',
      'CAPTCHA creation only',
    ],
    correctIndex: 0,
    explanation:
      'AI-powered text-to-speech, speech-to-text, and image descriptions improve accessibility for many users.',
  },
  {
    prompt: 'What is a model “hallucination” in generative AI?',
    options: [
      'When the model refuses to answer',
      'When the model outputs plausible-sounding but incorrect information',
      'When the server goes down',
      'When latency is high',
    ],
    correctIndex: 1,
    explanation:
      'Hallucinations occur when generative models produce confident but wrong or fabricated outputs.',
  },
  {
    prompt: 'Which control helps reduce misuse of generative models?',
    options: [
      'No content filters',
      'Safety policies, content filtering, and rate limits',
      'Unlimited anonymous access',
      'Removing logs and audits',
    ],
    correctIndex: 1,
    explanation:
      'Safety policies, filters, and monitoring reduce harmful outputs and enable responsible use.',
  },
  {
    prompt: 'Which learning paradigm does not require labeled data?',
    options: [
      'Supervised learning',
      'Unsupervised learning',
      'Reinforcement learning',
      'All require labels',
    ],
    correctIndex: 1,
    explanation:
      'Unsupervised learning discovers structure in unlabeled data (e.g., clustering, dimensionality reduction).',
  },
  {
    prompt: 'What is transfer learning?',
    options: [
      'Training from scratch without prior knowledge',
      'Reusing a model or its features for a related task',
      'A form of data encryption',
      'Only applicable to text',
    ],
    correctIndex: 1,
    explanation:
      'Transfer learning adapts pre-trained models or features to new tasks, often improving efficiency and performance.',
  },
  {
    prompt: 'Which is a sign of overfitting?',
    options: [
      'High training accuracy and low validation accuracy',
      'Low training and validation accuracy',
      'Equal performance on all sets',
      'Faster inference',
    ],
    correctIndex: 0,
    explanation:
      'Overfitting shows as excellent training performance but poor generalization to validation/test data.',
  },
  {
    prompt: 'What is the role of a confusion matrix?',
    options: [
      'Encrypt data',
      'Summarize classification performance across classes',
      'Optimize hyperparameters',
      'Measure latency',
    ],
    correctIndex: 1,
    explanation:
      'A confusion matrix breaks down correct and incorrect predictions per class, revealing error patterns.',
  },
  {
    prompt: 'Which statement about data labeling is true?',
    options: [
      'Labels are unnecessary for supervised learning',
      'Clear labeling guidelines improve quality and consistency',
      'More labelers always means better labels',
      'Labels cannot introduce bias',
    ],
    correctIndex: 1,
    explanation:
      'Good labeling instructions reduce ambiguity and bias, improving supervised learning quality.',
  },
  {
    prompt: 'What is reinforcement learning primarily concerned with?',
    options: [
      'Predicting labels directly from examples',
      'Learning to act via rewards and penalties over time',
      'Finding nearest neighbors',
      'Clustering documents',
    ],
    correctIndex: 1,
    explanation:
      'Reinforcement learning optimizes actions through trial-and-error guided by reward signals in an environment.',
  },
  {
    prompt: 'Which is a good practice for dataset governance?',
    options: [
      'No versioning or provenance',
      'Documenting sources, consent, and transformations',
      'Mixing sensitive data without controls',
      'Deleting metadata to simplify',
    ],
    correctIndex: 1,
    explanation:
      'Strong governance tracks data lineage, consent, and processing to ensure compliance and accountability.',
  },
  {
    prompt: 'What does model “drift” refer to?',
    options: [
      'Hardware instability',
      'Degradation in model performance due to changing data patterns',
      'Code refactoring',
      'Longer training',
    ],
    correctIndex: 1,
    explanation:
      'Drift happens when real-world data shifts, requiring monitoring and possibly retraining to maintain performance.',
  },
  {
    prompt: 'Which technique helps with interpretability of complex models?',
    options: [
      'LIME or SHAP explanations',
      'Batch normalization',
      'Dropout',
      'Label smoothing',
    ],
    correctIndex: 0,
    explanation:
      'LIME and SHAP provide local explanations of model predictions, improving interpretability.',
  },
  {
    prompt: 'What is the ethical concern with scraping personal data for training?',
    options: [
      'Improved accuracy',
      'Potential privacy violations and lack of consent',
      'Faster development only',
      'Better compression',
    ],
    correctIndex: 1,
    explanation:
      'Using personal data without consent can violate privacy laws and ethical norms.',
  },
  {
    prompt: 'What does a “model card” usually include?',
    options: [
      'Secret source code',
      'Intended use, limitations, performance, and ethical considerations',
      'Only marketing claims',
      'Private user data',
    ],
    correctIndex: 1,
    explanation:
      'Model cards document purpose, datasets, metrics, and known limitations to encourage responsible use.',
  },
  {
    prompt: 'Which area is NOT typically part of responsible AI?',
    options: [
      'Fairness and bias',
      'Safety and robustness',
      'Privacy and security',
      'Maximizing virality regardless of harm',
    ],
    correctIndex: 3,
    explanation:
      'Responsible AI prioritizes fairness, safety, privacy, and accountability—not harmful engagement tactics.',
  },
  {
    prompt: 'What is federated learning?',
    options: [
      'Centralizing all data on one server',
      'Training models across devices without moving raw data centrally',
      'Encrypting models post-training',
      'Only a UI concept',
    ],
    correctIndex: 1,
    explanation:
      'Federated learning keeps data on devices, sharing model updates instead to preserve privacy.',
  },
  {
    prompt: 'How can we detect bias during evaluation?',
    options: [
      'By ignoring subgroups',
      'By analyzing metrics across demographic or relevant subgroups',
      'By measuring latency only',
      'By using larger batch sizes',
    ],
    correctIndex: 1,
    explanation:
      'Slice performance by relevant cohorts to reveal disparities that aggregate metrics may hide.',
  },
  {
    prompt: 'Which is a realistic expectation of current AI systems?',
    options: [
      'Perfect accuracy on all tasks',
      'Helpful assistance with limitations, not human-level general intelligence',
      'True consciousness',
      'Zero error rate in open-world settings',
    ],
    correctIndex: 1,
    explanation:
      'Modern AI can be highly capable in narrow tasks but has limitations and is not generally intelligent or conscious.',
  },
  {
    prompt: 'What is data anonymization intended to do?',
    options: [
      'Make data faster to query',
      'Remove or obfuscate personally identifiable information',
      'Increase storage costs',
      'Guarantee zero re-identification risk in all cases',
    ],
    correctIndex: 1,
    explanation:
      'Anonymization reduces identifiability, but must be applied carefully; some re-identification risks can remain.',
  },
  {
    prompt: 'What is the main goal of adversarial testing?',
    options: [
      'Speeding up training',
      'Probing models with challenging or harmful inputs to find weaknesses',
      'Compressing models',
      'Collecting more labels',
    ],
    correctIndex: 1,
    explanation:
      'Adversarial testing stresses models to uncover failure modes and improve safety and robustness.',
  },
  {
    prompt: 'Which practice supports accountability in AI systems?',
    options: [
      'No logging of decisions',
      'Clear audit trails and human oversight',
      'Deleting model versions',
      'Anonymous ownership',
    ],
    correctIndex: 1,
    explanation:
      'Accountability requires traceability, oversight, and clear responsibility for model behavior and changes.',
  },
  {
    prompt: 'What is a potential environmental concern with training large models?',
    options: [
      'Reduced accuracy',
      'High energy consumption and carbon footprint',
      'Lower latency',
      'Improved fairness automatically',
    ],
    correctIndex: 1,
    explanation:
      'Large-scale training can consume significant energy; efficiency and offsets help reduce impact.',
  },
  {
    prompt: 'How can users be informed about model limitations?',
    options: [
      'No warnings needed',
      'UX affordances like notices, examples, and safe-use guidelines',
      'Hide errors',
      'Only in internal docs',
    ],
    correctIndex: 1,
    explanation:
      'Clear UI messaging and examples help set expectations and guide safe, effective use.',
  },
];

const Quiz: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);

  const total = sessionQuestions.length;
  const current = sessionQuestions[currentIndex];
  const percent = useMemo(() => Math.round(((currentIndex) / total) * 100), [currentIndex, total]);

  useEffect(() => {
    if (isFinished) return;
    setTimeLeft(15);
  }, [currentIndex, isFinished]);

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

  function startQuiz() {
  setSessionQuestions(sampleQuestions(5));
  setCurrentIndex(0);
  setSelectedIndex(null);
  setIsAnswered(false);
  setScore(0);
  setIsFinished(false);
  setTimeLeft(15);
  setHasStarted(true);
}

  function handleSelect(optionIndex: number) {
    if (isAnswered) return;
    setSelectedIndex(optionIndex);
  }

  function submitAnswer() {
    if (isAnswered || selectedIndex === null) return;
    const isCorrect = selectedIndex === current.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setIsAnswered(true);
  }

  function nextQuestion() {
    if (!isAnswered) return;
    const next = currentIndex + 1;
    if (next >= total) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex(next);
    setSelectedIndex(null);
    setIsAnswered(false);
  }

  function handleTimeout() {
    if (isAnswered) return;
    const next = currentIndex + 1;
    if (next >= total) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex(next);
    setSelectedIndex(null);
    setIsAnswered(false);
  }

  function restart() {
  setHasStarted(false);
  setSessionQuestions([]);
  setCurrentIndex(0);
  setSelectedIndex(null);
  setIsAnswered(false);
  setScore(0);
  setIsFinished(false);
  setTimeLeft(15);
}

if (!hasStarted) {
  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8">
        <h1 className="text-4xl font-extrabold text-center mb-4 text-primary">
          AI Awareness Quiz
        </h1>

        <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
          Read the instructions carefully before starting.
        </p>

        <div className="space-y-3 text-gray-800 dark:text-gray-100">
          <p>📌 Total Questions: <strong>5</strong></p>
          <p>⏱ Time per Question: <strong>15 seconds</strong></p>
          <p>✅ Each question has only one correct answer</p>
          <p>📖 Explanation will be shown after each answer</p>
          <p>⚠ If time runs out, the question will be skipped</p>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={startQuiz}
            className="bg-primary hover:bg-primary-focus text-white font-semibold px-10 py-3 rounded-lg text-lg"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="container mx-auto max-w-3xl p-4">
      <div className="text-center p-6">
        <h1 className="text-4xl font-extrabold mb-2 text-primary tracking-tight">AI Awareness Quiz</h1>
        <p className="text-gray-600 dark:text-gray-400">Learn by doing: each answer shows an explanation.</p>
      </div>

      {!isFinished && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span>Question {currentIndex + 1} of {total}</span>
            <span className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100">{timeLeft}</span>
              <span>Score: {score}</span>
            </span>
          </div>
        </div>
      )}

      {!isFinished ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{current.prompt}</h2>
          <div className="space-y-3">
            {current.options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = idx === current.correctIndex;
              const showState = isAnswered && (isSelected || isCorrect);
              const base = 'w-full text-left px-4 py-3 rounded-lg border transition-colors';
              const idle = 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700';
              const selected = 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-400';
              const correct = 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-400';
              const wrong = 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-400';
              let cls = `${base} ${isSelected ? selected : idle}`;
              if (isAnswered && isSelected) cls = `${base} ${isCorrect ? correct : wrong}`;
              if (isAnswered && !isSelected && isCorrect) cls = `${base} ${correct}`;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  className={cls}
                >
                  <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-3">
            {!isAnswered ? (
              <button
                onClick={submitAnswer}
                disabled={selectedIndex === null}
                className={`w-full md:w-auto bg-primary hover:bg-primary-focus text-white font-semibold px-6 py-3 rounded-lg ${selectedIndex === null ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="w-full md:w-auto bg-primary hover:bg-primary-focus text-white font-semibold px-6 py-3 rounded-lg"
              >
                {currentIndex + 1 === total ? 'Finish Quiz' : 'Next Question'}
              </button>
            )}

            <button
              onClick={restart}
              className="w-full md:w-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold px-6 py-3 rounded-lg"
            >
              Restart
            </button>
          </div>

          {isAnswered && (
            <div className="mt-6 p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
              <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Explanation</p>
              <p className="text-gray-800 dark:text-gray-100">{current.explanation}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Complete</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">You scored {score} out of {total}.</p>
          <button
            onClick={restart}
            className="bg-primary hover:bg-primary-focus text-white font-semibold px-8 py-3 rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;

function shuffleArray<T>(input: T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function sampleQuestions(count: number): Question[] {
  const shuffled = shuffleArray(AI_QUESTIONS);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}