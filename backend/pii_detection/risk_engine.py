CRITICAL = {
    "AADHAAR","VID","PAN","BANK_ACCOUNT",
    "CREDIT_DEBIT_CARD","CVV","UPI_ID"
}

SENSITIVE = {"DOB","PHONE"}  # Names are sensitive PII
MODERATE = {"EMAIL","URL","UTILITY_ACCOUNT"}
LOW = {"MASKED_PHONE","MASKED_EMAIL","MASKED_PAN"}

def calculate_risk(pii):
    score = 0
    critical = False

    for p in pii:
        t, c = p["type"], p["confidence"]
        if t in CRITICAL:
            critical = True
            score += c * 8
        elif t in SENSITIVE:
            score += c * 4
        elif t in MODERATE:
            score += c * 3
        elif t in LOW:
            score += c * 1

    if critical:
        return "HIGH", round(score,2)
    if score >= 6:
        return "MEDIUM", round(score,2)
    if score > 0:
        return "LOW", round(score,2)
    return "NONE", 0
