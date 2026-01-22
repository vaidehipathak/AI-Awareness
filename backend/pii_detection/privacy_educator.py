def generate_privacy_education(detections, risk):
    msgs = []
    types = {d["type"] for d in detections}

    if "UPI_ID" in types:
        msgs.append("UPI IDs are linked to bank accounts. Never share them publicly.")
    if "AADHAAR" in types:
        msgs.append("Aadhaar numbers should never be shared.")
    if any(t.startswith("MASKED_") for t in types):
        msgs.append("Masked personal data detected. This is good privacy practice.")
    if "UTILITY_ACCOUNT" in types:
        msgs.append("Utility account numbers can still be misused if shared.")
    if risk == "HIGH":
        msgs.append("HIGH RISK: Please redact sensitive data before sharing.")

    if not msgs:
        msgs.append("No major privacy risks detected.")

    return msgs
