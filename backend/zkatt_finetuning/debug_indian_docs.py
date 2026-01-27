from renderer import render_to_pdf

import traceback

print("--- Debugging High-Fidelity Indian Docs ---")

def test_render(name, content, intent):
    print(f"\nRendering {name}...")
    try:
        render_to_pdf(content, f"debug_{name}", intent)
        print(f"SUCCESS: {name}")
    except Exception:
        traceback.print_exc()

# 1. Bank of India Clone Checking
print("Rendering Bank of India Clone...")
intent_boi = {
    "document_domain": "financial",
    "branding_profile": {"primary_color_hex": "#FFA500", "logo_concept": "star"} # Should trigger 'bank of india' check if I add it to intent string check or if I pass a string to run.
    # Wait, render_to_pdf takes intent_profile dict. 
    # My logic checks: if "bank of india" in str(intent_profile).lower()
}
# Using a key that ensures "bank of india" is in the string representation
intent_boi["raw_intent"] = "Generate a Bank of India statement" 

content_boi = """
**ACCOUNT HOLDER DETAILS**
John Doe
+91 9876543210
123, MG Road, Mumbai

**ACCOUNT DETAILS**
Savings Account
Balance: INR 50,000

| Date | Narration | Debit | Credit | Balance |
|---|---|---|---|---|
| 01/01/2024 | UPI/12345/Payment | 500.00 | | 49,500.00 |
"""
test_render("boi_fidelity", content_boi, intent_boi)


# 2. Aadhaar Card Checking
print("Rendering Aadhaar Clone...")
intent_aadhaar = {
    "document_domain": "identity_document",
    "raw_intent": "fake aadhaar card for verifying age"
}
content_aadhaar = """
Name: Rahul Kumar
DOB: 12/05/1990
Gender: Male
Address: H.No 123, Sector 45, Gurgaon, Haryana, 122003
"""
test_render("aadhaar_fidelity", content_aadhaar, intent_aadhaar)


# 3. PAN Card Checking
print("Rendering PAN Clone...")
intent_pan = {
    "document_domain": "identity_document",
    "raw_intent": "pan card copy"
}
content_pan = """
Name: RAHUL KUMAR
Father's Name: SURESH KUMAR
DOB: 12/05/1990
Permanent Account Number: ABCDE1234F
"""
test_render("pan_fidelity", content_pan, intent_pan)

print("Done. Check output folder.")
