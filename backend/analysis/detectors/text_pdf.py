from typing import Dict, Any, List


def detect(text: str, metadata: dict) -> dict:
    # Basic logic: If text contains words like "confidential" or "password"
    threats = ["password", "secret", "private key", "confidential"]
    found = [word for word in threats if word in text.lower()]
    
    score = 0.8 if found else 0.1
    
    return {
        "detection_type": "text_pdf",
        "confidence_score": score,
        "flags": found,
        "short_explanation": f"Detected {len(found)} suspicious keywords." if found else "No suspicious keywords found."
    }
