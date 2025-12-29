import re

# Strict Regex Patterns
# Designed to ignore common placeholders and variable names

PATTERNS = {
    # Strict Email: avoids common placeholders like user@, admin@, test@
    "EMAIL_ADDRESS": r"(?i)\b(?!(?:example|test|sample|user|admin|info|contact|support|noreply|docs)@)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
    
    # Phone: Strict E.164 or US format. 
    # Must have at least 10 digits. 
    # Negative lookahead avoids version numbers (e.g. 1.2.3.4) by ensuring not surrounded by dots/digits inappropriately.
    # Matches: +1-555-010-9999, (555) 123-4567, 555.123.4567 (if followed by valid structure)
    "PHONE_NUMBER": r"(?<!\d\.)(?<!\d)\+?1?[-. ]?\(?([2-9]\d{2})\)?[-. ]?(\d{3})[-. ]?(\d{4})(?!\.\d)\b",
    
    # Credit Card: 13-19 digits, various separators
    "CREDIT_CARD": r"\b(?:\d[ -]*?){13,19}\b",
    
    # US SSN: Strict formatting 000-00-0000
    "US_SSN": r"\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b",
    
    # IPv4: Standard dot notation
    "IP_ADDRESS": r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
}

def get_patterns():
    return PATTERNS
