SENSITIVE_KEYWORDS = {
    "AADHAAR": ["aadhaar"],
    "VID": ["vid", "virtual id"],
    "DOB": ["dob", "date of birth", "birth", "born", "birthday", "age"],
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

# Keywords that indicate the number is NOT PII (e.g., transaction IDs)
NEGATIVE_KEYWORDS = {
    "AADHAAR": [
        "transaction", "txn", "reference", "ref", "order", "receipt",
        "invoice", "bill no", "transaction id", "upi transaction",
        "payment id", "reference no", "ref no", "order id",
        # Utility bill keywords
        "consumer", "ca no", "consumer number", "bill no", "bill number",
        "meter no", "meter number", "account no", "account number",
        "service no", "service number", "customer no", "customer number"
    ],
    "BANK_ACCOUNT": [
        "transaction", "txn", "reference", "ref no", "order id",
        "upi id", "google transaction",
        # Utility bill keywords
        "consumer", "ca no", "consumer number", "bill no", "bill number",
        "meter no", "meter number", "service no", "service number",
        "customer no", "customer number"
    ],
    "DOB": [
        "issued", "issue", "enrollment", "enrolment", "registered",
        "valid", "expiry", "expire", "generated", "created"
    ],
    "PHONE": [
        "pin", "code", "zip", "postal"
    ]
}




def keyword_score(text, pii_type, start, end, window=40):
    text = text.lower()
    context = text[max(0, start-window):min(len(text), end+window)]

    # Check for negative keywords first (transaction IDs, etc.)
    if pii_type in NEGATIVE_KEYWORDS:
        for neg_kw in NEGATIVE_KEYWORDS[pii_type]:
            if neg_kw in context:
                return -0.5  # Strong negative signal - likely not PII

    # CVV is EXTREMELY strict - must have "cvv" keyword nearby
    # Too many false positives (room numbers, PIN codes, enrollment numbers, etc.)
    if pii_type == "CVV":
        return 0.3 if "cvv" in context else -1.0  # MANDATORY keyword for CVV

    # UTILITY_ACCOUNT is also strict - must have utility-related keywords
    # Too many false positives (random numbers, codes, etc.)
    if pii_type == "UTILITY_ACCOUNT":
        return 0.3 if any(k in context for k in UTILITY_KEYWORDS) else -1.0  # MANDATORY

    # DOB is also strict - must have birth-related keywords
    # Too many false positives (any date gets detected: bill dates, transaction dates, etc.)
    if pii_type == "DOB":
        return 0.3 if any(k in context for k in SENSITIVE_KEYWORDS["DOB"]) else -1.0  # MANDATORY

    # Check for keywords and boost confidence if found
    if pii_type == "UPI_ID":
        return 0.3 if any(k in context for k in SENSITIVE_KEYWORDS["UPI_ID"]) else 0.1

    for kw in SENSITIVE_KEYWORDS.get(pii_type, []):
        if kw in context:
            return 0.3
    
    if pii_type.startswith("MASKED_"):
        return 0.2
    return 0.1



