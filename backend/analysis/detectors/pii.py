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
    try:
        # Strictly use the Improved PII Engine (backend/pii_module)
        from pii_module.pii_engine import detect_pii

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
        # Critical entities that should ALWAYS be High Risk
        CRITICAL_ENTITIES = {"AADHAAR", "PAN", "UPI_ID", "CREDIT_DEBIT_CARD", "US_SSN", "PASSPORT", "VID"}
        has_critical = any(f["type"] in CRITICAL_ENTITIES for f in findings)
        
        max_conf = max((m['confidence'] for m in findings), default=0.0)
        num_findings = len(findings)
        
        # 5. Strict Risk Logic (Production Rule)
        # If we have critical entities, force HIGH confidence (>=0.8) if the detection confidence supports it,
        # or at least ensure it's not suppressed.
        
        if num_findings < 3 and not has_critical:
            # Force "LOW" range logic for isolated matches ONLY if they are not critical
            final_confidence = 0.3
        else:
            # Allow actual confidence to drive risk (usually > 0.8 for valid PII)
            # If critical entity found, ensure we are at least in Medium/High range if the engine was confident
            final_confidence = float(max_conf)

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
