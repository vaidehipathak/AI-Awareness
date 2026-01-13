from __future__ import annotations
from typing import Any, Dict, List
from django.db import transaction
from .models import AnalysisFile, DetectionRun, DetectorResult

from core.ai_detection.pdf_text_detector import detect_pdf_ai 

from .detectors import image_deepfake as image_detector 


from io import BytesIO
import os

import logging
logger = logging.getLogger(__name__)




def _extract_pdf_text(file_obj) -> str:
    """Extracts text from PDF using pypdf (like the detector)."""
    extracted_text = []
    try:
        
        from pypdf import PdfReader 
        reader = PdfReader(file_obj)
        for page in reader.pages:
            content = page.extract_text()
            if content and content.strip():
                extracted_text.append(content)
    except Exception as e:
        logger.error(f"pypdf Extraction failed in router: {str(e)}")
        # Fallback: If pypdf fails, read raw content as a last resort
        file_obj.seek(0)
        return file_obj.read().decode(errors="ignore") 
        
    return " ".join(extracted_text).strip()

def _classify_file_type(filename: str, content_type: str) -> str:
    fn = filename.lower()
    if fn.endswith((".jpg", ".jpeg", ".png")): return "image"
    if fn.endswith(".pdf"): return "pdf"
    if fn.endswith(".txt"): return "text"
    return "unsupported"

def _route_detectors(file_type: str) -> List[str]:
    
    if file_type in ("text", "pdf"): return ["pdf_text_ai"] 
    if file_type == "image": return ["image_deepfake"]
    return []

def _invoke_detector(name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Invokes the specific detector function based on name."""
    try:
        if name == "pdf_text_ai": 
            
            return detect_pdf_ai(payload.get("text", ""), payload.get("metadata", {}))
            
        
        if name == "image_deepfake": 
            return image_detector.detect(payload.get("bytes", b""), payload.get("metadata", {}))
            
        return {"detection_type": name, "confidence_score": 0.0, "flags": [], "short_explanation": "Unknown detector name"}
    except Exception as e:
        return {"detection_type": name, "confidence_score": 0.0, "flags": ["error"], "short_explanation": f"Error: {str(e)}"}

def _risk_label_from_scores(scores: List[float]) -> str:
    if not scores: return "LOW"
    m = max(scores)
    if m >= 0.7: return "HIGH"
    if m >= 0.3: return "MEDIUM"
    return "LOW"



def route_and_detect(*, user, uploaded_file, metadata: Dict[str, Any]) -> Dict[str, Any]:
    fname = getattr(uploaded_file, 'name', 'uploaded')
    ctype = getattr(uploaded_file, 'content_type', '')
    fsize = getattr(uploaded_file, 'size', 0)
    ftype = _classify_file_type(fname, ctype)
    
    detectors_to_run = _route_detectors(ftype)

    if ftype == "unsupported":
       
        return {
            "file_metadata": {"name": fname, "content_type": ctype, "size_bytes": fsize, "file_type": "N/A"},
            "detectors_executed": [],
            "results": [{
                "detection_type": "unsupported_file",
                "confidence_score": 0.0,
                "flags": [],
                "short_explanation": f"File type {ctype} is unsupported."
            }],
            "risk_label": "LOW"
        }

    payload = {"metadata": metadata}
    
    if ftype == "image":
        payload["bytes"] = uploaded_file.read()
        uploaded_file.seek(0)
    else:
        
        payload["text"] = _extract_pdf_text(uploaded_file) if ftype == "pdf" else uploaded_file.read().decode(errors="ignore")
        uploaded_file.seek(0)

    outputs_list = [] 
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

   
    full_report = {
        "file_metadata": {
            "name": fname,
            "content_type": ctype,
            "size_bytes": fsize,
            "file_type": ftype.upper()
        },
        "detectors_executed": detectors_to_run,
        "results": outputs_list,
        "risk_label": risk_str
    }
    return full_report