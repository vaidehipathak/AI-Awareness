export type Difficulty = 'easy' | 'medium' | 'hard';

export type Question = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  questions: Question[];
};

// Base catalog used by the learner experience. Each quiz has exactly 5 questions.
export const quizCatalog: Record<Difficulty, Quiz[]> = {
  easy: [
    {
      id: 'easy-01',
      title: 'AI Basics: Terminology',
      description: 'Quick check on core AI words everyone should know.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'What does AI stand for?',
          options: ['Artificial Intelligence', 'Augmented Internet', 'Automated Interface', 'Advanced Integration'],
          correctIndex: 0,
          explanation: 'AI is short for Artificial Intelligence.'
        },
        {
          prompt: 'Which is an example of “narrow AI”?',
          options: ['A chess engine', 'A general problem solver', 'A human brain', 'A quantum computer'],
          correctIndex: 0,
          explanation: 'Narrow AI is built for a specific task, like playing chess.'
        },
        {
          prompt: 'Which field focuses on training models from data?',
          options: ['Machine Learning', 'Web Development', 'Networking', 'Computer Graphics'],
          correctIndex: 0,
          explanation: 'Machine Learning trains models on data to make predictions or decisions.'
        },
        {
          prompt: 'What is a dataset?',
          options: ['A collection of data points', 'A model output', 'A programming language', 'A database password'],
          correctIndex: 0,
          explanation: 'A dataset is an organized collection of data points used for training or evaluation.'
        },
        {
          prompt: 'Which task is most associated with computer vision?',
          options: ['Image classification', 'Audio mixing', 'Packet routing', 'Compiler design'],
          correctIndex: 0,
          explanation: 'Computer vision models often perform image classification.'
        }
      ]
    },
    {
      id: 'easy-02',
      title: 'Data vs. Model',
      description: 'Distinguish training data from the model that learns from it.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'What does the model learn from?',
          options: ['Training data', 'Production logs only', 'Random numbers', 'Compiled binaries'],
          correctIndex: 0,
          explanation: 'Models learn patterns from labeled or unlabeled training data.'
        },
        {
          prompt: 'What do we call the step where a trained model is used to make predictions?',
          options: ['Inference', 'Compilation', 'Transpilation', 'Encryption'],
          correctIndex: 0,
          explanation: 'Inference is using a trained model to produce outputs from new inputs.'
        },
        {
          prompt: 'Which is true about training data quality?',
          options: ['Better data improves model performance', 'Data quality does not matter', 'Only model size matters', 'Random labels help generalization'],
          correctIndex: 0,
          explanation: 'High-quality data directly influences model performance and fairness.'
        },
        {
          prompt: 'A “label” in supervised learning is…',
          options: ['The correct answer for an input', 'A server name', 'A secret key', 'A deployment region'],
          correctIndex: 0,
          explanation: 'Labels are the ground-truth outputs paired with inputs during training.'
        },
        {
          prompt: 'What stores the learned parameters of a model?',
          options: ['Model file/checkpoint', 'CSS stylesheet', 'Network switch', 'Browser cache'],
          correctIndex: 0,
          explanation: 'Weights/parameters are stored in the model file or checkpoint.'
        }
      ]
    },
    {
      id: 'easy-03',
      title: 'Training vs. Inference',
      description: 'Understand the two big phases of ML systems.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'Which phase is typically more compute-intensive?',
          options: ['Training', 'Inference', 'Data labeling', 'Logging'],
          correctIndex: 0,
          explanation: 'Training generally requires more compute than inference.'
        },
        {
          prompt: 'Which phase happens repeatedly for every user request?',
          options: ['Inference', 'Model architecture search', 'Hyperparameter tuning', 'Data collection'],
          correctIndex: 0,
          explanation: 'Inference runs on each request to generate outputs.'
        },
        {
          prompt: 'Which phrase describes “fine-tuning”?',
          options: ['Training an existing model further on new data', 'Resetting model weights', 'Encrypting outputs', 'Deleting logs'],
          correctIndex: 0,
          explanation: 'Fine-tuning continues training a pre-trained model on task-specific data.'
        },
        {
          prompt: 'During inference, weights are…',
          options: ['Frozen/read-only', 'Updated every request', 'Randomized each call', 'Downloaded from users'],
          correctIndex: 0,
          explanation: 'Inference uses fixed weights; they are not updated per request.'
        },
        {
          prompt: 'Which environment should be monitored for latency?',
          options: ['Inference serving environment', 'Code editor', 'Static website hosting', 'Email server only'],
          correctIndex: 0,
          explanation: 'Inference latency affects user experience and must be monitored.'
        }
      ]
    },
    {
      id: 'easy-04',
      title: 'Common AI Tasks',
      description: 'Know the classic ML task categories.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'Predicting spam vs. not spam is a…',
          options: ['Classification task', 'Regression task', 'Clustering task', 'Rendering task'],
          correctIndex: 0,
          explanation: 'Spam detection is a binary classification problem.'
        },
        {
          prompt: 'Predicting house prices is usually…',
          options: ['Regression', 'Classification', 'Segmentation', 'Hashing'],
          correctIndex: 0,
          explanation: 'Prices are continuous values, so it is regression.'
        },
        {
          prompt: 'Grouping customers by behavior without labels is…',
          options: ['Clustering', 'Supervised learning', 'Reinforcement learning', 'Dimensionality reduction'],
          correctIndex: 0,
          explanation: 'Clustering finds natural groupings without labels.'
        },
        {
          prompt: 'Which task fits “translate English to French”?',
          options: ['Sequence-to-sequence', 'Image segmentation', 'K-means', 'Linear regression'],
          correctIndex: 0,
          explanation: 'Machine translation is often modeled as sequence-to-sequence.'
        },
        {
          prompt: 'Which task fits “find objects in a photo”?',
          options: ['Object detection', 'Topic modeling', 'Anomaly scoring', 'Sorting'],
          correctIndex: 0,
          explanation: 'Object detection localizes and classifies objects in images.'
        }
      ]
    },
    {
      id: 'easy-05',
      title: 'Inputs and Outputs',
      description: 'Make sure input/output expectations are clear.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'Text generation models expect…',
          options: ['Text tokens as input', 'Raw images only', 'Executable binaries', 'SQL schemas'],
          correctIndex: 0,
          explanation: 'Language models consume tokenized text.'
        },
        {
          prompt: 'Image classifiers output…',
          options: ['Class probabilities or labels', 'Source code', 'Video streams', 'Network packets'],
          correctIndex: 0,
          explanation: 'They output predicted classes or probabilities.'
        },
        {
          prompt: 'Audio speech-to-text outputs…',
          options: ['Transcribed text', 'Pixel arrays', 'Database migrations', '3D meshes'],
          correctIndex: 0,
          explanation: 'ASR models output textual transcripts.'
        },
        {
          prompt: 'A recommender system output is…',
          options: ['Ranked item suggestions', 'CPU temperature', 'Network topology', 'Browser version'],
          correctIndex: 0,
          explanation: 'Recommenders return ranked items to show users.'
        },
        {
          prompt: 'Which input best fits a sentiment model?',
          options: ['A product review text', 'A road map image', 'An IP packet', 'A keyboard layout'],
          correctIndex: 0,
          explanation: 'Sentiment models read text like product reviews.'
        }
      ]
    },
    {
      id: 'easy-06',
      title: 'ML Pipeline Steps',
      description: 'Recall the standard stages of an ML project.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'Which comes first in a typical pipeline?',
          options: ['Data collection', 'Model deployment', 'A/B test', 'Monitoring'],
          correctIndex: 0,
          explanation: 'Data collection precedes training and deployment.'
        },
        {
          prompt: 'Feature engineering means…',
          options: ['Transforming raw data into model-ready features', 'Building UI layouts', 'Writing API docs', 'Scaling servers'],
          correctIndex: 0,
          explanation: 'Feature engineering prepares data for models.'
        },
        {
          prompt: 'Validation data is used to…',
          options: ['Tune hyperparameters', 'Train the model', 'Serve users directly', 'Store secrets'],
          correctIndex: 0,
          explanation: 'Validation sets help tune and select models.'
        },
        {
          prompt: 'A/B tests compare…',
          options: ['Two variants to measure impact', 'CPU vs. GPU prices', 'Data schemas', 'Keyboard shortcuts'],
          correctIndex: 0,
          explanation: 'A/B testing evaluates variants to pick the better performer.'
        },
        {
          prompt: 'Monitoring in production checks…',
          options: ['Latency, errors, drift', 'IDE themes', 'Wi-Fi passwords', 'USB drivers'],
          correctIndex: 0,
          explanation: 'Production monitoring tracks metrics like latency, errors, and data drift.'
        }
      ]
    },
    {
      id: 'easy-07',
      title: 'Bias Basics',
      description: 'Spot simple examples of bias and imbalance.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'Dataset bias can happen when…',
          options: ['One group is underrepresented', 'Data is balanced', 'Labels are perfect', 'Model is small'],
          correctIndex: 0,
          explanation: 'Underrepresentation creates bias in model predictions.'
        },
        {
          prompt: 'Which is a mitigation step?',
          options: ['Rebalancing or reweighting data', 'Ignoring the issue', 'Removing evaluation', 'Shortening prompts only'],
          correctIndex: 0,
          explanation: 'Rebalancing helps address dataset bias.'
        },
        {
          prompt: 'Why do we measure fairness?',
          options: ['To detect unequal performance across groups', 'To change UI colors', 'To increase CPU fans', 'To compress images'],
          correctIndex: 0,
          explanation: 'Fairness metrics show whether groups receive similar performance.'
        },
        {
          prompt: '“Sampling bias” refers to…',
          options: ['Non-representative data collection', 'Model weights drift', 'Server crash', 'Correct labels everywhere'],
          correctIndex: 0,
          explanation: 'Sampling bias arises from non-representative samples.'
        },
        {
          prompt: 'Which reduces stereotype amplification?',
          options: ['Careful prompt design and balanced examples', 'Removing logging', 'Shorter training time', 'Larger batch size only'],
          correctIndex: 0,
          explanation: 'Balanced data and careful prompts help reduce stereotypes.'
        }
      ]
    },
    {
      id: 'easy-08',
      title: 'Safety Basics',
      description: 'Recognize simple safety controls.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'Why add content filters?',
          options: ['To block unsafe outputs', 'To speed up GPUs', 'To minify CSS', 'To compress images'],
          correctIndex: 0,
          explanation: 'Filters reduce unsafe or policy-violating outputs.'
        },
        {
          prompt: 'Rate limiting helps…',
          options: ['Prevent abuse or overload', 'Increase latency', 'Hide logs', 'Change labels'],
          correctIndex: 0,
          explanation: 'Rate limits protect systems from abuse and overload.'
        },
        {
          prompt: 'Human-in-the-loop means…',
          options: ['Humans review or override model decisions', 'Models manage servers', 'Data deletes humans', 'GPU auto-scaling'],
          correctIndex: 0,
          explanation: 'Humans review, approve, or correct model outputs in critical flows.'
        },
        {
          prompt: 'Which is a safe default on error?',
          options: ['Fail closed / deny risky action', 'Proceed silently', 'Return random data', 'Disable logging'],
          correctIndex: 0,
          explanation: 'Failing closed avoids unsafe actions when uncertain.'
        },
        {
          prompt: 'Logging moderation events is useful for…',
          options: ['Auditing and improvements', 'Slowing products', 'Marketing only', 'GPU cooling'],
          correctIndex: 0,
          explanation: 'Logs support audits and iteration on safety systems.'
        }
      ]
    },
    {
      id: 'easy-09',
      title: 'Privacy Basics',
      description: 'Simple privacy hygiene for AI systems.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'PII stands for…',
          options: ['Personally Identifiable Information', 'Public Internet Interface', 'Program Initialization Instruction', 'Parallel Input Indicator'],
          correctIndex: 0,
          explanation: 'PII means Personally Identifiable Information.'
        },
        {
          prompt: 'Good practice for PII is…',
          options: ['Mask or tokenize it', 'Log it in plaintext', 'Share widely', 'Keep forever without need'],
          correctIndex: 0,
          explanation: 'Masking/tokenizing reduces exposure of PII.'
        },
        {
          prompt: 'Which data should NOT be used without consent?',
          options: ['Sensitive personal data', 'Open public datasets', 'Synthetic data', 'Test strings'],
          correctIndex: 0,
          explanation: 'Sensitive personal data requires consent and safeguards.'
        },
        {
          prompt: 'Data minimization means…',
          options: ['Collect only what is needed', 'Collect everything', 'Disable deletion', 'Duplicate logs'],
          correctIndex: 0,
          explanation: 'Minimization limits collection to what is necessary.'
        },
        {
          prompt: 'Secure transport for APIs uses…',
          options: ['HTTPS/TLS', 'Plain HTTP', 'FTP', 'Unencrypted UDP'],
          correctIndex: 0,
          explanation: 'HTTPS/TLS encrypts data in transit.'
        }
      ]
    },
    {
      id: 'easy-10',
      title: 'Metrics Basics',
      description: 'Know common evaluation metrics.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'Accuracy measures…',
          options: ['Correct predictions over all predictions', 'Inference latency', 'GPU memory', 'Dataset size'],
          correctIndex: 0,
          explanation: 'Accuracy is correct predictions divided by total predictions.'
        },
        {
          prompt: 'Precision focuses on…',
          options: ['How many predicted positives are correct', 'All negatives', 'Runtime cost', 'Storage space'],
          correctIndex: 0,
          explanation: 'Precision is correct positives over all predicted positives.'
        },
        {
          prompt: 'Recall focuses on…',
          options: ['How many actual positives were found', 'Only negatives', 'GPU usage', 'Prompt length'],
          correctIndex: 0,
          explanation: 'Recall is found positives over all actual positives.'
        },
        {
          prompt: 'F1 score is…',
          options: ['Harmonic mean of precision and recall', 'Average latency', 'Sum of parameters', 'Max token length'],
          correctIndex: 0,
          explanation: 'F1 combines precision and recall via the harmonic mean.'
        },
        {
          prompt: 'For ranking tasks, a common metric is…',
          options: ['NDCG or MAP', 'CPU clock speed', 'FPS', 'Heat output'],
          correctIndex: 0,
          explanation: 'Ranking tasks use metrics like NDCG or MAP.'
        }
      ]
    },
    {
      id: 'easy-11',
      title: 'Overfitting vs Underfitting',
      description: 'Identify basic model fitting problems.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'Overfitting means…',
          options: ['Great on training, poor on new data', 'Great on all data', 'Poor on training but great on test', 'No learning happened'],
          correctIndex: 0,
          explanation: 'Overfitting memorizes training data and fails to generalize.'
        },
        {
          prompt: 'Underfitting means…',
          options: ['Model is too simple to learn patterns', 'Model memorized everything', 'Too many parameters', 'Perfect generalization'],
          correctIndex: 0,
          explanation: 'Underfitting fails to capture underlying structure.'
        },
        {
          prompt: 'A fix for overfitting is…',
          options: ['Regularization or more data', 'Less validation', 'More logging only', 'Longer prompts'],
          correctIndex: 0,
          explanation: 'Regularization and more diverse data help combat overfitting.'
        },
        {
          prompt: 'Early stopping helps because…',
          options: ['It halts before overfitting worsens', 'It speeds GPUs', 'It removes labels', 'It disables monitoring'],
          correctIndex: 0,
          explanation: 'Early stopping stops training when validation performance degrades.'
        },
        {
          prompt: 'Cross-validation is used to…',
          options: ['Assess generalization across folds', 'Shorten prompts', 'Encrypt data', 'Resize images'],
          correctIndex: 0,
          explanation: 'Cross-validation tests model performance across data splits.'
        }
      ]
    },
    {
      id: 'easy-12',
      title: 'Learning Paradigms',
      description: 'Supervised, unsupervised, and reinforcement basics.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'Supervised learning uses…',
          options: ['Labeled data', 'No data', 'Only rewards', 'Only random noise'],
          correctIndex: 0,
          explanation: 'Supervised learning needs labeled examples.'
        },
        {
          prompt: 'Unsupervised learning uses…',
          options: ['Unlabeled data', 'Only labels', 'Rewards and states', 'Compiled code'],
          correctIndex: 0,
          explanation: 'Unsupervised learning finds structure in unlabeled data.'
        },
        {
          prompt: 'Reinforcement learning uses…',
          options: ['Rewards and actions over time', 'Static labels only', 'Image pixels only', 'SQL queries'],
          correctIndex: 0,
          explanation: 'RL optimizes actions based on reward signals.'
        },
        {
          prompt: 'Clustering is typically…',
          options: ['Unsupervised', 'Supervised', 'RL-only', 'Symbolic'],
          correctIndex: 0,
          explanation: 'Clustering is an unsupervised task.'
        },
        {
          prompt: 'Image classification with labels is…',
          options: ['Supervised learning', 'Unsupervised', 'RL', 'Meta-learning'],
          correctIndex: 0,
          explanation: 'Labeled image classification is supervised.'
        }
      ]
    },
    {
      id: 'easy-13',
      title: 'Prompting Basics',
      description: 'Core ideas for prompting language models.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'A prompt is…',
          options: ['Input text given to a language model', 'GPU clock speed', 'Dataset license', 'CSS selector'],
          correctIndex: 0,
          explanation: 'A prompt is the input text that guides the model.'
        },
        {
          prompt: 'Better prompts often include…',
          options: ['Clear instructions and examples', 'Random words', 'IP addresses', 'Binary headers'],
          correctIndex: 0,
          explanation: 'Clarity and examples improve prompt outcomes.'
        },
        {
          prompt: 'Few-shot prompting means…',
          options: ['Providing a few examples in the prompt', 'Zero inputs', 'Hundreds of labels', 'Training from scratch'],
          correctIndex: 0,
          explanation: 'Few-shot prompts include a few demonstrations.'
        },
        {
          prompt: 'Temperature in decoding controls…',
          options: ['Randomness in sampling', 'GPU heat', 'Network latency', 'Training speed'],
          correctIndex: 0,
          explanation: 'Higher temperature increases randomness in text generation.'
        },
        {
          prompt: 'A system prompt is used to…',
          options: ['Set overall assistant behavior', 'Resize images', 'Store API keys', 'Compile code'],
          correctIndex: 0,
          explanation: 'System prompts steer the model’s role and constraints.'
        }
      ]
    },
    {
      id: 'easy-14',
      title: 'Deployment Basics',
      description: 'Know where models can run.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'Running models on user devices is called…',
          options: ['Edge deployment', 'Cloud training', 'Data warehousing', 'Firmware flashing'],
          correctIndex: 0,
          explanation: 'On-device inference is edge deployment.'
        },
        {
          prompt: 'Cloud inference benefits include…',
          options: ['Scalability and managed hardware', 'No latency ever', 'Zero cost always', 'No security needs'],
          correctIndex: 0,
          explanation: 'Cloud offers scale and managed compute.'
        },
        {
          prompt: 'Model quantization mainly helps…',
          options: ['Reduce size and speed up inference', 'Change labels', 'Collect more data', 'Rewrite UI'],
          correctIndex: 0,
          explanation: 'Quantization reduces precision to improve speed/size.'
        },
        {
          prompt: 'Caching model responses can…',
          options: ['Lower latency and cost for repeats', 'Increase GPU heat', 'Hide bugs', 'Replace training'],
          correctIndex: 0,
          explanation: 'Caching saves compute for repeated queries.'
        },
        {
          prompt: 'Blue/green deploys are used to…',
          options: ['Swap traffic between old/new versions safely', 'Compress data', 'Encrypt disks', 'Tokenize PII'],
          correctIndex: 0,
          explanation: 'Blue/green strategies shift traffic gradually to new versions.'
        }
      ]
    },
    {
      id: 'easy-15',
      title: 'Responsible AI Basics',
      description: 'Grounding in transparency and accountability.',
      difficulty: 'easy',
      questions: [
        {
          prompt: 'Model cards are used to…',
          options: ['Document model behavior and limits', 'Render HTML', 'Compress images', 'Tune GPUs'],
          correctIndex: 0,
          explanation: 'Model cards describe intended use, data, and limitations.'
        },
        {
          prompt: 'Transparency helps users…',
          options: ['Understand capabilities and risks', 'Bypass security', 'Slow the UI', 'Reduce accuracy'],
          correctIndex: 0,
          explanation: 'Transparency builds trust by explaining model limits and uses.'
        },
        {
          prompt: 'Accountability means…',
          options: ['Clear ownership of outcomes', 'No logging', 'Anonymous deployments', 'Unlimited access'],
          correctIndex: 0,
          explanation: 'Accountability assigns responsibility for decisions and impacts.'
        },
        {
          prompt: 'Human oversight is important because…',
          options: ['Models can be wrong or biased', 'It removes users', 'It speeds compilation', 'It removes costs'],
          correctIndex: 0,
          explanation: 'Oversight catches errors and bias before harm.'
        },
        {
          prompt: 'Publishing limitations helps…',
          options: ['Prevent misuse and set expectations', 'Guarantee perfection', 'Replace QA', 'Remove need for consent'],
          correctIndex: 0,
          explanation: 'Stating limitations guides safe, appropriate use.'
        }
      ]
    }
  ],
  medium: [
    {
      id: 'medium-01',
      title: 'Applying Models to Products',
      description: 'Scenario-based application of a model into a feature.',
      difficulty: 'medium',
      questions: [
        {
          prompt: 'You add an LLM to draft email replies. What is the safest default action?',
          options: ['Require user review before sending', 'Send automatically', 'Bypass logging', 'Skip rate limits'],
          correctIndex: 0,
          explanation: 'Keep humans in the loop; drafts should be reviewed before sending.'
        },
        {
          prompt: 'A generative model sometimes produces off-brand tone. What do you add?',
          options: ['Style guide and examples in the prompt', 'Higher temperature', 'Longer outputs only', 'Disable content filters'],
          correctIndex: 0,
          explanation: 'Include brand style constraints and examples to steer tone.'
        },
        {
          prompt: 'You need latency under 200 ms. What helps most?',
          options: ['Smaller/quantized model or caching', 'Higher temperature', 'More stop words', 'Random delays'],
          correctIndex: 0,
          explanation: 'Use smaller/optimized models or cache frequent prompts to cut latency.'
        },
        {
          prompt: 'To prevent prompt injection in templates, you should…',
          options: ['Separate system instructions from user content', 'Merge everything', 'Disable escaping', 'Trust any URL'],
          correctIndex: 0,
          explanation: 'Keep system prompts isolated and sanitize user content to resist injection.'
        },
        {
          prompt: 'To evaluate the feature before launch, you run…',
          options: ['Offline evals plus targeted user tests', 'No tests', 'Prod-only release', 'GPU burn-in'],
          correctIndex: 0,
          explanation: 'Offline evals and controlled tests validate quality and safety before launch.'
        }
      ]
    },
    {
      id: 'medium-02',
      title: 'Data Labeling & Quality',
      description: 'Operational questions on labeling and QA.',
      difficulty: 'medium',
      questions: [
        {
          prompt: 'Inter-annotator agreement is used to…',
          options: ['Measure label consistency', 'Speed up GPUs', 'Pick deployment regions', 'Encrypt storage'],
          correctIndex: 0,
          explanation: 'Agreement metrics show if labelers are consistent.'
        },
        {
          prompt: 'Gold labels in a batch are for…',
          options: ['Quality control checks', 'Longer context', 'UI layout', 'Network routing'],
          correctIndex: 0,
          explanation: 'Gold questions test annotator quality during labeling.'
        },
        {
          prompt: 'Handling ambiguous items should…',
          options: ['Include clear guidelines or allow “cannot determine”', 'Force a guess', 'Drop all items', 'Hide from review'],
          correctIndex: 0,
          explanation: 'Guidelines and escape hatches improve label quality on ambiguities.'
        },
        {
          prompt: 'To reduce bias in labels, you…',
          options: ['Train labelers with examples covering groups', 'Hide instructions', 'Shorten timelines only', 'Ignore feedback'],
          correctIndex: 0,
          explanation: 'Inclusive instructions and examples reduce biased labeling.'
        },
        {
          prompt: 'You discover mislabeled data in training. Best next step?',
          options: ['Fix labels and retrain/finetune', 'Ignore it', 'Ship immediately', 'Disable monitoring'],
          correctIndex: 0,
          explanation: 'Correct labels and retrain to avoid propagating errors.'
        }
      ]
    },
    {
      id: 'medium-03',
      title: 'Bias & Fairness in Practice',
      description: 'Scenario reasoning on fairness impacts.',
      difficulty: 'medium',
      questions: [
        {
          prompt: 'A loan model under-approves a subgroup. First diagnostic?',
          options: ['Measure group-wise approval and error rates', 'Ship anyway', 'Hide metrics', 'Add random noise'],
          correctIndex: 0,
          explanation: 'Check performance per group to confirm disparity.'
        },
        {
          prompt: 'You lack labels for group membership. A mitigation is…',
          options: ['Use proxy fairness tests (e.g., geographic), or seek consented labels', 'Ignore fairness', 'Assume balance', 'Remove evaluations'],
          correctIndex: 0,
          explanation: 'Use proxies or obtain consented labels to assess fairness.'
        },
        {
          prompt: 'To reduce disparity after finding bias, you might…',
          options: ['Reweigh data or adjust decision thresholds', 'Lower logging', 'Shorten prompts', 'Disable audits'],
          correctIndex: 0,
          explanation: 'Reweighting or threshold adjustments can reduce measured disparity.'
        },
        {
          prompt: 'Why include stakeholder review for fairness changes?',
          options: ['To ensure impacted groups are considered', 'To slow shipping', 'To change UI colors', 'To increase latency'],
          correctIndex: 0,
          explanation: 'Stakeholder input ensures changes respect impacted groups.'
        },
        {
          prompt: 'An upstream data shift changes demographics. What to do?',
          options: ['Re-evaluate fairness metrics and retrain if needed', 'Ignore it', 'Delete alerts', 'Only change the favicon'],
          correctIndex: 0,
          explanation: 'Monitor shifts and re-evaluate fairness; retrain if necessary.'
        }
      ]
    },
    {
      id: 'medium-04',
      title: 'Prompt Engineering Scenarios',
      description: 'Use cases for controlling LLM outputs.',
      difficulty: 'medium',
      questions: [
        {
          prompt: 'User-provided text appears inside your system prompt. Risk?',
          options: ['Prompt injection or instruction hijack', 'Lower latency', 'Better accuracy automatically', 'No effect'],
          correctIndex: 0,
          explanation: 'Mixing untrusted text into instructions can enable prompt injection.'
        },
        {
          prompt: 'To extract structured fields reliably, you…',
          options: ['Ask for JSON with a schema and validate', 'Rely on freeform text', 'Remove validation', 'Disable parsing'],
          correctIndex: 0,
          explanation: 'Request JSON per schema and validate to ensure structure.'
        },
        {
          prompt: 'Hallucinations increase when…',
          options: ['Prompts are vague and under-specified', 'You add citations', 'You add retrieval', 'You lower temperature and add constraints'],
          correctIndex: 0,
          explanation: 'Vague prompts lead to hallucinated content.'
        },
        {
          prompt: 'A retrieval-augmented prompt should…',
          options: ['Separate context from instructions and cite sources', 'Hide context length', 'Ignore recency', 'Remove grounding text'],
          correctIndex: 0,
          explanation: 'Clear separation and citing sources improve grounded answers.'
        },
        {
          prompt: 'To reduce jailbreaks you can…',
          options: ['Layer system prompts with moderation and output checks', 'Raise temperature', 'Disable filters', 'Expose internal keys'],
          correctIndex: 0,
          explanation: 'Defense-in-depth reduces jailbreak success.'
        }
      ]
    },
    {
      id: 'medium-05',
      title: 'Evaluation Strategy',
      description: 'Practical evaluation planning.',
      difficulty: 'medium',
      questions: [
        {
          prompt: 'You need reproducible LLM evals. You should…',
          options: ['Fix seeds/decoding params and use the same test set', 'Vary temperature wildly', 'Change context length each run', 'Skip regression tests'],
          correctIndex: 0,
          explanation: 'Keep evaluation settings stable to compare runs.'
        },
        {
          prompt: 'Human eval is useful when…',
          options: ['Quality is subjective (helpfulness, tone)', 'Metrics already perfect', 'Latency is only concern', 'No instructions exist'],
          correctIndex: 0,
          explanation: 'Humans assess subjective qualities like helpfulness and tone.'
        },
        {
          prompt: 'For safety evals you include…',
          options: ['Adversarial and policy-violating prompts', 'Only happy path prompts', 'No logging', 'UI screenshots'],
          correctIndex: 0,
          explanation: 'Safety evals need adversarial and policy-relevant test cases.'
        },
        {
          prompt: 'Regression suites help by…',
          options: ['Catching quality drops after changes', 'Speeding GPUs', 'Reducing tokens', 'Replacing monitoring'],
          correctIndex: 0,
          explanation: 'Regression suites detect quality regressions after updates.'
        },
        {
          prompt: 'When metrics disagree with user feedback, you…',
          options: ['Investigate sampling, labels, and metric choice', 'Ignore users', 'Ship immediately', 'Turn off metrics'],
          correctIndex: 0,
          explanation: 'Investigate the mismatch; adjust metrics or data if needed.'
        }
      ]
    },
    {
      id: 'medium-06',
      title: 'Monitoring & Drift',
      description: 'Operate models under change.',
      difficulty: 'medium',
      questions: [
        {
          prompt: 'Data drift means…',
          options: ['Input distribution changes over time', 'GPU overheats', 'Prompt is longer', 'UI color changes'],
          correctIndex: 0,
          explanation: 'Drift is a change in data distribution versus training data.'
        },
        {
          prompt: 'A leading indicator of drift is…',
          options: ['Sudden shift in feature statistics', 'Stable metrics', 'Consistent latency', 'Unchanged schemas'],
          correctIndex: 0,
          explanation: 'Feature statistic shifts warn of drift.'
        },
        {
          prompt: 'To monitor LLM quality you can…',
          options: ['Collect ratings/flags and sample human review', 'Disable feedback', 'Ignore logs', 'Change fonts'],
          correctIndex: 0,
          explanation: 'User ratings and flagged outputs support quality monitoring.'
        },
        {
          prompt: 'Shadow mode helps by…',
          options: ['Testing a new model without affecting users', 'Halting old model', 'Raising temperature', 'Removing metrics'],
          correctIndex: 0,
          explanation: 'Shadow mode runs new models alongside old ones to compare safely.'
        },
        {
          prompt: 'If drift is confirmed, you…',
          options: ['Retrain/refresh data or adjust prompts', 'Ignore it', 'Only change fonts', 'Stop monitoring'],
          correctIndex: 0,
          explanation: 'Respond to drift with updated data or model adjustments.'
        }
      ]
    },
    {
      id: 'medium-07',
      title: 'Abuse & Misuse Prevention',
      description: 'Detect and mitigate misuse scenarios.',
      difficulty: 'medium',
      questions: [
        {
          prompt: 'To detect automated scraping of your model, you…',
          options: ['Monitor unusual traffic patterns and add rate limits', 'Disable auth', 'Share keys publicly', 'Ignore requests'],
          correctIndex: 0,
          explanation: 'Traffic anomalies and rate limits help mitigate scraping or abuse.'
        },
        {
          prompt: 'A user asks for malware code. Best response?',
          options: ['Refuse and provide safer guidance', 'Provide full payload', 'Ignore policy', 'Return random bytes'],
          correctIndex: 0,
          explanation: 'Refuse unsafe requests and steer to safe info.'
        },
        {
          prompt: 'To prevent model output being used as truth blindly, you…',
          options: ['Add disclaimers and encourage verification', 'Remove citations', 'Hide evaluation', 'Increase temperature'],
          correctIndex: 0,
          explanation: 'Set expectations and encourage verification of outputs.'
        },
        {
          prompt: 'For image generation misuse, you…',
          options: ['Add content filters and watermarking', 'Allow any prompt', 'Disable logging', 'Expose admin endpoints'],
          correctIndex: 0,
          explanation: 'Filters and watermarks reduce harmful imagery and trace misuse.'
        },
        {
          prompt: 'An internal user bypasses safeguards. You should…',
          options: ['Enforce the same policies and audit internal access', 'Trust insiders fully', 'Turn off auth', 'Ship to prod'],
          correctIndex: 0,
          explanation: 'Apply safeguards and auditing to internal users too.'
        }
      ]
    },
    {
      id: 'medium-08',
      title: 'Access Control & Logging',
      description: 'Controlling who can do what.',
      difficulty: 'medium',
      questions: [
        {
          prompt: 'API keys should be…',
          options: ['Scoped and rotated', 'Hard-coded in clients', 'Shared publicly', 'Ignored'],
          correctIndex: 0,
          explanation: 'Scope and rotation reduce blast radius of key leaks.'
        },
        {
          prompt: 'Role-based access control (RBAC) means…',
          options: ['Permissions based on roles', 'Unlimited access for all', 'No auth', 'Only IP allowlists'],
          correctIndex: 0,
          explanation: 'RBAC assigns permissions to roles, not individuals directly.'
        },
        {
          prompt: 'Sensitive logs should…',
          options: ['Mask PII and be access-controlled', 'Be world-readable', 'Include secrets', 'Be emailed daily to everyone'],
          correctIndex: 0,
          explanation: 'Masking and access control protect sensitive logs.'
        },
        {
          prompt: 'Audit logs help by…',
          options: ['Tracing who did what and when', 'Reducing GPU cost', 'Shortening prompts', 'Replacing tests'],
          correctIndex: 0,
          explanation: 'Audit logs provide accountability and traceability.'
        },
        {
          prompt: 'Principle of least privilege means…',
          options: ['Grant only the minimum needed access', 'Give maximum access', 'Disable auth', 'Share admin keys'],
          correctIndex: 0,
          explanation: 'Least privilege limits access to what is necessary.'
        }
      ]
    },
    {
      id: 'medium-09',
      title: 'Fail-safes & Guardrails',
      description: 'Designing safe fallbacks.',
      difficulty: 'medium',
      questions: [
        {
          prompt: 'If moderation service is down, your app should…',
          options: ['Fail closed or degrade gracefully', 'Serve everything', 'Crash silently', 'Expose stack traces'],
          correctIndex: 0,
          explanation: 'Fail closed to prevent unsafe content leakage.'
        },
        {
          prompt: 'For critical actions triggered by AI, you add…',
          options: ['Secondary confirmation or human review', 'No checks', 'Random delays', 'Longer prompts only'],
          correctIndex: 0,
          explanation: 'Critical actions need confirmation/human oversight.'
        },
        {
          prompt: 'To avoid model loops in agents, you…',
          options: ['Set step and time limits', 'Increase temperature', 'Disable logging', 'Skip monitoring'],
          correctIndex: 0,
          explanation: 'Hard limits prevent runaway agent loops.'
        },
        {
          prompt: 'Output validation should…',
          options: ['Check schema and safety before acting', 'Be skipped', 'Only log', 'Clear cache'],
          correctIndex: 0,
          explanation: 'Validate outputs before use to prevent unsafe actions.'
        },
        {
          prompt: 'Why add circuit breakers around external calls?',
          options: ['To stop cascading failures', 'To increase latency', 'To remove retries', 'To expose secrets'],
          correctIndex: 0,
          explanation: 'Circuit breakers protect the system from unstable dependencies.'
        }
      ]
    },
    {
      id: 'medium-10',
      title: 'Incident Response for AI',
      description: 'Preparedness and response basics.',
      difficulty: 'medium',
      questions: [
        {
          prompt: 'An unsafe output reached users. First step?',
          options: ['Contain: disable or roll back the model path', 'Ignore it', 'Tweet about it first', 'Delete all logs'],
          correctIndex: 0,
          explanation: 'Containment (rollback/disable) is the first response.'
        },
        {
          prompt: 'A good runbook includes…',
          options: ['Detection steps, owners, rollback, comms', 'Only emojis', 'No contacts', 'Outdated screenshots'],
          correctIndex: 0,
          explanation: 'Runbooks need clear owners, steps, and communication plans.'
        },
        {
          prompt: 'Post-incident you should…',
          options: ['Run a blameless RCA and add fixes', 'Hide the issue', 'Ship bigger models only', 'Disable monitoring'],
          correctIndex: 0,
          explanation: 'RCAs identify root causes and guide improvements.'
        },
        {
          prompt: 'User reports help because…',
          options: ['They surface real-world failures', 'They lower latency', 'They retrain automatically', 'They store PII'],
          correctIndex: 0,
          explanation: 'User reports are valuable signals of failures.'
        },
        {
          prompt: 'To prevent recurrence you…',
          options: ['Add tests/filters and update data or prompts', 'Hope it stops', 'Reduce metrics', 'Remove owners'],
          correctIndex: 0,
          explanation: 'Add mitigations and tests to prevent repeat incidents.'
        }
      ]
    }
  ],
  hard: [
    {
      id: 'hard-01',
      title: 'Prompt Injection Defense',
      description: 'Advanced threats to LLM instructions.',
      difficulty: 'hard',
      questions: [
        {
          prompt: 'User-controlled markdown is passed into the system prompt. Best defense?',
          options: ['Isolate untrusted content and quote/escape it', 'Merge into instructions', 'Trust HTML sanitization only', 'Disable output checks'],
          correctIndex: 0,
          explanation: 'Separate and escape untrusted content to avoid instruction hijack.'
        },
        {
          prompt: 'Why does retrieval increase injection risk?',
          options: ['Malicious documents can contain adversarial instructions', 'It lowers latency', 'It hides context', 'It removes system prompts'],
          correctIndex: 0,
          explanation: 'Retrieved docs can inject hidden instructions if not sanitized.'
        },
        {
          prompt: 'A strong pattern to mitigate is…',
          options: ['Explicit separator tokens and enforced roles', 'Single giant prompt', 'No validation', 'Higher temperature'],
          correctIndex: 0,
          explanation: 'Clear separators and role enforcement reduce injection success.'
        },
        {
          prompt: 'Tool-calling agents should…',
          options: ['Validate tool args and whitelist functions', 'Execute any command', 'Ignore schemas', 'Trust free text'],
          correctIndex: 0,
          explanation: 'Validate and restrict tool calls to prevent abuse.'
        },
        {
          prompt: 'Hidden text in user content can…',
          options: ['Alter model behavior if not filtered', 'Speed GPUs', 'Improve truthfulness', 'Reduce context'],
          correctIndex: 0,
          explanation: 'Hidden or obfuscated text may carry adversarial instructions.'
        }
      ]
    },
    {
      id: 'hard-02',
      title: 'Data Poisoning & Supply Chain',
      description: 'Edge cases in data and pipeline integrity.',
      difficulty: 'hard',
      questions: [
        {
          prompt: 'A public dataset update silently changes labels. Mitigation?',
          options: ['Pin versions and verify checksums', 'Auto-accept updates', 'Disable hashing', 'Skip validation'],
          correctIndex: 0,
          explanation: 'Version pinning and checksum verification catch tampering.'
        },
        {
          prompt: 'Poisoned samples aim to…',
          options: ['Shift model behavior toward attacker goals', 'Reduce GPU heat', 'Shorten prompts', 'Improve fairness'],
          correctIndex: 0,
          explanation: 'Poisoning injects samples that manipulate model behavior.'
        },
        {
          prompt: 'To detect poisoning you can…',
          options: ['Run outlier detection and influence functions', 'Ignore logs', 'Lower batch size', 'Hide metrics'],
          correctIndex: 0,
          explanation: 'Outlier/influence analyses can surface poisoned points.'
        },
        {
          prompt: 'Supply-chain risk for models includes…',
          options: ['Unverified pre-trained checkpoints', 'Font choices', 'CSS variables', 'Keyboard layout'],
          correctIndex: 0,
          explanation: 'Untrusted checkpoints can contain backdoors or license issues.'
        },
        {
          prompt: 'A backdoor trigger is…',
          options: ['A pattern that forces a specific output', 'A logging tool', 'A scaling knob', 'A tokenizer bug fix'],
          correctIndex: 0,
          explanation: 'Backdoor triggers cause targeted malicious outputs.'
        }
      ]
    },
    {
      id: 'hard-03',
      title: 'Model Extraction & Abuse',
      description: 'Security of model interfaces.',
      difficulty: 'hard',
      questions: [
        {
          prompt: 'Excessive unthrottled queries risk…',
          options: ['Model extraction via output probing', 'Lower latency', 'Better alignment', 'Higher accuracy'],
          correctIndex: 0,
          explanation: 'Attackers can infer model weights/behaviors via many queries.'
        },
        {
          prompt: 'A good mitigation for extraction is…',
          options: ['Rate limits, anomaly detection, and watermarked outputs', 'Unlimited free access', 'No logging', 'Removing auth'],
          correctIndex: 0,
          explanation: 'Limits, detection, and watermarks make extraction harder to monetize.'
        },
        {
          prompt: 'Why avoid echoing proprietary training snippets?',
          options: ['Prevents IP leakage and memorization harms', 'Reduces latency only', 'Changes colors', 'Upscales images'],
          correctIndex: 0,
          explanation: 'Echoing memorized data leaks IP and privacy-sensitive content.'
        },
        {
          prompt: 'Watermarking text is primarily for…',
          options: ['Attribution and misuse tracking', 'Compression', 'Lower cost', 'Higher recall'],
          correctIndex: 0,
          explanation: 'Watermarks help detect model-generated text and track misuse.'
        },
        {
          prompt: 'Response randomization can…',
          options: ['Reduce fidelity of extraction attacks', 'Increase exact memorization', 'Expose secrets', 'Guarantee accuracy'],
          correctIndex: 0,
          explanation: 'Randomness makes extraction via repeated queries less precise.'
        }
      ]
    },
    {
      id: 'hard-04',
      title: 'Privacy & Differential Privacy',
      description: 'Stronger privacy guarantees and trade-offs.',
      difficulty: 'hard',
      questions: [
        {
          prompt: 'Differential privacy (DP) provides…',
          options: ['Bounds on how much one record affects outputs', 'Perfect secrecy', 'Zero noise', 'Faster inference'],
          correctIndex: 0,
          explanation: 'DP limits the influence of any single record on results.'
        },
        {
          prompt: 'A DP mechanism typically adds…',
          options: ['Noise calibrated to privacy budget', 'More training epochs', 'Bigger prompts', 'Extra tokens'],
          correctIndex: 0,
          explanation: 'Noise is added proportional to the privacy budget (epsilon).'
        },
        {
          prompt: 'Lower epsilon values mean…',
          options: ['Stronger privacy, more noise', 'Weaker privacy, less noise', 'No change', 'Higher latency only'],
          correctIndex: 0,
          explanation: 'Smaller epsilon strengthens privacy but may hurt utility.'
        },
        {
          prompt: 'DP-SGD mainly protects…',
          options: ['Training data memorization', 'Tokenization speed', 'GPU temp', 'UI styles'],
          correctIndex: 0,
          explanation: 'DP-SGD reduces memorization of individual training points.'
        },
        {
          prompt: 'A privacy budget composes meaning…',
          options: ['Multiple queries consume the budget over time', 'Budget is infinite', 'Noise never accumulates', 'No tracking needed'],
          correctIndex: 0,
          explanation: 'Each DP query consumes part of the privacy budget; composition matters.'
        }
      ]
    },
    {
      id: 'hard-05',
      title: 'Red Teaming & Evaluation',
      description: 'Advanced safety testing scenarios.',
      difficulty: 'hard',
      questions: [
        {
          prompt: 'Red teaming focuses on…',
          options: ['Actively probing for failures and unsafe behavior', 'UI polish only', 'Model size', 'GPU drivers'],
          correctIndex: 0,
          explanation: 'Red teams stress-test systems for failures and policy gaps.'
        },
        {
          prompt: 'Effective red-team prompts are…',
          options: ['Targeted, diverse, and adversarial', 'Random emojis', 'Short greetings only', 'Latency tests'],
          correctIndex: 0,
          explanation: 'Adversarial, diverse prompts expose weaknesses.'
        },
        {
          prompt: 'Safety evals should be…',
          options: ['Run regularly and before major releases', 'One-time only', 'Unlogged', 'Unscored'],
          correctIndex: 0,
          explanation: 'Regular evals catch regressions and new risks.'
        },
        {
          prompt: 'When a jailbreak is found, you…',
          options: ['Patch prompts/filters and add it to regression tests', 'Ignore it', 'Ship immediately', 'Remove logging'],
          correctIndex: 0,
          explanation: 'Fix the issue and add the case to regression suites.'
        },
        {
          prompt: 'Why involve domain experts in red teaming?',
          options: ['They know realistic, high-impact attack patterns', 'For decoration', 'To slow reviews', 'To remove context'],
          correctIndex: 0,
          explanation: 'Domain experts design realistic, relevant adversarial tests.'
        }
      ]
    }
  ]
};
