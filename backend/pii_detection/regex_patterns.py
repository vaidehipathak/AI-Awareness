import re

UPI_HANDLES = (
    "upi|ybl|oksbi|okicici|okaxis|okhdfcbank|cnrb|"
    "barodampay|paytm|apl|ibl|axisbank|sbi|hdfcbank"
)

REGEX_PATTERNS = {
    # Identity
    "AADHAAR": r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b",
    "VID": r"\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b",
    "PAN": r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",

    # Financial (exclude 12-digit to avoid Aadhaar overlap)
    "CREDIT_DEBIT_CARD": r"\b(?:\d{4}[- ]?){3}\d{4}\b",
    "BANK_ACCOUNT": r"\b(?:\d{11}|\d{13,18})\b",
    "UPI_ID": rf"\b[a-zA-Z0-9.\-_]{{2,}}@({UPI_HANDLES})\b",

    "CVV": r"\b\d{3}\b",

    # Contact
    "PHONE": r"\b[6-9]\d{9}\b",
    "EMAIL": r"\b[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\b",

    # Date
    "DOB": r"\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b",

    # Masked (bills)
    "MASKED_PHONE": r"\b\d\*{6,8}\d{2}\b",
    "MASKED_EMAIL": r"\b[a-zA-Z]{1,3}\*+[\w\d]*@\w+\*+\.\w+\b",
    "MASKED_PAN": r"\b[A-Z]{2}\*{4,6}\d[A-Z]\b",

    # Utility
    "UTILITY_ACCOUNT": r"\b\d{8,14}\b"
}

def regex_candidates(text):
    hits = []
    for t, pattern in REGEX_PATTERNS.items():
        for m in re.finditer(pattern, text, re.IGNORECASE):
            hits.append({
                "type": t,
                "value": m.group(),
                "start": m.start(),
                "end": m.end(),
                "source": "regex"
            })
    return hits
