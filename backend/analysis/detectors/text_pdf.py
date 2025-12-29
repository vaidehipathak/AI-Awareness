# backend/analysis/detectors/text_pdf.py
from core.ai_detection.pdf_text_detector import detect_pdf_ai

def detect(text: str, metadata: dict) -> dict:
    """
    This bridges the Router to the heavy-duty DistilGPT2 model.
    """
    if not text or len(text.strip()) < 10:
        return {
            "detection_type": "text_pdf",
            "confidence_score": 0.0,
            "flags": ["Empty or too short"],
            "short_explanation": "Not enough text to analyze."
        }

    # Call the heavy-duty logic from core
    # We pass the text directly. 
    raw_result = detect_pdf_ai(text)
    
    # Extract the internal result dictionary
    data = raw_result["results"][0]

    return {
        "detection_type": "text_pdf",
        "confidence_score": data.get("risk_score", 0.0),
        "flags": [data.get("verdict", "Unknown")],
        "short_explanation": data.get("explanation", "")
    }