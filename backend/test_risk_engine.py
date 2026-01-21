import sys
import os

sys.path.append(os.getcwd())

try:
    from core.ai_detection.pdf_text_detector import detect_pdf_ai
    
    # Test with various PII combinations
    test_cases = [
        {
            "name": "Critical PII (Aadhaar + UPI)",
            "text": "My Aadhaar: 1234 5678 9012, UPI: user@paytm"
        },
        {
            "name": "Sensitive PII (Phone + DOB)",
            "text": "Contact: 9876543210, DOB: 15-08-1990"
        },
        {
            "name": "Moderate PII (Email only)",
            "text": "Email me at john.doe@example.com"
        },
        {
            "name": "Mixed PII (Aadhaar + PAN + Phone)",
            "text": "Aadhaar: 8364 6808 1447, PAN: ABCDE1234F, Phone: 9769774759"
        }
    ]
    
    for test in test_cases:
        print(f"\n{'='*60}")
        print(f"Test: {test['name']}")
        print(f"{'='*60}")
        
        result = detect_pdf_ai(test['text'], {"source": "test"})
        
        print(f"Risk Label: {result['risk_label']}")
        print(f"Risk Score: {result['risk_score']}")
        print(f"Verdict: {result['verdict']}")
        
        pii_res = next((r for r in result.get("results", []) if r["type"] == "PII_DETECTION"), None)
        if pii_res:
            print(f"\nPII Entities: {len(pii_res['entities'])}")
            for e in pii_res['entities']:
                print(f"  - {e['type']}: {e.get('value', 'N/A')}")
            
            print(f"\nWeighted Risk Score: {pii_res.get('risk_score_weighted', 0)}")
            
            print("\nPrivacy Tips:")
            for tip in pii_res.get('privacy_tips', []):
                print(f"  • {tip}")
        
        print()
        
except Exception as e:
    print(f"❌ Test Failed: {e}")
    import traceback
    traceback.print_exc()
