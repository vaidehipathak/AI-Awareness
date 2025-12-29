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
        val_lower = value.lower()
        # Debug
        # print(f"DEBUG SCORE: {value} -> {val_lower}")
        # Reject specific domains and users often used in docs
        if any(d in val_lower for d in ['example.com', 'test.com', 'localhost', 'domain.com', 'foo.com', 'bar.com']):
            return 0.0
        # Reject documentation placeholder patterns
        if val_lower.startswith(('user@', 'admin@', 'support@', 'docs@', 'info@')):
            return 0.0
        return 0.95
        
    elif entity_type == "PHONE_NUMBER":
        digits = re.sub(r'\D', '', value)
        if len(digits) < 10:
            return 0.0
        # Reject US TV/Movies "555" fake numbers (Exchange 555)
        # Check area code + 555
        # 4th-6th digits are 555
        if len(digits) == 10 and digits[3:6] == '555':
            return 0.0
        # Reject Repeating digits (e.g. 1111111111)
        if len(set(digits)) == 1:
            return 0.0
        return 0.85
        
    elif entity_type == "CREDIT_CARD":
        if _luhn_check(value):
            return 1.0
        return 0.0
        
    elif entity_type == "US_SSN":
        return 0.9
        
    elif entity_type == "IP_ADDRESS":
        # Check valid range 0-255 AND Filter Private IPs
        try:
            parts = [int(p) for p in value.split('.')]
            if not all(0 <= p <= 255 for p in parts):
                return 0.0
            
            # Private / Local Ranges (Not risky Personal Data usually)
            # 127.0.0.0/8
            if parts[0] == 127: return 0.0
            # 10.0.0.0/8
            if parts[0] == 10: return 0.0
            # 192.168.0.0/16
            if parts[0] == 192 and parts[1] == 168: return 0.0
            # 172.16.0.0/12 (172.16 - 172.31)
            if parts[0] == 172 and 16 <= parts[1] <= 31: return 0.0
            # 0.0.0.0
            if parts[0] == 0: return 0.0
                
            return 0.8
        except:
            pass
        return 0.0
        
    return 0.7 # Default for others
