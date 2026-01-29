import os
import re
import logging
import json
import torch
import numpy as np
from typing import Tuple, Dict, List, Any
from transformers import AutoTokenizer, AutoModelForCausalLM
from pypdf import PdfReader



logger = logging.getLogger(__name__)


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

MODEL_NAME = "distilgpt2"
tokenizer, model = None, None


def _load_model_safely():
    global tokenizer, model

    if model is not None and tokenizer is not None:
        return True

    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
        model.eval()
        logger.info(f"Model {MODEL_NAME} loaded successfully for perplexity scoring.")
        return True

    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        tokenizer, model = None, None
        return False


def _clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\x00-\x7F]+", " ", text)
    return text.strip()


def _extract_text_from_pdf(file_path: str) -> Tuple[str, str]:
    """
    Extracts text from a PDF file.
    Returns the extracted text and a status note.
    """

    extracted_text = []
    has_images = False
    full_text = ""
    status_note = ""

    try:
        reader = PdfReader(file_path)

        for page in reader.pages:
            content = page.extract_text()

            if hasattr(page, "/Resources") and "/XObject" in page["/Resources"]:
                has_images = True

            if content and content.strip():
                extracted_text.append(content)

        full_text = " ".join(extracted_text).strip()

        if not full_text:
            if has_images:
                status_note = "Note: PDF appears to be scanned or text layer missing."
            else:
                status_note = "Note: PDF is empty or text extraction failed."

    except Exception as e:
        status_note = f"Error during PDF structure reading: {str(e)}"
        raise RuntimeError(f"Could not read PDF structure: {str(e)}")

    return full_text, status_note


def _calculate_perplexity_score(text: str) -> float:
    """Calculates risk score (0–1) using DistilGPT2 perplexity."""

    if not tokenizer or not model:
        return 0.0

    encodings = tokenizer(text, return_tensors='pt')
    max_length = model.config.n_positions

    nlls = []
    input_ids = encodings.input_ids

    for i in range(0, input_ids.size(1), max_length - 1):
        end = min(i + max_length, input_ids.size(1))
        chunk_ids = input_ids[:, i:end]

        with torch.no_grad():
            outputs = model(chunk_ids, labels=chunk_ids)
            nlls.append(outputs.loss)

    avg_nll = torch.stack(nlls).mean().item()
    perplexity = np.exp(avg_nll)

    PPL_MAX = 50.0
    PPL_MIN = 8.0

    if perplexity > PPL_MAX:
        risk_score = 0.0
    elif perplexity < PPL_MIN:
        risk_score = 1.0
    else:
        risk_score = 1.0 - min(1.0, max(0.0, (perplexity - PPL_MIN) / (PPL_MAX - PPL_MIN)))

    return max(0.0, min(1.0, risk_score))


def detect_pdf_ai(text_input: str = "", metadata: Dict = None, image_bytes: bytes = None) -> Dict:
    logger.info("AI Detection process started.")
    
    if metadata is None:
        metadata = {}

    final_result_structure = {
        "file_metadata": {"name": metadata.get("source", "analyzed_text_input"), "metadata_received": metadata},
        "detectors_executed": [],
        "results": [],
        "risk_label": "UNKNOWN"
    }

    if not _load_model_safely():
        return {
            "error": "Model Load Failure",
            "file_metadata": final_result_structure["file_metadata"],
            "detectors_executed": [],
            "results": [{"name": "Error Processing file", "size_bytes": 0, "file_type": "ERROR"}],
            "risk_label": "ERROR"
        }

    try:
        # Handle image OCR extraction
        if image_bytes:
            try:
                import tempfile
                import os
                from pii_detection.image_extractor import extract_text_from_image
                
                # Save bytes to temp file for cv2 to read
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_file:
                    tmp_file.write(image_bytes)
                    tmp_path = tmp_file.name
                
                raw_text = extract_text_from_image(tmp_path)
                os.unlink(tmp_path)  # Clean up temp file
                
                if not raw_text or len(raw_text.strip()) < 10:
                    return {
                        "risk_score": 0.0,
                        "verdict": "No Text Detected",
                        "explanation": "Could not extract readable text from image. Image may be too blurry or contain no text.",
                        "limitations": "OCR quality depends on image clarity.",
                        "detectors_executed": ["ocr_extraction"],
                        "results": [],
                        "risk_label": "UNKNOWN"
                    }
                    
                final_result_structure["detectors_executed"].append("ocr_extraction")
                
            except Exception as e:
                logger.error(f"OCR extraction failed: {e}")
                return {
                    "error": f"OCR Error: {str(e)}",
                    "file_metadata": final_result_structure["file_metadata"],
                    "detectors_executed": [],
                    "results": [],
                    "risk_label": "ERROR"
                }
        else:
            raw_text = text_input
        
        # Log extracted text for debugging
        logger.info(f"Extracted text length: {len(raw_text or '')} characters")
        if raw_text:
            # Log first 500 chars for preview, but check ENTIRE text for patterns
            logger.info(f"First 500 chars of extracted text: {raw_text[:500]}")
            # Check for potential Aadhaar patterns in the FULL text (not just first 1000 chars)
            import re
            aadhaar_patterns = re.findall(r'\d{4}[-\s]?\d{4}[-\s]?\d{4}|\d{12}', raw_text)
            if aadhaar_patterns:
                logger.info(f"Found {len(aadhaar_patterns)} potential Aadhaar patterns in FULL text: {aadhaar_patterns[:10]}")
            else:
                logger.warning("No Aadhaar patterns found in extracted text")
        else:
            logger.warning("WARNING: No text extracted from document!")
            
        status_note = ""

        # Use new PII Module - ALWAYS run PII detection via centralized router
        try:
            from pii_detection.router import model_router
            logger.info(f"Running PII detection via module router on text length: {len(raw_text or '')}")
            
            # Analyze using the full pipeline
            pii_result = model_router(raw_text or "")
            
            pii_findings = pii_result.get("detected_pii", [])
            risk_label = pii_result.get("risk_level", "LOW") # Returns HIGH/MEDIUM/LOW/NONE
            if risk_label == "NONE": risk_label = "LOW"
            
            # Use module's risk score directly
            risk_score_weighted = pii_result.get("risk_score", 0.0)
            
            # Privacy tips from module
            privacy_tips = pii_result.get("privacy_tips", [])
            
            logger.info(f"PII Module Result: Risk={risk_label}, Score={risk_score_weighted}, Entities={len(pii_findings)}")
            
        except Exception as pii_error:
            logger.error(f"PII detection error: {pii_error}", exc_info=True)
            pii_findings = []
            risk_label = "LOW"
            risk_score_weighted = 0.0
            privacy_tips = []
        
        pii_detected = len(pii_findings) > 0
        
        # Scrub text for AI analysis (mask PII) using findings
        # Sort findings by start index descending to avoid offset issues
        scrubbed_text = raw_text
        sorted_findings = sorted(pii_findings, key=lambda x: x['start'], reverse=True)
        
        pii_only = False
        pii_chars = 0
        total_length = len(raw_text)

        for finding in sorted_findings:
            s, e = finding['start'], finding['end']
            p_type = finding['type']
            # Simple bounds check
            if s >= 0 and e <= len(scrubbed_text):
                scrubbed_text = scrubbed_text[:s] + f"[{p_type}]" + scrubbed_text[e:]
                pii_chars += (e - s)

        if total_length > 0 and (pii_chars / total_length) > 0.6:
            pii_only = True

        cleaned_text = _clean_text(scrubbed_text)
        word_count = len(cleaned_text.split())

        ai_score = 0.0
        verdict = "Safe"
        ai_msg = ""
        # Default AI risk label
        ai_risk_label = "LOW"

        if pii_only:
            ai_score = 1.0
            verdict = "Sensitive PII Detected (Prevents AI Analysis)"
            ai_msg = "Document contains mostly PII. AI analysis skipped."
            ai_risk_label = "HIGH"
            final_result_structure["detectors_executed"].append("pii_detection")

        elif word_count < 60:
            verdict = "Too Short for Reliable Analysis"
            ai_msg = f"Insufficient text ({word_count} words) for AI detection."
            ai_risk_label = "UNKNOWN"
            final_result_structure["detectors_executed"].append("short_text_check")

        else:
            ai_score = _calculate_perplexity_score(cleaned_text)

            if ai_score >= 0.80:
                verdict = "Likely AI-generated"
                ai_msg = "Text is highly predictable."
                ai_risk_label = "HIGH"
            elif ai_score >= 0.50:
                verdict = "Suspicious"
                ai_msg = "Text predictability slightly high."
                ai_risk_label = "MEDIUM"
            else:
                verdict = "Safe"
                ai_msg = "Text shows sufficient linguistic variance."
                ai_risk_label = "LOW"

            final_result_structure["detectors_executed"].append("ai_generated_content")

        # Combine AI and PII Risks
        # If PII risk is higher, it takes precedence for the document label
        final_risk_label = "LOW"
        risk_priority = {"HIGH": 3, "MEDIUM": 2, "LOW": 1, "UNKNOWN": 0}
        
        if risk_priority.get(risk_label, 0) >= risk_priority.get(ai_risk_label, 0):
             final_risk_label = risk_label
        else:
             final_risk_label = ai_risk_label
             
        # --- FIX APPLIED HERE ---
        # The overall verdict/msg is set based on the highest risk, but the AI_ANALYSIS
        # card explanation MUST use the AI message (ai_msg) generated above.
        
        if risk_label == "HIGH":
            verdict = "High-Risk PII Detected"
            # Only overwrite ai_msg if it hasn't been set by the AI analysis block itself
            if not ai_msg or ai_msg == "Text shows sufficient linguistic variance.": # Check if AI message is still default
                 ai_msg = f"Document contains critical PII ({len(pii_findings)} entities)."
        elif risk_label == "MEDIUM" and verdict == "Safe":
             verdict = "Medium-Risk PII Detected"
             if not ai_msg or ai_msg == "Text shows sufficient linguistic variance.": # Check if AI message is still default
                 ai_msg = "Document contains sensitive personal data."
        # ------------------------
        
        final_result_structure["risk_score"] = round(ai_score, 3)
        final_result_structure["verdict"] = verdict
        final_result_structure["explanation"] = f"{ai_msg} {status_note}".strip()
        final_result_structure["risk_label"] = final_risk_label

        final_result_structure["results"].append({
            "type": "AI_ANALYSIS",
            "score": final_result_structure["risk_score"],
            "label": ai_risk_label,
            "explanation": ai_msg # <-- This now correctly uses the AI-derived ai_msg
        })

        # ALWAYS add PII detection result (even if empty)
        # Use values strictly from the module router
        has_critical = risk_label == "HIGH"
        
        final_result_structure["results"].append({
            "type": "PII_DETECTION",
            "found": pii_detected,
            "entities": pii_findings,
            "explanation": f"Found {len(pii_findings)} PII entities." if pii_detected else "No PII entities detected.",
            "privacy_tips": privacy_tips,
            "risk_score_weighted": round(risk_score_weighted, 2),
            "confidence_score": 0.9 if has_critical else (0.6 if risk_score_weighted >= 6 else 0.0),
            "risk_label": risk_label
        })
        final_result_structure["detectors_executed"].append("pii_detection")

        # Log PII detection results for debugging
        logger.info(f"PII Detection Results: Found {len(pii_findings)} entities, Risk: {risk_label}")
        
        return {
            "risk_score": final_result_structure["risk_score"],
            "verdict": final_result_structure["verdict"],
            "explanation": final_result_structure["explanation"],
            "limitations": "File might be corrupted or unreadable.",
            "detectors_executed": final_result_structure["detectors_executed"],
            "results": final_result_structure["results"],
            "risk_label": final_result_structure["risk_label"],
            "file_metadata": final_result_structure["file_metadata"]
        }

    except Exception as e:
        logger.error(f"Detection failed: {e}")
        return {
            "error": f"Error: {str(e)}",
            "file_metadata": {
                "name": "Error Processing file",
                "size_bytes": 0,
                "file_type": "ERROR"
            },
            "detectors_executed": [],
            "results": [],
            "risk_label": "ERROR"
        }