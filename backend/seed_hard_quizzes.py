"""
Seed hard difficulty quizzes into the database.
Run with: python manage.py shell < seed_hard_quizzes.py
"""

from content.models import Quiz

# Hard quiz data from frontend catalog
hard_quizzes = [
    {
        'title': 'Prompt Injection Defense',
        'description': 'Advanced threats to LLM instructions.',
        'difficulty': 'hard',
        'questions': [
            {
                'prompt': 'User-controlled markdown is passed into the system prompt. Best defense?',
                'options': ['Isolate untrusted content and quote/escape it', 'Merge into instructions', 'Trust HTML sanitization only', 'Disable output checks'],
                'correctIndex': 0,
                'explanation': 'Separate and escape untrusted content to avoid instruction hijack.'
            },
            {
                'prompt': 'Why does retrieval increase injection risk?',
                'options': ['Malicious documents can contain adversarial instructions', 'It lowers latency', 'It hides context', 'It removes system prompts'],
                'correctIndex': 0,
                'explanation': 'Retrieved docs can inject hidden instructions if not sanitized.'
            },
            {
                'prompt': 'A strong pattern to mitigate is…',
                'options': ['Explicit separator tokens and enforced roles', 'Single giant prompt', 'No validation', 'Higher temperature'],
                'correctIndex': 0,
                'explanation': 'Clear separators and role enforcement reduce injection success.'
            },
            {
                'prompt': 'Tool-calling agents should…',
                'options': ['Validate tool args and whitelist functions', 'Execute any command', 'Ignore schemas', 'Trust free text'],
                'correctIndex': 0,
                'explanation': 'Validate and restrict tool calls to prevent abuse.'
            },
            {
                'prompt': 'Hidden text in user content can…',
                'options': ['Alter model behavior if not filtered', 'Speed GPUs', 'Improve truthfulness', 'Reduce context'],
                'correctIndex': 0,
                'explanation': 'Hidden or obfuscated text may carry adversarial instructions.'
            }
        ]
    },
    {
        'title': 'Data Poisoning & Supply Chain',
        'description': 'Edge cases in data and pipeline integrity.',
        'difficulty': 'hard',
        'questions': [
            {
                'prompt': 'A public dataset update silently changes labels. Mitigation?',
                'options': ['Pin versions and verify checksums', 'Auto-accept updates', 'Disable hashing', 'Skip validation'],
                'correctIndex': 0,
                'explanation': 'Version pinning and checksum verification catch tampering.'
            },
            {
                'prompt': 'Poisoned samples aim to…',
                'options': ['Shift model behavior toward attacker goals', 'Reduce GPU heat', 'Shorten prompts', 'Improve fairness'],
                'correctIndex': 0,
                'explanation': 'Poisoning injects samples that manipulate model behavior.'
            },
            {
                'prompt': 'To detect poisoning you can…',
                'options': ['Run outlier detection and influence functions', 'Ignore logs', 'Lower batch size', 'Hide metrics'],
                'correctIndex': 0,
                'explanation': 'Outlier/influence analyses can surface poisoned points.'
            },
            {
                'prompt': 'Supply-chain risk for models includes…',
                'options': ['Unverified pre-trained checkpoints', 'Font choices', 'CSS variables', 'Keyboard layout'],
                'correctIndex': 0,
                'explanation': 'Untrusted checkpoints can contain backdoors or license issues.'
            },
            {
                'prompt': 'A backdoor trigger is…',
                'options': ['A pattern that forces a specific output', 'A logging tool', 'A scaling knob', 'A tokenizer bug fix'],
                'correctIndex': 0,
                'explanation': 'Backdoor triggers cause targeted malicious outputs.'
            }
        ]
    },
    {
        'title': 'Model Extraction & Abuse',
        'description': 'Security of model interfaces.',
        'difficulty': 'hard',
        'questions': [
            {
                'prompt': 'Excessive unthrottled queries risk…',
                'options': ['Model extraction via output probing', 'Lower latency', 'Better alignment', 'Higher accuracy'],
                'correctIndex': 0,
                'explanation': 'Attackers can infer model weights/behaviors via many queries.'
            },
            {
                'prompt': 'A good mitigation for extraction is…',
                'options': ['Rate limits, anomaly detection, and watermarked outputs', 'Unlimited free access', 'No logging', 'Removing auth'],
                'correctIndex': 0,
                'explanation': 'Limits, detection, and watermarks make extraction harder to monetize.'
            },
            {
                'prompt': 'Why avoid echoing proprietary training snippets?',
                'options': ['Prevents IP leakage and memorization harms', 'Reduces latency only', 'Changes colors', 'Upscales images'],
                'correctIndex': 0,
                'explanation': 'Echoing memorized data leaks IP and privacy-sensitive content.'
            },
            {
                'prompt': 'Watermarking text is primarily for…',
                'options': ['Attribution and misuse tracking', 'Compression', 'Lower cost', 'Higher recall'],
                'correctIndex': 0,
                'explanation': 'Watermarks help detect model-generated text and track misuse.'
            },
            {
                'prompt': 'Response randomization can…',
                'options': ['Reduce fidelity of extraction attacks', 'Increase exact memorization', 'Expose secrets', 'Guarantee accuracy'],
                'correctIndex': 0,
                'explanation': 'Randomness makes extraction via repeated queries less precise.'
            }
        ]
    },
    {
        'title': 'Privacy & Differential Privacy',
        'description': 'Stronger privacy guarantees and trade-offs.',
        'difficulty': 'hard',
        'questions': [
            {
                'prompt': 'Differential privacy (DP) provides…',
                'options': ['Bounds on how much one record affects outputs', 'Perfect secrecy', 'Zero noise', 'Faster inference'],
                'correctIndex': 0,
                'explanation': 'DP limits the influence of any single record on results.'
            },
            {
                'prompt': 'A DP mechanism typically adds…',
                'options': ['Noise calibrated to privacy budget', 'More training epochs', 'Bigger prompts', 'Extra tokens'],
                'correctIndex': 0,
                'explanation': 'Noise is added proportional to the privacy budget (epsilon).'
            },
            {
                'prompt': 'Lower epsilon values mean…',
                'options': ['Stronger privacy, more noise', 'Weaker privacy, less noise', 'No change', 'Higher latency only'],
                'correctIndex': 0,
                'explanation': 'Smaller epsilon strengthens privacy but may hurt utility.'
            },
            {
                'prompt': 'DP-SGD mainly protects…',
                'options': ['Training data memorization', 'Tokenization speed', 'GPU temp', 'UI styles'],
                'correctIndex': 0,
                'explanation': 'DP-SGD reduces memorization of individual training points.'
            },
            {
                'prompt': 'A privacy budget composes meaning…',
                'options': ['Multiple queries consume the budget over time', 'Budget is infinite', 'Noise never accumulates', 'No tracking needed'],
                'correctIndex': 0,
                'explanation': 'Each DP query consumes part of the privacy budget; composition matters.'
            }
        ]
    },
    {
        'title': 'Red Teaming & Evaluation',
        'description': 'Advanced safety testing scenarios.',
        'difficulty': 'hard',
        'questions': [
            {
                'prompt': 'Red teaming focuses on…',
                'options': ['Actively probing for failures and unsafe behavior', 'UI polish only', 'Model size', 'GPU drivers'],
                'correctIndex': 0,
                'explanation': 'Red teams stress-test systems for failures and policy gaps.'
            },
            {
                'prompt': 'Effective red-team prompts are…',
                'options': ['Targeted, diverse, and adversarial', 'Random emojis', 'Short greetings only', 'Latency tests'],
                'correctIndex': 0,
                'explanation': 'Adversarial, diverse prompts expose weaknesses.'
            },
            {
                'prompt': 'Safety evals should be…',
                'options': ['Run regularly and before major releases', 'One-time only', 'Unlogged', 'Unscored'],
                'correctIndex': 0,
                'explanation': 'Regular evals catch regressions and new risks.'
            },
            {
                'prompt': 'When a jailbreak is found, you…',
                'options': ['Patch prompts/filters and add it to regression tests', 'Ignore it', 'Ship immediately', 'Remove logging'],
                'correctIndex': 0,
                'explanation': 'Fix the issue and add the case to regression suites.'
            },
            {
                'prompt': 'Why involve domain experts in red teaming?',
                'options': ['They know realistic, high-impact attack patterns', 'For decoration', 'To slow reviews', 'To remove context'],
                'correctIndex': 0,
                'explanation': 'Domain experts design realistic, relevant adversarial tests.'
            }
        ]
    }
]

# Create quizzes
created_count = 0
for quiz_data in hard_quizzes:
    quiz, created = Quiz.objects.get_or_create(
        title=quiz_data['title'],
        difficulty=quiz_data['difficulty'],
        defaults={
            'description': quiz_data['description'],
            'questions': quiz_data['questions'],
            'is_active': True,
            'is_deleted': False
        }
    )
    if created:
        created_count += 1
        print(f"✓ Created: {quiz.title}")
    else:
        print(f"- Already exists: {quiz.title}")

print(f"\nTotal hard quizzes created: {created_count}")
print(f"Total hard quizzes in database: {Quiz.objects.filter(difficulty='hard').count()}")
