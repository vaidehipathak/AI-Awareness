from django.core.management.base import BaseCommand
from content.models import Quiz

class Command(BaseCommand):
    help = 'Imports static quizzes from frontend catalog into the database'

    def handle(self, *args, **kwargs):
        data = {
            'easy': [
                {
                    'title': 'AI Basics: Terminology',
                    'description': 'Quick check on core AI words everyone should know.',
                    'questions': [
                        {'prompt': 'What does AI stand for?', 'options': ['Artificial Intelligence', 'Augmented Internet', 'Automated Interface', 'Advanced Integration'], 'correctIndex': 0, 'explanation': 'AI is short for Artificial Intelligence.'},
                        {'prompt': 'Which is an example of “narrow AI”?', 'options': ['A chess engine', 'A general problem solver', 'A human brain', 'A quantum computer'], 'correctIndex': 0, 'explanation': 'Narrow AI is built for a specific task, like playing chess.'},
                        {'prompt': 'Which field focuses on training models from data?', 'options': ['Machine Learning', 'Web Development', 'Networking', 'Computer Graphics'], 'correctIndex': 0, 'explanation': 'Machine Learning trains models on data to make predictions or decisions.'},
                        {'prompt': 'What is a dataset?', 'options': ['A collection of data points', 'A model output', 'A programming language', 'A database password'], 'correctIndex': 0, 'explanation': 'A dataset is an organized collection of data points used for training or evaluation.'},
                        {'prompt': 'Which task is most associated with computer vision?', 'options': ['Image classification', 'Audio mixing', 'Packet routing', 'Compiler design'], 'correctIndex': 0, 'explanation': 'Computer vision models often perform image classification.'}
                    ]
                },
                {
                    'title': 'Data vs. Model',
                    'description': 'Distinguish training data from the model that learns from it.',
                    'questions': [
                        {'prompt': 'What does the model learn from?', 'options': ['Training data', 'Production logs only', 'Random numbers', 'Compiled binaries'], 'correctIndex': 0, 'explanation': 'Models learn patterns from labeled or unlabeled training data.'},
                        {'prompt': 'What do we call the step where a trained model is used to make predictions?', 'options': ['Inference', 'Compilation', 'Transpilation', 'Encryption'], 'correctIndex': 0, 'explanation': 'Inference is using a trained model to produce outputs from new inputs.'},
                        {'prompt': 'Which is true about training data quality?', 'options': ['Better data improves model performance', 'Data quality does not matter', 'Only model size matters', 'Random labels help generalization'], 'correctIndex': 0, 'explanation': 'High-quality data directly influences model performance and fairness.'},
                        {'prompt': 'A “label” in supervised learning is…', 'options': ['The correct answer for an input', 'A server name', 'A secret key', 'A deployment region'], 'correctIndex': 0, 'explanation': 'Labels are the ground-truth outputs paired with inputs during training.'},
                        {'prompt': 'What stores the learned parameters of a model?', 'options': ['Model file/checkpoint', 'CSS stylesheet', 'Network switch', 'Browser cache'], 'correctIndex': 0, 'explanation': 'Weights/parameters are stored in the model file or checkpoint.'}
                    ]
                },
                {
                    'title': 'Training vs. Inference',
                    'description': 'Understand the two big phases of ML systems.',
                    'questions': [
                        {'prompt': 'Which phase is typically more compute-intensive?', 'options': ['Training', 'Inference', 'Data labeling', 'Logging'], 'correctIndex': 0, 'explanation': 'Training generally requires more compute than inference.'},
                        {'prompt': 'Which phase happens repeatedly for every user request?', 'options': ['Inference', 'Model architecture search', 'Hyperparameter tuning', 'Data collection'], 'correctIndex': 0, 'explanation': 'Inference runs on each request to generate outputs.'},
                        {'prompt': 'Which phrase describes “fine-tuning”?', 'options': ['Training an existing model further on new data', 'Resetting model weights', 'Encrypting outputs', 'Deleting logs'], 'correctIndex': 0, 'explanation': 'Fine-tuning continues training a pre-trained model on task-specific data.'},
                        {'prompt': 'During inference, weights are…', 'options': ['Frozen/read-only', 'Updated every request', 'Randomized each call', 'Downloaded from users'], 'correctIndex': 0, 'explanation': 'Inference uses fixed weights; they are not updated per request.'},
                        {'prompt': 'Which environment should be monitored for latency?', 'options': ['Inference serving environment', 'Code editor', 'Static website hosting', 'Email server only'], 'correctIndex': 0, 'explanation': 'Inference latency affects user experience and must be monitored.'}
                    ]
                },
                {
                    'title': 'Common AI Tasks',
                    'description': 'Know the classic ML task categories.',
                    'questions': [
                        {'prompt': 'Predicting spam vs. not spam is a…', 'options': ['Classification task', 'Regression task', 'Clustering task', 'Rendering task'], 'correctIndex': 0, 'explanation': 'Spam detection is a binary classification problem.'},
                        {'prompt': 'Predicting house prices is usually…', 'options': ['Regression', 'Classification', 'Segmentation', 'Hashing'], 'correctIndex': 0, 'explanation': 'Prices are continuous values, so it is regression.'},
                        {'prompt': 'Grouping customers by behavior without labels is…', 'options': ['Clustering', 'Supervised learning', 'Reinforcement learning', 'Dimensionality reduction'], 'correctIndex': 0, 'explanation': 'Clustering finds natural groupings without labels.'},
                        {'prompt': 'Which task fits “translate English to French”?', 'options': ['Sequence-to-sequence', 'Image segmentation', 'K-means', 'Linear regression'], 'correctIndex': 0, 'explanation': 'Machine translation is often modeled as sequence-to-sequence.'},
                        {'prompt': 'Which task fits “find objects in a photo”?', 'options': ['Object detection', 'Topic modeling', 'Anomaly scoring', 'Sorting'], 'correctIndex': 0, 'explanation': 'Object detection localizes and classifies objects in images.'}
                    ]
                },
                {
                    'title': 'Inputs and Outputs',
                    'description': 'Make sure input/output expectations are clear.',
                    'questions': [
                        {'prompt': 'Text generation models expect…', 'options': ['Text tokens as input', 'Raw images only', 'Executable binaries', 'SQL schemas'], 'correctIndex': 0, 'explanation': 'Language models consume tokenized text.'},
                        {'prompt': 'Image classifiers output…', 'options': ['Class probabilities or labels', 'Source code', 'Video streams', 'Network packets'], 'correctIndex': 0, 'explanation': 'They output predicted classes or probabilities.'},
                        {'prompt': 'Audio speech-to-text outputs…', 'options': ['Transcribed text', 'Pixel arrays', 'Database migrations', '3D meshes'], 'correctIndex': 0, 'explanation': 'ASR models output textual transcripts.'},
                        {'prompt': 'A recommender system output is…', 'options': ['Ranked item suggestions', 'CPU temperature', 'Network topology', 'Browser version'], 'correctIndex': 0, 'explanation': 'Recommenders return ranked items to show users.'},
                        {'prompt': 'Which input best fits a sentiment model?', 'options': ['A product review text', 'A road map image', 'An IP packet', 'A keyboard layout'], 'correctIndex': 0, 'explanation': 'Sentiment models read text like product reviews.'}
                    ]
                },
                {
                    'title': 'ML Pipeline Steps',
                    'description': 'Recall the standard stages of an ML project.',
                    'questions': [
                        {'prompt': 'Which comes first in a typical pipeline?', 'options': ['Data collection', 'Model deployment', 'A/B test', 'Monitoring'], 'correctIndex': 0, 'explanation': 'Data collection precedes training and deployment.'},
                        {'prompt': 'Feature engineering means…', 'options': ['Transforming raw data into model-ready features', 'Building UI layouts', 'Writing API docs', 'Scaling servers'], 'correctIndex': 0, 'explanation': 'Feature engineering prepares data for models.'},
                        {'prompt': 'Validation data is used to…', 'options': ['Tune hyperparameters', 'Train the model', 'Serve users directly', 'Store secrets'], 'correctIndex': 0, 'explanation': 'Validation sets help tune and select models.'},
                        {'prompt': 'A/B tests compare…', 'options': ['Two variants to measure impact', 'CPU vs. GPU prices', 'Data schemas', 'Keyboard shortcuts'], 'correctIndex': 0, 'explanation': 'A/B testing evaluates variants to pick the better performer.'},
                        {'prompt': 'Monitoring in production checks…', 'options': ['Latency, errors, drift', 'IDE themes', 'Wi-Fi passwords', 'USB drivers'], 'correctIndex': 0, 'explanation': 'Production monitoring tracks metrics like latency, errors, and data drift.'}
                    ]
                },
                {
                    'title': 'Bias Basics',
                    'description': 'Spot simple examples of bias and imbalance.',
                    'questions': [
                        {'prompt': 'Dataset bias can happen when…', 'options': ['One group is underrepresented', 'Data is balanced', 'Labels are perfect', 'Model is small'], 'correctIndex': 0, 'explanation': 'Underrepresentation creates bias in model predictions.'},
                        {'prompt': 'Which is a mitigation step?', 'options': ['Rebalancing or reweighting data', 'Ignoring the issue', 'Removing evaluation', 'Shortening prompts only'], 'correctIndex': 0, 'explanation': 'Rebalancing helps address dataset bias.'},
                        {'prompt': 'Why do we measure fairness?', 'options': ['To detect unequal performance across groups', 'To change UI colors', 'To increase CPU fans', 'To compress images'], 'correctIndex': 0, 'explanation': 'Fairness metrics show whether groups receive similar performance.'},
                        {'prompt': '“Sampling bias” refers to…', 'options': ['Non-representative data collection', 'Model weights drift', 'Server crash', 'Correct labels everywhere'], 'correctIndex': 0, 'explanation': 'Sampling bias arises from non-representative samples.'},
                        {'prompt': 'Which reduces stereotype amplification?', 'options': ['Careful prompt design and balanced examples', 'Removing logging', 'Shorter training time', 'Larger batch size only'], 'correctIndex': 0, 'explanation': 'Balanced data and careful prompts help reduce stereotypes.'}
                    ]
                },
                {
                    'title': 'Safety Basics',
                    'description': 'Recognize simple safety controls.',
                    'questions': [
                        {'prompt': 'Why add content filters?', 'options': ['To block unsafe outputs', 'To speed up GPUs', 'To minify CSS', 'To compress images'], 'correctIndex': 0, 'explanation': 'Filters reduce unsafe or policy-violating outputs.'},
                        {'prompt': 'Rate limiting helps…', 'options': ['Prevent abuse or overload', 'Increase latency', 'Hide logs', 'Change labels'], 'correctIndex': 0, 'explanation': 'Rate limits protect systems from abuse and overload.'},
                        {'prompt': 'Human-in-the-loop means…', 'options': ['Humans review or override model decisions', 'Models manage servers', 'Data deletes humans', 'GPU auto-scaling'], 'correctIndex': 0, 'explanation': 'Humans review, approve, or correct model outputs in critical flows.'},
                        {'prompt': 'Which is a safe default on error?', 'options': ['Fail closed / deny risky action', 'Proceed silently', 'Return random data', 'Disable logging'], 'correctIndex': 0, 'explanation': 'Failing closed avoids unsafe actions when uncertain.'},
                        {'prompt': 'Logging moderation events is useful for…', 'options': ['Auditing and improvements', 'Slowing products', 'Marketing only', 'GPU cooling'], 'correctIndex': 0, 'explanation': 'Logs support audits and iteration on safety systems.'}
                    ]
                },
                {
                    'title': 'Privacy Basics',
                    'description': 'Simple privacy hygiene for AI systems.',
                    'questions': [
                        {'prompt': 'PII stands for…', 'options': ['Personally Identifiable Information', 'Public Internet Interface', 'Program Initialization Instruction', 'Parallel Input Indicator'], 'correctIndex': 0, 'explanation': 'PII means Personally Identifiable Information.'},
                        {'prompt': 'Good practice for PII is…', 'options': ['Mask or tokenize it', 'Log it in plaintext', 'Share widely', 'Keep forever without need'], 'correctIndex': 0, 'explanation': 'Masking/tokenizing reduces exposure of PII.'},
                        {'prompt': 'Which data should NOT be used without consent?', 'options': ['Sensitive personal data', 'Open public datasets', 'Synthetic data', 'Test strings'], 'correctIndex': 0, 'explanation': 'Sensitive personal data requires consent and safeguards.'},
                        {'prompt': 'Data minimization means…', 'options': ['Collect only what is needed', 'Collect everything', 'Disable deletion', 'Duplicate logs'], 'correctIndex': 0, 'explanation': 'Minimization limits collection to what is necessary.'},
                        {'prompt': 'Secure transport for APIs uses…', 'options': ['HTTPS/TLS', 'Plain HTTP', 'FTP', 'Unencrypted UDP'], 'correctIndex': 0, 'explanation': 'HTTPS/TLS encrypts data in transit.'}
                    ]
                },
                {
                    'title': 'Metrics Basics',
                    'description': 'Know common evaluation metrics.',
                    'questions': [
                        {'prompt': 'Accuracy measures…', 'options': ['Correct predictions over all predictions', 'Inference latency', 'GPU memory', 'Dataset size'], 'correctIndex': 0, 'explanation': 'Accuracy is correct predictions divided by total predictions.'},
                        {'prompt': 'Precision focuses on…', 'options': ['How many predicted positives are correct', 'All negatives', 'Runtime cost', 'Storage space'], 'correctIndex': 0, 'explanation': 'Precision is correct positives over all predicted positives.'},
                        {'prompt': 'Recall focuses on…', 'options': ['How many actual positives were found', 'Only negatives', 'GPU usage', 'Prompt length'], 'correctIndex': 0, 'explanation': 'Recall is found positives over all actual positives.'},
                        {'prompt': 'F1 score is…', 'options': ['Harmonic mean of precision and recall', 'Average latency', 'Sum of parameters', 'Max token length'], 'correctIndex': 0, 'explanation': 'F1 combines precision and recall via the harmonic mean.'},
                        {'prompt': 'For ranking tasks, a common metric is…', 'options': ['NDCG or MAP', 'CPU clock speed', 'FPS', 'Heat output'], 'correctIndex': 0, 'explanation': 'Ranking tasks use metrics like NDCG or MAP.'}
                    ]
                },
                {
                    'title': 'Overfitting vs Underfitting',
                    'description': 'Identify basic model fitting problems.',
                    'questions': [
                        {'prompt': 'Overfitting means…', 'options': ['Great on training, poor on new data', 'Great on all data', 'Poor on training but great on test', 'No learning happened'], 'correctIndex': 0, 'explanation': 'Overfitting memorizes training data and fails to generalize.'},
                        {'prompt': 'Underfitting means…', 'options': ['Model is too simple to learn patterns', 'Model memorized everything', 'Too many parameters', 'Perfect generalization'], 'correctIndex': 0, 'explanation': 'Underfitting fails to capture underlying structure.'},
                        {'prompt': 'A fix for overfitting is…', 'options': ['Regularization or more data', 'Less validation', 'More logging only', 'Longer prompts'], 'correctIndex': 0, 'explanation': 'Regularization and more diverse data help combat overfitting.'},
                        {'prompt': 'Early stopping helps because…', 'options': ['It halts before overfitting worsens', 'It speeds GPUs', 'It removes labels', 'It disables monitoring'], 'correctIndex': 0, 'explanation': 'Early stopping stops training when validation performance degrades.'},
                        {'prompt': 'Cross-validation is used to…', 'options': ['Assess generalization across folds', 'Shorten prompts', 'Encrypt data', 'Resize images'], 'correctIndex': 0, 'explanation': 'Cross-validation tests model performance across data splits.'}
                    ]
                },
                {
                    'title': 'Learning Paradigms',
                    'description': 'Supervised, unsupervised, and reinforcement basics.',
                    'questions': [
                        {'prompt': 'Supervised learning uses…', 'options': ['Labeled data', 'No data', 'Only rewards', 'Only random noise'], 'correctIndex': 0, 'explanation': 'Supervised learning needs labeled examples.'},
                        {'prompt': 'Unsupervised learning uses…', 'options': ['Unlabeled data', 'Only labels', 'Rewards and states', 'Compiled code'], 'correctIndex': 0, 'explanation': 'Unsupervised learning finds structure in unlabeled data.'},
                        {'prompt': 'Reinforcement learning uses…', 'options': ['Rewards and actions over time', 'Static labels only', 'Image pixels only', 'SQL queries'], 'correctIndex': 0, 'explanation': 'RL optimizes actions based on reward signals.'},
                        {'prompt': 'Clustering is typically…', 'options': ['Unsupervised', 'Supervised', 'RL-only', 'Symbolic'], 'correctIndex': 0, 'explanation': 'Clustering is an unsupervised task.'},
                        {'prompt': 'Image classification with labels is…', 'options': ['Supervised learning', 'Unsupervised', 'RL', 'Meta-learning'], 'correctIndex': 0, 'explanation': 'Labeled image classification is supervised.'}
                    ]
                },
                {
                    'title': 'Prompting Basics',
                    'description': 'Core ideas for prompting language models.',
                    'questions': [
                        {'prompt': 'A prompt is…', 'options': ['Input text given to a language model', 'GPU clock speed', 'Dataset license', 'CSS selector'], 'correctIndex': 0, 'explanation': 'A prompt is the input text that guides the model.'},
                        {'prompt': 'Better prompts often include…', 'options': ['Clear instructions and examples', 'Random words', 'IP addresses', 'Binary headers'], 'correctIndex': 0, 'explanation': 'Clarity and examples improve prompt outcomes.'},
                        {'prompt': 'Few-shot prompting means…', 'options': ['Providing a few examples in the prompt', 'Zero inputs', 'Hundreds of labels', 'Training from scratch'], 'correctIndex': 0, 'explanation': 'Few-shot prompts include a few demonstrations.'},
                        {'prompt': 'Temperature in decoding controls…', 'options': ['Randomness in sampling', 'GPU heat', 'Network latency', 'Training speed'], 'correctIndex': 0, 'explanation': 'Higher temperature increases randomness in text generation.'},
                        {'prompt': 'A system prompt is used to…', 'options': ['Set overall assistant behavior', 'Resize images', 'Store API keys', 'Compile code'], 'correctIndex': 0, 'explanation': 'System prompts steer the model’s role and constraints.'}
                    ]
                },
                {
                    'title': 'Deployment Basics',
                    'description': 'Know where models can run.',
                    'questions': [
                        {'prompt': 'Running models on user devices is called…', 'options': ['Edge deployment', 'Cloud training', 'Data warehousing', 'Firmware flashing'], 'correctIndex': 0, 'explanation': 'On-device inference is edge deployment.'},
                        {'prompt': 'Cloud inference benefits include…', 'options': ['Scalability and managed hardware', 'No latency ever', 'Zero cost always', 'No security needs'], 'correctIndex': 0, 'explanation': 'Cloud offers scale and managed compute.'},
                        {'prompt': 'Model quantization mainly helps…', 'options': ['Reduce size and speed up inference', 'Change labels', 'Collect more data', 'Rewrite UI'], 'correctIndex': 0, 'explanation': 'Quantization reduces precision to improve speed/size.'},
                        {'prompt': 'Caching model responses can…', 'options': ['Lower latency and cost for repeats', 'Increase GPU heat', 'Hide bugs', 'Replace training'], 'correctIndex': 0, 'explanation': 'Caching saves compute for repeated queries.'},
                        {'prompt': 'Blue/green deploys are used to…', 'options': ['Swap traffic between old/new versions safely', 'Compress data', 'Encrypt disks', 'Tokenize PII'], 'correctIndex': 0, 'explanation': 'Blue/green strategies shift traffic gradually to new versions.'}
                    ]
                },
                {
                    'title': 'Responsible AI Basics',
                    'description': 'Grounding in transparency and accountability.',
                    'questions': [
                        {'prompt': 'Model cards are used to…', 'options': ['Document model behavior and limits', 'Render HTML', 'Compress images', 'Tune GPUs'], 'correctIndex': 0, 'explanation': 'Model cards describe intended use, data, and limitations.'},
                        {'prompt': 'Transparency helps users…', 'options': ['Understand capabilities and risks', 'Bypass security', 'Slow the UI', 'Reduce accuracy'], 'correctIndex': 0, 'explanation': 'Transparency builds trust by explaining model limits and uses.'},
                        {'prompt': 'Accountability means…', 'options': ['Clear ownership of outcomes', 'No logging', 'Anonymous deployments', 'Unlimited access'], 'correctIndex': 0, 'explanation': 'Accountability assigns responsibility for decisions and impacts.'},
                        {'prompt': 'Human oversight is important because…', 'options': ['Models can be wrong or biased', 'It removes users', 'It speeds compilation', 'It removes costs'], 'correctIndex': 0, 'explanation': 'Oversight catches errors and bias before harm.'},
                        {'prompt': 'Publishing limitations helps…', 'options': ['Prevent misuse and set expectations', 'Guarantee perfection', 'Replace QA', 'Remove need for consent'], 'correctIndex': 0, 'explanation': 'Stating limitations guides safe, appropriate use.'}
                    ]
                }
            ],
            'medium': [
                {
                    'title': 'Applying Models to Products',
                    'description': 'Scenario-based application of a model into a feature.',
                    'questions': [
                        {'prompt': 'You add an LLM to draft email replies. What is the safest default action?', 'options': ['Require user review before sending', 'Send automatically', 'Bypass logging', 'Skip rate limits'], 'correctIndex': 0, 'explanation': 'Keep humans in the loop; drafts should be reviewed before sending.'},
                        {'prompt': 'A generative model sometimes produces off-brand tone. What do you add?', 'options': ['Style guide and examples in the prompt', 'Higher temperature', 'Longer outputs only', 'Disable content filters'], 'correctIndex': 0, 'explanation': 'Include brand style constraints and examples to steer tone.'},
                        {'prompt': 'You need latency under 200 ms. What helps most?', 'options': ['Smaller/quantized model or caching', 'Higher temperature', 'More stop words', 'Random delays'], 'correctIndex': 0, 'explanation': 'Use smaller/optimized models or cache frequent prompts to cut latency.'},
                        {'prompt': 'To prevent prompt injection in templates, you should…', 'options': ['Separate system instructions from user content', 'Merge everything', 'Disable escaping', 'Trust any URL'], 'correctIndex': 0, 'explanation': 'Keep system prompts isolated and sanitize user content to resist injection.'},
                        {'prompt': 'To evaluate the feature before launch, you run…', 'options': ['Offline evals plus targeted user tests', 'No tests', 'Prod-only release', 'GPU burn-in'], 'correctIndex': 0, 'explanation': 'Offline evals and controlled tests validate quality and safety before launch.'}
                    ]
                },
                {
                    'title': 'Data Labeling & Quality',
                    'description': 'Operational questions on labeling and QA.',
                    'questions': [
                        {'prompt': 'Inter-annotator agreement is used to…', 'options': ['Measure label consistency', 'Speed up GPUs', 'Pick deployment regions', 'Encrypt storage'], 'correctIndex': 0, 'explanation': 'Agreement metrics show if labelers are consistent.'},
                        {'prompt': 'Gold labels in a batch are for…', 'options': ['Quality control checks', 'Longer context', 'UI layout', 'Network routing'], 'correctIndex': 0, 'explanation': 'Gold questions test annotator quality during labeling.'},
                        {'prompt': 'Handling ambiguous items should…', 'options': ['Include clear guidelines or allow “cannot determine”', 'Force a guess', 'Drop all items', 'Hide from review'], 'correctIndex': 0, 'explanation': 'Guidelines and escape hatches improve label quality on ambiguities.'},
                        {'prompt': 'To reduce bias in labels, you…', 'options': ['Train labelers with examples covering groups', 'Hide instructions', 'Shorten timelines only', 'Ignore feedback'], 'correctIndex': 0, 'explanation': 'Inclusive instructions and examples reduce biased labeling.'},
                        {'prompt': 'You discover mislabeled data in training. Best next step?', 'options': ['Fix labels and retrain/finetune', 'Ignore it', 'Ship immediately', 'Disable monitoring'], 'correctIndex': 0, 'explanation': 'Correct labels and retrain to avoid propagating errors.'}
                    ]
                },
                {
                    'title': 'Bias & Fairness in Practice',
                    'description': 'Scenario reasoning on fairness impacts.',
                    'questions': [
                        {'prompt': 'A loan model under-approves a subgroup. First diagnostic?', 'options': ['Measure group-wise approval and error rates', 'Ship anyway', 'Hide metrics', 'Add random noise'], 'correctIndex': 0, 'explanation': 'Check performance per group to confirm disparity.'},
                        {'prompt': 'You lack labels for group membership. A mitigation is…', 'options': ['Use proxy fairness tests (e.g., geographic), or seek consented labels', 'Ignore fairness', 'Assume balance', 'Remove evaluations'], 'correctIndex': 0, 'explanation': 'Use proxies or obtain consented labels to assess fairness.'},
                        {'prompt': 'To reduce disparity after finding bias, you might…', 'options': ['Reweigh data or adjust decision thresholds', 'Lower logging', 'Shorten prompts', 'Disable audits'], 'correctIndex': 0, 'explanation': 'Reweighting or threshold adjustments can reduce measured disparity.'},
                        {'prompt': 'Why include stakeholder review for fairness changes?', 'options': ['To ensure impacted groups are considered', 'To slow shipping', 'To change UI colors', 'To increase latency'], 'correctIndex': 0, 'explanation': 'Stakeholder input ensures changes respect impacted groups.'},
                        {'prompt': 'An upstream data shift changes demographics. What to do?', 'options': ['Re-evaluate fairness metrics and retrain if needed', 'Ignore it', 'Delete alerts', 'Only change the favicon'], 'correctIndex': 0, 'explanation': 'Monitor shifts and re-evaluate fairness; retrain if necessary.'}
                    ]
                },
                {
                    'title': 'Prompt Engineering Scenarios',
                    'description': 'Use cases for controlling LLM outputs.',
                    'questions': [
                        {'prompt': 'User-provided text appears inside your system prompt. Risk?', 'options': ['Prompt injection or instruction hijack', 'Lower latency', 'Better accuracy automatically', 'No effect'], 'correctIndex': 0, 'explanation': 'Mixing untrusted text into instructions can enable prompt injection.'},
                        {'prompt': 'To extract structured fields reliably, you…', 'options': ['Ask for JSON with a schema and validate', 'Rely on freeform text', 'Remove validation', 'Disable parsing'], 'correctIndex': 0, 'explanation': 'Request JSON per schema and validate to ensure structure.'},
                        {'prompt': 'Hallucinations increase when…', 'options': ['Prompts are vague and under-specified', 'You add citations', 'You add retrieval', 'You lower temperature and add constraints'], 'correctIndex': 0, 'explanation': 'Vague prompts lead to hallucinated content.'},
                        {'prompt': 'A retrieval-augmented prompt should…', 'options': ['Separate context from instructions and cite sources', 'Hide context length', 'Ignore recency', 'Remove grounding text'], 'correctIndex': 0, 'explanation': 'Clear separation and citing sources improve grounded answers.'},
                        {'prompt': 'To reduce jailbreaks you can…', 'options': ['Layer system prompts with moderation and output checks', 'Raise temperature', 'Disable filters', 'Expose internal keys'], 'correctIndex': 0, 'explanation': 'Defense-in-depth reduces jailbreak success.'}
                    ]
                },
                {
                    'title': 'Evaluation Strategy',
                    'description': 'Practical evaluation planning.',
                    'questions': [
                        {'prompt': 'You need reproducible LLM evals. You should…', 'options': ['Fix seeds/decoding params and use the same test set', 'Vary temperature wildly', 'Change context length each run', 'Skip regression tests'], 'correctIndex': 0, 'explanation': 'Keep evaluation settings stable to compare runs.'},
                        {'prompt': 'Human eval is useful when…', 'options': ['Quality is subjective (helpfulness, tone)', 'Metrics already perfect', 'Latency is only concern', 'No instructions exist'], 'correctIndex': 0, 'explanation': 'Humans assess subjective qualities like helpfulness and tone.'},
                        {'prompt': 'For safety evals you include…', 'options': ['Adversarial and policy-violating prompts', 'Only happy path prompts', 'No logging', 'UI screenshots'], 'correctIndex': 0, 'explanation': 'Safety evals need adversarial and policy-relevant test cases.'},
                        {'prompt': 'Regression suites help by…', 'options': ['Catching quality drops after changes', 'Speeding GPUs', 'Reducing tokens', 'Replacing monitoring'], 'correctIndex': 0, 'explanation': 'Regression suites detect quality regressions after updates.'},
                        {'prompt': 'When metrics disagree with user feedback, you…', 'options': ['Investigate sampling, labels, and metric choice', 'Ignore users', 'Ship immediately', 'Turn off metrics'], 'correctIndex': 0, 'explanation': 'Investigate the mismatch; adjust metrics or data if needed.'}
                    ]
                },
                {
                    'title': 'Monitoring & Drift',
                    'description': 'Operate models under change.',
                    'questions': [
                        {'prompt': 'Data drift means…', 'options': ['Input distribution changes over time', 'GPU overheats', 'Prompt is longer', 'UI color changes'], 'correctIndex': 0, 'explanation': 'Drift is a change in data distribution versus training data.'},
                        {'prompt': 'A leading indicator of drift is…', 'options': ['Sudden shift in feature statistics', 'Stable metrics', 'Consistent latency', 'Unchanged schemas'], 'correctIndex': 0, 'explanation': 'Feature statistic shifts warn of drift.'}
                    ]
                }
            ]
        }

        self.stdout.write(self.style.SUCCESS('Starting quiz import...'))
        
        count = 0
        for difficulty, quiz_list in data.items():
            for q_data in quiz_list:
                # Check for existing to prevent duplicates
                if Quiz.objects.filter(title=q_data['title']).exists():
                    self.stdout.write(self.style.WARNING(f"Skipping existing quiz: {q_data['title']}"))
                    continue
                
                Quiz.objects.create(
                    title=q_data['title'],
                    description=q_data['description'],
                    difficulty=difficulty,
                    questions=q_data['questions'],
                    is_active=True
                )
                count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} quizzes.'))
