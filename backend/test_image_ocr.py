import sys
import os

sys.path.append(os.getcwd())

try:
    from core.ai_detection.pdf_text_detector import detect_pdf_ai
    
    # Test with a sample image path (you'll need to provide a real image)
    test_image_path = "test_aadhaar_image.png"
    
    if os.path.exists(test_image_path):
        with open(test_image_path, 'rb') as f:
            image_bytes = f.read()
        
        print(f"Testing OCR PII detection on image: {test_image_path}")
        result = detect_pdf_ai(image_bytes=image_bytes, metadata={"source": "test_image"})
        
        print(f"\n✅ Risk Label: {result['risk_label']}")
        print(f"✅ Verdict: {result['verdict']}")
        print(f"✅ Detectors: {result.get('detectors_executed', [])}")
        
        # Check PII results
        pii_res = next((r for r in result.get("results", []) if r["type"] == "PII_DETECTION"), None)
        if pii_res:
            print(f"\n✅ PII Entities Found: {len(pii_res['entities'])}")
            for e in pii_res['entities']:
                print(f"  - {e['type']}: {e.get('value', 'N/A')}")
        else:
            print("\n⚠️ No PII detected")
    else:
        print(f"❌ Test image not found: {test_image_path}")
        print("Please provide a test image (Aadhaar card, etc.) to test OCR")
        
except Exception as e:
    print(f"❌ Test Failed: {e}")
    import traceback
    traceback.print_exc()
