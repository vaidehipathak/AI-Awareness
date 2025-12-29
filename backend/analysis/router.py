from __future__ import annotations
from typing import Any, Dict, List
from django.db import transaction
from .models import AnalysisFile, DetectionRun, DetectorResult
from .detectors import text_pdf as text_pdf_detector
from .detectors import image_deepfake as image_detector
from .detectors import pii as pii_detector
from io import BytesIO
import os

# --- 1. HELPER FUNCTIONS ---

def _extract_pdf_text(file_obj) -> str:
    try:
        raw = file_obj.read()
        file_obj.seek(0)
        if not raw: return ""
        from pdfminer.high_level import extract_text
        return extract_text(BytesIO(raw)) or ""
    except Exception: return ""

def _classify_file_type(filename: str, content_type: str) -> str:
    fn = filename.lower()
    if fn.endswith((".jpg", ".jpeg", ".png")): return "image"
    if fn.endswith(".pdf"): return "pdf"
    if fn.endswith(".txt"): return "text"
    return "unsupported"

def _route_detectors(file_type: str) -> List[str]:
    if file_type in ("text", "pdf"): return ["text_pdf", "pii"]
    if file_type == "image": return ["image_deepfake"]
    return []

def _invoke_detector(name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        if name == "text_pdf": 
            return text_pdf_detector.detect(payload.get("text", ""), payload.get("metadata", {}))
        if name == "pii": 
            return pii_detector.detect(payload.get("text", ""), payload.get("metadata", {}))
        if name == "image_deepfake": 
            return image_detector.detect(payload.get("bytes", b""), payload.get("metadata", {}))
        return {"detection_type": name, "confidence_score": 0.0, "flags": [], "short_explanation": "Unknown"}
    except Exception as e:
        return {"detection_type": name, "confidence_score": 0.0, "flags": ["error"], "short_explanation": f"Error: {str(e)}"}

def _risk_label_from_scores(scores: List[float]) -> str:
    if not scores: return "LOW"
    m = max(scores)
    if m >= 0.7: return "HIGH"
    if m >= 0.3: return "MEDIUM"
    return "LOW"

# --- 2. MAIN ROUTER FUNCTION ---

def route_and_detect(*, user, uploaded_file, metadata: Dict[str, Any]) -> Dict[str, Any]:
    fname = getattr(uploaded_file, 'name', 'uploaded')
    ctype = getattr(uploaded_file, 'content_type', '')
    fsize = getattr(uploaded_file, 'size', 0)
    ftype = _classify_file_type(fname, ctype)
    
    if ftype == "unsupported":
        return {
            "file_metadata": {"name": fname, "content_type": ctype, "size_bytes": fsize, "file_type": "N/A"},
            "results": [], "risk_label": "LOW"
        }

    detectors_to_run = _route_detectors(ftype)
    payload = {"metadata": metadata}
    
    if ftype == "image":
        payload["bytes"] = uploaded_file.read()
        uploaded_file.seek(0)
    else:
        payload["text"] = _extract_pdf_text(uploaded_file) if ftype == "pdf" else uploaded_file.read().decode(errors="ignore")
        uploaded_file.seek(0)

    outputs_list = [] # Temporary list to hold results
    with transaction.atomic():
        af = AnalysisFile.objects.create(original_name=fname, content_type=ctype, size_bytes=fsize)
        scores = []
        for d_name in detectors_to_run:
            res = _invoke_detector(d_name, payload)
            outputs_list.append(res)
            scores.append(float(res.get("confidence_score", 0.0)))

        risk_str = _risk_label_from_scores(scores)
        run_obj = DetectionRun.objects.create(
            user=user if (user and user.is_authenticated) else None, 
            file=af, risk_label=risk_str, detectors_executed=detectors_to_run
        )
        for out in outputs_list:
            DetectorResult.objects.create(run=run_obj, detector_name=out.get("detection_type", "unknown"), output=out)

    # BHAI, THIS IS THE KEY: We return the FULL DICTIONARY
    full_report = {
        "file_metadata": {
            "name": fname,
            "content_type": ctype,
            "size_bytes": fsize,
            "file_type": ftype.upper()
        },
        "detectors_executed": detectors_to_run,
        "results": outputs_list,  # CRITICAL: React line 138 needs this!
        "risk_label": risk_str
    }
    return full_report