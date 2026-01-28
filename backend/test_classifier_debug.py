
import os
import sys
import django

# Setup Django path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from core.safety import classify_user_message, CLASSIFIER_SYSTEM_PROMPT
from core.ai_client import lmstudio_chat

test_input = "introduce me to AI"

print(f"--- Debugging Classifier for input: '{test_input}' ---")

# Method 1: Direct raw call to see what the model actually says
print("\n[Step 1] Calling Model directly with System Prompt...")
messages = [
    {"role": "system", "content": CLASSIFIER_SYSTEM_PROMPT},
    {"role": "user", "content": test_input}
]
raw_response = lmstudio_chat(messages, temperature=0.0, max_tokens=20)
print(f"RAW MODEL OUTPUT: '{raw_response}'")

# Method 2: Calling the wrapper function
print("\n[Step 2] Calling classify_user_message()...")
label = classify_user_message(test_input)
print(f"FINAL PARSED LABEL: {label}")
