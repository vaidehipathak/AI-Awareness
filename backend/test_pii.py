import sys
import os

# Add backend to path so imports work
sys.path.append(os.getcwd())

try:
    from pii_module.pii_engine import detect_pii
    
    text = "My name is John Doe and my email is john.doe@example.com."
    results = detect_pii(text)
    print("PII Results:", results)
    
except Exception as e:
    print(f"PII Test Failed: {e}")
