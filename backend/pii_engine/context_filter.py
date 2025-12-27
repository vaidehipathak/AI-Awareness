import re

def is_context_safe(text: str, start: int, end: int) -> bool:
    """
    Returns True if the match seems to be in a SAFE context (Code, Comment, Config).
    Returns False if it looks like real PII in text.
    """
    if not text:
        return True # Empty text -> Safe/Ignore

    # 1. Get Line Context
    line_start = text.rfind('\n', 0, start) + 1
    line_end = text.find('\n', end)
    if line_end == -1:
        line_end = len(text)
    
    line = text[line_start:line_end]
    line_lower = line.lower()
    
    # 2. Check for Code/Config Artifacts in the line
    # Variable assignments
    if re.search(r"(=|:|const|var|let|def|class|function|=>|return)\s", line):
        return True 

    # Comments
    stripped = line.strip()
    if stripped.startswith(('#', '//', '/*', '*', '<!--')):
        return True
        
    # JSON/YAML keys (e.g. "email": "...")
    if re.search(r"[\"']\w+[\"']\s*:", line):
        return True

    # 3. Check specific keywords nearby in the line that suggest documentation/placeholders
    if any(k in line_lower for k in ['example', 'sample', 'dummy', 'placeholder', 'demo']):
        return True
        
    return False
