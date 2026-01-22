from .presidio_engine import detect_pii_presidio
from .regex_patterns import regex_candidates
from .keyword_context import keyword_score
from .confidence_engine import compute_confidence
from .aadhaar_validator import is_valid_aadhaar


PII_PRIORITY = {
    "AADHAAR": 5, "VID": 5, "PAN": 5,
    "CREDIT_DEBIT_CARD": 4, "CVV": 5,
    "UPI_ID": 4, "BANK_ACCOUNT": 3,
    "PHONE": 2, "EMAIL": 2,
    "DOB": 3, "URL": 1,
    "UTILITY_ACCOUNT": 2,
    "MASKED_PHONE": 1,
    "MASKED_EMAIL": 1,
    "MASKED_PAN": 1
}

REGEX_ONLY = {
    "AADHAAR","VID","PAN","BANK_ACCOUNT",
    "CREDIT_DEBIT_CARD","CVV","UPI_ID",
    "DOB","UTILITY_ACCOUNT",
    "MASKED_PHONE","MASKED_EMAIL","MASKED_PAN"
}

def overlaps(a, b, c, d):
    return not (b <= c or d <= a)

def detect_pii(text):
    final_hits = []

    # 1️⃣ Presidio (safe entities only)
    for h in detect_pii_presidio(text):
        final_hits.append(h)

    # 2️⃣ Regex (India-specific)
    for h in regex_candidates(text):
        if h["type"] not in REGEX_ONLY:
            continue

        # Validate Aadhaar checksum to prevent false positives
        if h["type"] == "AADHAAR":
            # 1. Check strict mathematical validity
            is_valid_checksum = is_valid_aadhaar(h["value"])
            
            # 2. Check context (e.g. "Father", "DOB", "Male/Female" nearby)
            # We calculate this specifically for validation
            ctx_bonus = keyword_score(text, "AADHAAR", h["start"], h["end"])
            
            # 3. Decision Logic:
            # - Valid Checksum -> Keep
            # - Invalid Checksum BUT High Context (>= 0.3) -> Keep (Assume OCR error or dummy card)
            # - Invalid Checksum AND Low Context -> Discard (Likely random numbers)
            
            if not is_valid_checksum and ctx_bonus < 0.3:
                continue  # Skip only if BOTH checksum is invalid AND context is missing

        # Skip bank account numbers that are part of UPI IDs
        if h["type"] == "BANK_ACCOUNT":
            # Check if this number is followed by @ (part of UPI ID)
            if h["end"] < len(text) and text[h["end"]] == "@":
                continue  # This is part of a UPI ID, not a standalone bank account

        bonus = keyword_score(text, h["type"], h["start"], h["end"])
        if bonus < 0:
            continue

        conf = compute_confidence("regex", bonus)
        if conf < 0.65 and not (h["type"] == "AADHAAR" and ctx_bonus >= 0.3):
             continue  # Allow Aadhaar through if context is high, even if confidence is borderline


        # Suppress overlaps
        if any(
            overlaps(h["start"], h["end"], f["start"], f["end"]) and
            PII_PRIORITY.get(f["type"],0) >= PII_PRIORITY.get(h["type"],0)
            for f in final_hits
        ):
            continue

        final_hits.append({
            "type": h["type"],
            "value": h["value"],
            "confidence": round(conf,2),
            "start": h["start"],
            "end": h["end"]
        })

    # Deduplicate
    seen = set()
    cleaned = []
    for h in sorted(final_hits, key=lambda x: -PII_PRIORITY.get(x["type"],0)):
        key = (h["type"], h["value"])
        if key not in seen:
            seen.add(key)
            cleaned.append(h)

    return cleaned
