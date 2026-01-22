
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core.ai_client import lmstudio_chat

try:
    print("Testing Groq API connection...")
    messages = [{"role": "user", "content": "Hello, are you online?"}]
    response = lmstudio_chat(messages)
    print(f"\nSUCCESS! Response from Groq:\n{response}")
except Exception as e:
    print(f"\nFAILURE: {e}")
