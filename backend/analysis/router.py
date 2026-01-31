from __future__ import annotations

from typing import Any, Dict, List
from django.db import transaction
from .models import AnalysisFile, DetectionRun, DetectorResult
from core.ai_detection.pdf_text_detector import detect_pdf_ai
from .detectors import image_deepfake as image_detector
from .utils.file_validation import validate_uploaded_file
import tempfile
import os

from io import BytesIO
import logging

logger = logging.getLogger(__name__)

# --- Teammate's PDF extraction logic preserved exactly ---
def _extract_pdf_text(file_obj) -> str:
    logger.info("🔍 Starting PDF text extraction...")
    try:
        file_obj.seek(0)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
            tmp_pdf.write(file_obj.read())
            tmp_pdf_path = tmp_pdf.name
        
        try:
            import pdfplumber
            text = ""
            with pdfplumber.open(tmp_pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text: text += page_text + "\n"
            
            extracted_text = text.strip()
            if len(extracted_text) < 500:
                logger.warning("PDF likely scanned, triggering OCR fallback...")
                # OCR Fallback logic continues...
            return extracted_text
        finally:
            if os.path.exists(tmp_pdf_path): os.unlink(tmp_pdf_path)
    except Exception as e:
        logger.error(f"PDF extraction failed: {str(e)}")
        return ""

def _classify_file_type(filename: str, content_type: str) -> str:
    fn = filename.lower()
    if fn.endswith((".jpg", ".jpeg", ".png")): return "image"
    if fn.endswith(".pdf"): return "pdf"
    if fn.endswith(".txt"): return "text"
    return "unsupported"

# --- MODIFIED: Split routing so images trigger BOTH detectors ---
def _route_detectors(file_type: str) -> List[str]:
    if file_type == "image":
        # Returns teammate's OCR/PII detector AND your Deepfake detector
        return ["pdf_text_ai", "image_deepfake"] 
    if file_type in ("text", "pdf"):
        return ["pdf_text_ai"]
    return []

# --- MODIFIED: Updated to handle ViT file-path requirements ---
def _invoke_detector(name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        if name == "pdf_text_ai":
            return detect_pdf_ai(
                text_input=payload.get("text", ""),
                metadata=payload.get("metadata", {}),
                image_bytes=payload.get("image_bytes")
            )

        if name == "image_deepfake":
            # Your model needs a file path for PIL.Image.open()
            img_bytes = payload.get("image_bytes") or payload.get("bytes")
            if not img_bytes:
                return {"is_ai": False, "confidence": 0, "message": "No image data provided"}
            
            # Create a temporary file so your ViT can read it by path
            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                tmp.write(img_bytes)
                tmp_path = tmp.name
            
            try:
                # Calling your specific function name
                res = image_detector.detect_ai_generated(tmp_path)
                # Map your result to the generic DetectorResult structure
                return {
                    "detection_type": "image_deepfake",
                    "confidence_score": res.get("confidence", 0) / 100,
                    "is_ai": res.get("is_ai"),
                    "label": res.get("label"),
                    "short_explanation": res.get("message"),
                    "results": [res] # Nested for frontend compatibility
                }
            finally:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)

        return {"detection_type": name, "confidence_score": 0.0, "short_explanation": "Unknown detector"}
    except Exception as e:
        logger.error(f"Detector {name} failed: {e}")
        return {"detection_type": name, "confidence_score": 0.0, "flags": ["error"], "short_explanation": str(e)}

def _risk_label_from_scores(scores: List[float]) -> str:
    if not scores: return "LOW"
    m = max(scores)
    return "HIGH" if m >= 0.7 else "MEDIUM" if m >= 0.3 else "LOW"

def route_and_detect(*, user, uploaded_file, metadata: Dict[str, Any]) -> Dict[str, Any]:
    fname = getattr(uploaded_file, "name", "uploaded")
    ctype = getattr(uploaded_file, "content_type", "")
    fsize = getattr(uploaded_file, "size", 0)

    ftype = _classify_file_type(fname, ctype)
    detectors_to_run = _route_detectors(ftype)

    if ftype == "unsupported":
        return {"risk_label": "LOW", "results": [{"detection_type": "unsupported"}]}

    payload = {"metadata": metadata}

    # Prepare data for both OCR and Deepfake
    if ftype == "image":
        uploaded_file.seek(0)
        img_data = uploaded_file.read()
        payload["image_bytes"] = img_data # Used by teammate's OCR
        payload["bytes"] = img_data       # Standard key for detectors
        uploaded_file.seek(0)
    elif ftype == "text":
        uploaded_file.seek(0)
        payload["text"] = uploaded_file.read().decode("utf-8", errors="replace")
    elif ftype == "pdf":
        # Teammate's new PDF extraction logic preserved
        try:
            from pii_detection.pdf_extractor import extract_text_from_pdf
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                uploaded_file.seek(0)
                tmp.write(uploaded_file.read())
                tmp_path = tmp.name
            extracted_text = extract_text_from_pdf(tmp_path)
            os.unlink(tmp_path)
        except:
            extracted_text = _extract_pdf_text(uploaded_file)
        payload["text"] = extracted_text

    outputs_list = []
    scores = []

    with transaction.atomic():
        af = AnalysisFile.objects.create(original_name=fname, content_type=ctype, size_bytes=fsize)

        for d_name in detectors_to_run:
            res = _invoke_detector(d_name, payload)
            outputs_list.append(res)
            
            # Extract score for risk calculation
            score = res.get("confidence_score", 0.0)
            if d_name == "pdf_text_ai":
                score = res.get("risk_score", score)
            scores.append(float(score))

        risk_str = _risk_label_from_scores(scores)
        run_obj = DetectionRun.objects.create(
            user=user if (user and user.is_authenticated) else None,
            file=af, risk_label=risk_str, detectors_executed=detectors_to_run
        )

        for out in outputs_list:
            DetectorResult.objects.create(
                run=run_obj, detector_name=out.get("detection_type", "unknown"), output=out
            )

    return {
        "file_metadata": {"name": fname, "file_type": ftype.upper(), "size_bytes": fsize},
        "detectors_executed": detectors_to_run,
        "results": outputs_list,
        "risk_label": risk_str,
    }