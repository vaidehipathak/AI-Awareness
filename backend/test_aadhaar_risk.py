import sys
import os

sys.path.append(os.getcwd())

try:
    from core.ai_detection.pdf_text_detector import detect_pdf_ai
    
    # Simulate Aadhaar card text
    text = """
    Government of India
    Aadhaar Card
    Name: John Doe
    Aadhaar Number: 8364 6808 1447
    VID: 9128 6953 0461 3178
    Phone: 9769774759
    """
    
    print("Testing Aadhaar risk assessment...")
    result = detect_pdf_ai(text, {"source": "test_aadhaar"})
    
    print(f"\n✅ Risk Label: {result['risk_label']}")
    print(f"✅ Risk Score: {result['risk_score']}")
    print(f"✅ Verdict: {result['verdict']}")
    print(f"✅ Explanation: {result['explanation']}")
    
    # Check PII results
    pii_res = next((r for r in result["results"] if r["type"] == "PII_DETECTION"), None)
    if pii_res:
        print(f"\n✅ PII Entities Found: {len(pii_res['entities'])}")
        for e in pii_res['entities']:
            print(f"  - {e['type']}: {e.get('value', 'N/A')}")
    
    # Verify HIGH risk
    if result['risk_label'] == 'HIGH':
        print("\n✅✅✅ PASS: Aadhaar correctly triggers HIGH risk!")
    else:
        print(f"\n❌❌❌ FAIL: Expected HIGH, got {result['risk_label']}")
        
except Exception as e:
    print(f"❌ Test Failed: {e}")
    import traceback
    traceback.print_exc()
