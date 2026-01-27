import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core.ai_client import lmstudio_chat

try:
    print("Testing Custom Ollama Model (ai-awareness-core)...")
    messages = [{"role": "user", "content": "Hello, who are you? Briefly describe your purpose."}]
    response = lmstudio_chat(messages)
    print(f"\nSUCCESS! Response from Ollama:\n{response}")
except Exception as e:
    print(f"\nFAILURE: {e}")
