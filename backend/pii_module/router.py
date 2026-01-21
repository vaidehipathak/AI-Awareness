from pii_module.pii_engine import detect_pii
from pii_module.risk_engine import calculate_risk
from pii_module.masking import mask_value

def model_router(text):
    pii = detect_pii(text)
    risk, score = calculate_risk(pii)

    masked = [
        {
            "type": p["type"],
            "masked_value": mask_value(p["type"], p["value"]),
            "confidence": p["confidence"]
        }
        for p in pii
    ]

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
        "detected_pii": masked
    }
