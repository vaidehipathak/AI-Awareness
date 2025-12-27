from __future__ import annotations
from typing import Any, Dict, List, Tuple
from dataclasses import dataclass

from django.db import transaction

from .models import AnalysisFile, DetectionRun, DetectorResult
from .detectors import text_pdf as text_pdf_detector
from .detectors import image_deepfake as image_detector
from .detectors import pii as pii_detector
from io import BytesIO


def _extract_pdf_text(file_obj) -> str:
    """Best-effort PDF text extraction.
    - Tries pdfminer.six first
    - Falls back to PyPDF2 if available
    - Returns empty string if extraction not possible
    """
    try:
        raw = file_obj.read()
        if not raw:
            return ""
        # Try pdfminer
        try:
            from pdfminer.high_level import extract_text  # type: ignore
            return extract_text(BytesIO(raw)) or ""
        except Exception:
            pass
        # Fallback: PyPDF2
        try:
            from PyPDF2 import PdfReader  # type: ignore
            reader = PdfReader(BytesIO(raw))
            pages = []
            for p in getattr(reader, "pages", []) or []:
                try:
                    pages.append(p.extract_text() or "")
                except Exception:
                    continue
            return "\n".join(filter(None, pages))
        except Exception:
            pass
    except Exception:
        pass
    return ""


@dataclass
class FileInfo:
    name: str
    content_type: str
    size_bytes: int


def _classify_file_type(filename: str, content_type: str) -> str:
    fn = filename.lower()
    
    # Strict extension checking
    if fn.endswith((".jpg", ".jpeg", ".png")):
        return "image"
    if fn.endswith(".pdf"):
        return "pdf"
    if fn.endswith(".txt"):
        return "text"
        
    return "unsupported"


def _route_detectors(file_type: str) -> List[str]:
    if file_type in ("text", "pdf"):
        return ["text_pdf", "pii"]
    if file_type == "image":
        return ["image_deepfake"]
    return []


def _invoke_detector(name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        if name == "text_pdf":
            return text_pdf_detector.detect(payload.get("text", ""), payload.get("metadata", {}))
        if name == "pii":
            return pii_detector.detect(payload.get("text", ""), payload.get("metadata", {}))
        if name == "image_deepfake":
            return image_detector.detect(payload.get("bytes", b""), payload.get("metadata", {}))
        return {
            "detection_type": name,
            "confidence_score": 0.0,
            "flags": ["unknown_detector"],
            "short_explanation": "Detector not recognized.",
        }
    except Exception as e:
        # Detector errors must not crash pipeline
        return {
            "detection_type": name,
            "confidence_score": 0.0,
            "flags": ["error"],
            "short_explanation": f"Detector error: {e}",
        }


def _risk_label_from_scores(scores: List[float]) -> str:
    if not scores:
        return "LOW"
    m = max(scores)
    if m >= 0.8:
        return "HIGH"
    if m >= 0.4:
        return "MEDIUM"
    return "LOW"


def route_and_detect(*, user, uploaded_file, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Central orchestrator:
    - Identify file type
    - Choose detectors
    - Invoke stub detectors
    - Persist results (router only writes DB)
    - Return unified report (Phase 2A)
    """
    filename = getattr(uploaded_file, 'name', 'uploaded')
    content_type = getattr(uploaded_file, 'content_type', '')
    size = getattr(uploaded_file, 'size', 0)

    file_type = _classify_file_type(filename, content_type)
    
    # 1. Strictly Block Unsupported Files
    if file_type == "unsupported":
        return {
            "file_metadata": {
                "name": filename,
                "content_type": content_type,
                "size_bytes": size,
                "file_type": "unsupported",
            },
            "detectors_executed": [],
            "results": [
                {
                    "detection_type": "system",
                    "confidence_score": 0.0,
                    "flags": [],
                    "short_explanation": "This file type is not supported yet."
                }
            ],
            "risk_label": "LOW",
        }

    to_run = _route_detectors(file_type)

    # Prepare detector payloads with proper PDF handling
    payload: Dict[str, Any] = {"metadata": metadata}
    if file_type == "pdf":
        text = _extract_pdf_text(uploaded_file)
        payload["text"] = text if isinstance(text, str) else ""
    elif file_type == "text":
        try:
            payload["text"] = uploaded_file.read().decode(errors="ignore")
        except Exception:
            payload["text"] = ""
    elif file_type == "image":
        try:
            payload["bytes"] = uploaded_file.read()
        except Exception:
            payload["bytes"] = b""
    else:
        payload["text"] = ""

    outputs: List[Dict[str, Any]] = []

    with transaction.atomic():
        af = AnalysisFile.objects.create(
            original_name=filename,
            content_type=content_type or "",
            size_bytes=size or 0,
        )
        results_scores: List[float] = []

        for det_name in to_run:
            output = _invoke_detector(det_name, payload)
            outputs.append(output)
            results_scores.append(float(output.get("confidence_score", 0.0)))

        risk_label = _risk_label_from_scores(results_scores)
        run = DetectionRun.objects.create(
            user=getattr(user, 'pk', None) and user or None,
            file=af,
            risk_label=risk_label,
            detectors_executed=to_run,
        )
        for output in outputs:
            DetectorResult.objects.create(
                run=run,
                detector_name=output.get("detection_type", "unknown"),
                output=output,
            )

    return {
        "file_metadata": {
            "name": filename,
            "content_type": content_type,
            "size_bytes": size,
            "file_type": file_type,
        },
        "detectors_executed": to_run,
        "results": outputs,
        "risk_label": risk_label,
    }
