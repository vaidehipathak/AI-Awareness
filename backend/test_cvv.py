import os
import sys

# Add backend directory to sys path so we can import from pii_detection
backend_dir = r"c:\Users\pooja\OneDrive\Desktop\AI-Awareness\backend"
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from pii_detection.pii_engine import detect_pii

sample_text = """MockBank Credit Card
4111 1111 1111 1111
CARDHOLDER NAME VALID THRU CVV
JOHN DOE 12/28 842"""

results = detect_pii(sample_text)
print("Detected PIIs:")
for r in results:
    print(r)
