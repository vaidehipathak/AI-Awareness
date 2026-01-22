from .pii_engine import detect_pii
from .risk_engine import calculate_risk
from .masking import mask_value
from .privacy_educator import generate_privacy_education

def model_router(text):
    pii = detect_pii(text)
    risk, score = calculate_risk(pii)

    masked = [
        {
            "type": p["type"],
            "masked_value": mask_value(p["type"], p["value"]),
            "confidence": p["confidence"],
            "start": p["start"],
            "end": p["end"],
            "value": p["value"] # Keep original for backend logic if needed, but masked is for display
        }
        for p in pii
    ]
    
    # Generate education tips
    education = generate_privacy_education(masked, risk)

    if risk == "HIGH":
        action = "BLOCK"
    elif risk == "MEDIUM":
        action = "WARN_AND_PROCESS"
    else:
        action = "PROCESS"

    return {
        "action": action,
        "risk_level": risk,
        "risk_score": score,
        "detected_pii": masked,
        "privacy_tips": education
    }
