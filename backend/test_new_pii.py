import sys
import os

sys.path.append(os.getcwd())

try:
    from pii_module.pii_engine import detect_pii
    
    # Test with Aadhaar and other India-specific PII
    text = """
    My Aadhaar is 1234 5678 9012 and PAN is ABCDE1234F.
    Contact: alice@example.com or 9876543210
    UPI: user@paytm
    """
    
    print("Testing new PII module with India-specific entities...")
    results = detect_pii(text)
    
    print(f"\n✅ Detected {len(results)} PII entities:\n")
    for r in results:
        print(f"  - {r['type']}: {r['value']} (confidence: {r['confidence']})")
    
    # Check for new features
    if any(r['type'] == 'AADHAAR' for r in results):
        print("\n✅ Aadhaar detection working!")
    if any(r['type'] == 'PAN' for r in results):
        print("✅ PAN detection working!")
    if any(r['type'] == 'UPI_ID' for r in results):
        print("✅ UPI detection working!")
        
except Exception as e:
    print(f"❌ Test Failed: {e}")
    import traceback
    traceback.print_exc()
