import re

# Strict Regex Patterns
# Designed to ignore common placeholders and variable names

PATTERNS = {
    "EMAIL_ADDRESS": r"(?i)\b(?!(?:example|test|sample|user|admin|info|contact|support)@)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
    
    # Phone: E.164 or common formats, must have at least 10 digits/separators. 
    # Avoid matching config versions like 1.2.3.4
    "PHONE_NUMBER": r"\b(?:\+?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b",
    
    # Validation handled by Luhn, matching sequence of 13-19 digits
    "CREDIT_CARD": r"\b(?:\d[ -]*?){13,19}\b",
    
    # US SSN: Strict formatting
    "US_SSN": r"\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b",
    
    # IPv4: Exclude local/private IPs if desired? 
    # For now standard IPv4
    "IP_ADDRESS": r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
}

def get_patterns():
    return PATTERNS
