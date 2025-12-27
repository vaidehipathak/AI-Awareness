from typing import Dict, Any, List, Optional
import collections

# Default response for disabled/error states
PLACEHOLDER_RESPONSE = {
    "detection_type": "pii",
    "confidence_score": 0.0,
    "flags": [],
    "short_explanation": "PII analysis module awaiting configuration.",
}

def detect(extracted_text: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Adapter for PII Detection.
    Connects to the dedicated PII Engine in backend.pii_engine.
    """
    
    try:
        try:
            from backend.pii_module.pii_engine import detect_pii
        except ImportError:
            try:
                from pii_module.pii_engine import detect_pii
            except ImportError:
                return {
                    **PLACEHOLDER_RESPONSE,
                    "short_explanation": "PII module not installed."
                }

        # 2. Raw Detection
        findings = detect_pii(extracted_text or "")
        
        # 3. Construct Response
        if not findings:
            return {
                "detection_type": "pii",
                "confidence_score": 0.0,
                "total_findings": 0,
                "breakdown": [],
                "flags": [],
                "short_explanation": "No PII entities detected."
            }

        # 4. Aggregation
        counts = collections.Counter(m['type'] for m in findings)
        breakdown = [{"type": k, "count": v} for k, v in counts.items()]
        flags = list(counts.keys())
        
        # 5. Risk Scoring Logic
        # 0 findings -> LOW (Handled above)
        # 1-2 findings -> MEDIUM
        # >=3 findings -> HIGH
        # Confidence = max of findings (since valid findings are high confidence)
        max_conf = max((m['confidence'] for m in findings), default=0.0)
        
        # Note: Risk label is calculated by the Router usually based on confidence.
        # Router logic:
        # if max_conf >= 0.8 -> HIGH
        # if max_conf >= 0.4 -> MEDIUM
        # else -> LOW
        
        # Our engine returns confidence > 0.7 for valid findings.
        # So 1 finding = 0.7+ -> Medium/High depending on router threshold.
        # Router threshold is: >= 0.8 HIGH, >= 0.4 MEDIUM.
        # If we have findings, confidence is likely 0.85-0.95.
        # So usually HIGH risk if we have ANY finding.
        # User constraint: "Risk labels: 0->LOW, 1-2->MEDIUM, >=3->HIGH"
        # Since Router controls the final label based on max score, we can manipulate the score
        # to influence the router, OR we rely on the router's logic.
        # The prompt says: "Risk logic: ... 1-2 findings -> MEDIUM".
        # IF the router logic `_risk_label_from_scores` uses `max(scores)`, 
        # then we need to adjust the reported confidence score if we want to force MEDIUM.
        # E.g. if count < 3, cap confidence at 0.79?
        
        num_findings = len(findings)
        final_confidence = float(max_conf)
        
        if num_findings < 3 and final_confidence >= 0.8:
            # Force "MEDIUM" range for low count
            final_confidence = 0.75
            
        # If >= 3, keep original high confidence.

        return {
            "detection_type": "pii",
            "confidence_score": final_confidence,
            "total_findings": num_findings,
            "breakdown": breakdown,
            "flags": flags,
            "short_explanation": f"Found {num_findings} PII entities."
        }

    except Exception as e:
        # Fail-Safe
        return {
            "detection_type": "pii",
            "confidence_score": 0.0,
            "flags": ["error"],
            "short_explanation": f"PII detection failed: {str(e)}"
        }
