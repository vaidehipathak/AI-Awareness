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


def _extract_pdf_text(file_obj) -> str:
    """
    Extract text from PDF using pdfplumber (text-based) and pdf2image + OCR (scanned PDFs).
    Uses improved OCR preprocessing for better accuracy.
    """
    logger.info("🔍 Starting PDF text extraction...")
    try:
        # Save file to temporary location for pdfplumber/pdf2image
        file_obj.seek(0)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
            tmp_pdf.write(file_obj.read())
            tmp_pdf_path = tmp_pdf.name
        logger.info(f"📄 Saved PDF to temp file: {tmp_pdf_path}")
        
        try:
            # Method 1: Try pdfplumber for text-based PDFs (faster, more accurate)
            import pdfplumber
            text = ""
            total_pages = 0
            
            with pdfplumber.open(tmp_pdf_path) as pdf:
                total_pages = len(pdf.pages)
                logger.info(f"PDF has {total_pages} pages, extracting text from ALL pages...")
                
                # Extract from ALL pages, not just first few
                for page_num, page in enumerate(pdf.pages, 1):
                    try:
                        page_text = page.extract_text()
                        if page_text and page_text.strip():
                            text += page_text + "\n"
                            logger.debug(f"Page {page_num}: Extracted {len(page_text)} characters")
                    except Exception as page_error:
                        logger.warning(f"Failed to extract text from page {page_num}: {page_error}")
                        continue
            
            extracted_text = text.strip()
            logger.info(f"Total extracted text: {len(extracted_text)} characters from {total_pages} pages")
            
            # For Aadhaar cards, we expect at least 500-1000+ characters (name, address, numbers, etc.)
            # If we get very little text, it's likely a scanned/image-based PDF
            # Try OCR fallback if text is suspiciously short
            logger.info(f"Checking if OCR needed: extracted={len(extracted_text)} chars, threshold=500")
            if len(extracted_text) < 500:
                logger.warning(f"⚠️ VERY LITTLE TEXT EXTRACTED ({len(extracted_text)} chars). PDF is likely scanned/image-based. Triggering OCR...")
                # Try OCR fallback for scanned PDFs
                try:
                    from pdf2image import convert_from_path
                    # Import from pii_detection module (not pii_module which was deleted)
                    from pii_detection.image_extractor import extract_text_from_image
                    
                    # Try to find Poppler path
                    poppler_path = None
                    possible_paths = [
                        r"C:\poppler\poppler-25.12.0\Library\bin",
                        r"C:\poppler\bin",
                        os.environ.get("POPPLER_PATH"),
                    ]
                    for path in possible_paths:
                        if path and os.path.exists(path):
                            poppler_path = path
                            break
                    
                    logger.info(f"Attempting OCR for scanned PDF (only {len(extracted_text)} chars extracted from text layer)...")
                    if poppler_path:
                        images = convert_from_path(tmp_pdf_path, poppler_path=poppler_path, dpi=300)
                    else:
                        images = convert_from_path(tmp_pdf_path, dpi=300)
                    
                    logger.info(f"Converted PDF to {len(images)} images for OCR processing")
                    ocr_text = ""
                    for i, img in enumerate(images, 1):
                        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_img:
                            img.save(tmp_img.name, "PNG")
                            tmp_img_path = tmp_img.name
                        
                        try:
                            logger.info(f"Running OCR on page {i}/{len(images)}...")
                            page_ocr = extract_text_from_image(tmp_img_path)
                            if page_ocr and page_ocr.strip():
                                ocr_text += page_ocr + "\n"
                                logger.info(f"Page {i} OCR: Extracted {len(page_ocr)} characters")
                        except Exception as page_ocr_error:
                            logger.warning(f"OCR failed for page {i}: {page_ocr_error}")
                        finally:
                            if os.path.exists(tmp_img_path):
                                os.unlink(tmp_img_path)
                    
                    if ocr_text.strip():
                        combined_text = (extracted_text + "\n" + ocr_text).strip()
                        logger.info(f"OCR extracted {len(ocr_text)} characters. Combined total: {len(combined_text)}")
                        return combined_text
                    else:
                        logger.warning("OCR completed but extracted no text")
                except ImportError as import_err:
                    logger.error(f"❌ OCR libraries not available: {import_err}. Install pdf2image and poppler.")
                except Exception as ocr_error:
                    logger.error(f"❌ OCR fallback failed with error: {ocr_error}", exc_info=True)
            
            # Return whatever text we extracted (even if short)
            logger.info(f"Returning extracted text: {len(extracted_text)} characters")
            return extracted_text
            
        finally:
            # Cleanup temp PDF file
            if os.path.exists(tmp_pdf_path):
                os.unlink(tmp_pdf_path)
    
    except ImportError as ie:
        logger.warning(f"PDF extraction libraries not available: {ie}. Falling back to pypdf...")
        # Fallback to pypdf if pdfplumber/pdf2image not available
        try:
            from pypdf import PdfReader
            file_obj.seek(0)
            pdf_bytes = file_obj.read()
            reader = PdfReader(BytesIO(pdf_bytes))
            
            extracted_text = []
            for page in reader.pages:
                content = page.extract_text()
                if content and content.strip():
                    extracted_text.append(content)
            
            return " ".join(extracted_text).strip()
        except Exception as e:
            logger.error(f"pypdf fallback also failed: {str(e)}")
            return ""
    
    except Exception as e:
        logger.error(f"PDF extraction failed: {str(e)}")
        try:
            file_obj.seek(0)
            return file_obj.read().decode(errors="ignore")
        except Exception:
            return ""


def _classify_file_type(filename: str, content_type: str) -> str:
    fn = filename.lower()
    if fn.endswith((".jpg", ".jpeg", ".png")):
        return "image"
    if fn.endswith(".pdf"):
        return "pdf"
    if fn.endswith(".txt"):
        return "text"
    return "unsupported"


def _route_detectors(file_type: str) -> List[str]:
    if file_type in ("text", "pdf", "image"):  # Added image support
        return ["pdf_text_ai"]  # Routes to PII detection with OCR for images
    return []


def _invoke_detector(name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        if name == "pdf_text_ai":
            return detect_pdf_ai(
                text_input=payload.get("text", ""),
                metadata=payload.get("metadata", {}),
                image_bytes=payload.get("image_bytes")  # Pass image bytes for OCR
            )

        if name == "image_deepfake":
            return image_detector.detect(
                payload.get("bytes", b""), payload.get("metadata", {})
            )

        return {
            "type": name,
            "detection_type": name,
            "confidence_score": 0.0,
            "flags": [],
            "short_explanation": "Unknown detector name",
        }
    except Exception as e:
        return {
            "type": name,
            "detection_type": name,
            "confidence_score": 0.0,
            "flags": ["error"],
            "short_explanation": f"Error: {str(e)}",
        }


def _risk_label_from_scores(scores: List[float]) -> str:
    if not scores:
        return "LOW"
    m = max(scores)
    if m >= 0.7:
        return "HIGH"
    if m >= 0.3:
        return "MEDIUM"
    return "LOW"


def route_and_detect(*, user, uploaded_file, metadata: Dict[str, Any]) -> Dict[str, Any]:
    fname = getattr(uploaded_file, "name", "uploaded")
    ctype = getattr(uploaded_file, "content_type", "")
    fsize = getattr(uploaded_file, "size", 0)

    ftype = _classify_file_type(fname, ctype)
    detectors_to_run = _route_detectors(ftype)

    if ftype == "unsupported":
        return {
            "file_metadata": {
                "name": fname,
                "content_type": ctype,
                "size_bytes": fsize,
                "file_type": "N/A",
            },
            "detectors_executed": [],
            "results": [
                {
                    "detection_type": "unsupported_file",
                    "confidence_score": 0.0,
                    "flags": [],
                    "short_explanation": f"File type {ctype} is unsupported.",
                }
            ],
            "risk_label": "LOW",
        }

    payload = {"metadata": metadata}

    if ftype == "image":
        uploaded_file.seek(0)
        payload["image_bytes"] = uploaded_file.read()  # Pass as image_bytes for OCR
        uploaded_file.seek(0)
    elif ftype == "text":
        try:
            uploaded_file.seek(0)
            payload["text"] = uploaded_file.read().decode("utf-8", errors="replace")
        except Exception as e:
            logger.error(f"Text file read error: {e}")
            payload["text"] = ""
    else:
        if ftype == "pdf":
            # Use the new module's PDF extractor (handles text + OCR)
            try:
                from pii_detection.pdf_extractor import extract_text_from_pdf
                # Save to temp file because pdf_extractor expects a path
                import tempfile
                import os
                
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                    uploaded_file.seek(0)
                    tmp.write(uploaded_file.read())
                    tmp_path = tmp.name
                
                try:
                    extracted_text = extract_text_from_pdf(tmp_path)
                finally:
                    if os.path.exists(tmp_path):
                        os.unlink(tmp_path)
                        
            except ImportError:
                # Fallback if module issue
                extracted_text = _extract_pdf_text(uploaded_file)
            except Exception as e:
                logger.error(f"New PDF Extractor failed: {e}")
                extracted_text = _extract_pdf_text(uploaded_file)
                
            payload["text"] = extracted_text
            logger.info(f"PDF text extraction: {len(extracted_text)} characters extracted")
        else:
            uploaded_file.seek(0)
            try:
                payload["text"] = uploaded_file.read().decode("utf-8", errors="ignore")
            except Exception:
                payload["text"] = ""
        uploaded_file.seek(0)

    outputs_list = []
    ai_pii_res = None

    with transaction.atomic():
        af = AnalysisFile.objects.create(
            original_name=fname, content_type=ctype, size_bytes=fsize
        )

        scores = []

        for d_name in detectors_to_run:
            res = _invoke_detector(d_name, payload)
            outputs_list.append(res)

            if d_name == "pdf_text_ai":
                ai_pii_res = res
                # For pdf_text_ai, use risk_score (it returns risk_score, not confidence_score)
                # Also check nested results for PII_DETECTION confidence_score
                score = res.get("risk_score", 0.0)
                # If PII detection found critical entities, use its confidence
                if res.get("results"):
                    for r in res.get("results", []):
                        if r.get("type") == "PII_DETECTION" and r.get("found"):
                            # Use PII confidence if higher
                            pii_conf = r.get("confidence_score", 0.0)
                            if pii_conf > score:
                                score = pii_conf
                scores.append(float(score))
            else:
                scores.append(float(res.get("confidence_score", 0.0)))

        risk_str = _risk_label_from_scores(scores)

        run_obj = DetectionRun.objects.create(
            user=user if (user and user.is_authenticated) else None,
            file=af,
            risk_label=risk_str,
            detectors_executed=detectors_to_run,
        )

        for out in outputs_list:
            DetectorResult.objects.create(
                run=run_obj,
                detector_name=out.get("detection_type", "unknown"),
                output=out,
            )

    final_metadata = {
        "name": af.original_name,
        "content_type": af.content_type,
        "size_bytes": af.size_bytes,
        "file_type": ftype.upper(),
    }

    if ai_pii_res and ai_pii_res.get("file_metadata"):
        detector_meta = ai_pii_res["file_metadata"]
        if detector_meta.get("size_bytes", 0) > 0:
            final_metadata = detector_meta

    # Ensure results structure matches frontend expectations
    # Frontend expects: res.data.results[0].results to contain PII_DETECTION and AI_ANALYSIS
    # So we need: results: [{ results: [PII_DETECTION, AI_ANALYSIS] }]
    processed_results = []
    for output in outputs_list:
        # If output has nested results (from detect_pdf_ai), use it directly
        # Check if "results" key exists and is a list (even if empty)
        if "results" in output and isinstance(output["results"], list):
            processed_results.append(output)
        else:
            # Otherwise, wrap it in a results array
            processed_results.append({
                **output,
                "results": [output] if output else []
            })
    
    full_report = {
        "file_metadata": final_metadata,
        "detectors_executed": detectors_to_run,
        "results": processed_results,
        "risk_label": risk_str,
    }
    
    # Log the structure for debugging
    logger.info(f"Returning report with {len(processed_results)} detector results")
    if processed_results:
        first_result = processed_results[0]
        if first_result.get("results"):
            logger.info(f"First result has {len(first_result.get('results', []))} nested results")
            for r in first_result.get("results", []):
                if r.get("type") == "PII_DETECTION":
                    logger.info(f"PII_DETECTION found: found={r.get('found')}, entities={len(r.get('entities', []))}")

    return full_report
