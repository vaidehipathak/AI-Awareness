import re
import collections
from typing import List, Dict, Any
from .regex_patterns import get_patterns
from .context_filter import is_context_safe
from .confidence_engine import score_entity

def detect(text: str) -> List[Dict[str, Any]]:
    """
    Core PII Detection Logic.
    1. Scan via Regex
    2. Filter Context (Code, Docs)
    3. Score Confidence
    4. Return valid entities
    """
    if not text:
        return []
        
    findings = []
    patterns = get_patterns()
    
    unique_matches = set()

    for p_type, regex in patterns.items():
        for match in re.finditer(regex, text):
            val = match.group()
            start = match.start()
            end = match.end()
            
            # 1. Dedup
            match_id = f"{p_type}:{start}:{end}"
            if match_id in unique_matches:
                continue
                
            # 2. Context Check (Suppress Code/Docs)
            if is_context_safe(text, start, end):
                continue
                
            # 3. Confidence Score (+ Validation)
            conf = score_entity(p_type, val)
            if conf < 0.7:
                continue
                
            unique_matches.add(match_id)
            findings.append({
                "type": p_type,
                "value": val,
                "confidence": conf,
                "start": start,
                "end": end
            })
            
    return findings
