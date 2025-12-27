import re

def _luhn_check(card_number: str) -> bool:
    digits = [int(d) for d in re.sub(r'\D', '', card_number)]
    checksum = 0
    reverse = digits[::-1]
    for i, d in enumerate(reverse):
        if i % 2 == 1:
            doubled = d * 2
            checksum += doubled if doubled < 10 else doubled - 9
        else:
            checksum += d
    return (checksum % 10) == 0

def score_entity(entity_type: str, value: str) -> float:
    """
    Calculate confidence score (0.0 - 1.0).
    Returns 0.0 if invalid.
    """
    score = 0.0
    
    if entity_type == "EMAIL_ADDRESS":
        # Regex handled structure, checking domains
        if any(d in value.lower() for d in ['example.com', 'test.com', 'localhost']):
            return 0.0
        return 0.95
        
    elif entity_type == "PHONE_NUMBER":
        digits = re.sub(r'\D', '', value)
        if len(digits) < 10:
            return 0.0
        return 0.85
        
    elif entity_type == "CREDIT_CARD":
        if _luhn_check(value):
            return 1.0
        return 0.0
        
    elif entity_type == "US_SSN":
        return 0.9
        
    elif entity_type == "IP_ADDRESS":
        # Check valid range 0-255
        try:
            parts = [int(p) for p in value.split('.')]
            if all(0 <= p <= 255 for p in parts):
                return 0.8
        except:
            pass
        return 0.0
        
    return 0.7 # Default for others
