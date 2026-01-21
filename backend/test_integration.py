import sys
import os

sys.path.append(os.getcwd())

try:
    from core.ai_detection.pdf_text_detector import detect_pdf_ai
    
    text = "Important document. Contact me at alice@example.org or call 555-0199."
    print(f"Analyzing text: {text}")
    
    result = detect_pdf_ai(text, {"source": "test_script"})
    
    # Check Findings
    pii_res = next((r for r in result["results"] if r["type"] == "PII_DETECTION"), None)
    
    if pii_res:
        print("✅ PII Detected!")
        print("Explanation:", pii_res["explanation"])
        print("Entities:", pii_res["entities"])
    else:
        print("❌ PII Not Detected (Unexpected)")
        
    print("Full Risk Label:", result["risk_label"])
    
except Exception as e:
    print(f"Integration Test Failed: {e}")
