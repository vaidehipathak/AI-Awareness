SENSITIVE_KEYWORDS = {
    "AADHAAR": ["aadhaar"],
    "VID": ["vid", "virtual id"],
    "DOB": ["dob", "date of birth", "birth"],
    "EMAIL": ["email", "mail"],
    "PHONE": ["phone", "mobile"],
    "BANK_ACCOUNT": ["bank", "account"],
    "CREDIT_DEBIT_CARD": ["card"],
    "CVV": ["cvv"],
    "UPI_ID": ["upi", "pay", "payment", "gpay", "google pay", "phonepe", "bhim", "id"]
}

UTILITY_KEYWORDS = [
    "consumer", "ca no", "bill no", "account no",
    "meter no", "service no"
]



def keyword_score(text, pii_type, start, end, window=40):
    text = text.lower()
    context = text[max(0, start-window):min(len(text), end+window)]

    # Strict rules
    if pii_type == "DOB":
        return 0.3 if any(k in context for k in SENSITIVE_KEYWORDS["DOB"]) else -1.0

    if pii_type == "CVV":
        return 0.3 if "cvv" in context else -1.0

    if pii_type == "UPI_ID":
        return 0.3 if any(k in context for k in SENSITIVE_KEYWORDS["UPI_ID"]) else -1.0

    for kw in SENSITIVE_KEYWORDS.get(pii_type, []):
        if kw in context:
            return 0.3
    if pii_type == "UTILITY_ACCOUNT":
        return 0.3 if any(k in context for k in UTILITY_KEYWORDS) else -1.0

    if pii_type.startswith("MASKED_"):
        return 0.2
    return 0.0
