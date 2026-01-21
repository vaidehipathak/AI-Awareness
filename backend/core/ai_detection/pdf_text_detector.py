import os
import re
import logging
import json
import torch
import numpy as np
from typing import Dict, Tuple, List, Any
from pypdf import PdfReader
from transformers import AutoTokenizer, AutoModelForCausalLM
from pii_module.pii_engine import detect_pii

logger = logging.getLogger(__name__)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

MODEL_NAME = "distilgpt2"
tokenizer, model = None, None


def _load_model_safely():
    global tokenizer, model

    if model is not None and tokenizer is not None:
        return True

    try:
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
                from pii_module.image_extractor import extract_text_from_image
                
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
            
        status_note = ""

        # Use new PII Module
        pii_findings = detect_pii(raw_text)
        pii_detected = len(pii_findings) > 0
        
        # Scrub text for AI analysis (mask PII)
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
        risk_label = "LOW"

        if pii_only:
            ai_score = 1.0
            verdict = "Sensitive PII Detected (Prevents AI Analysis)"
            ai_msg = "Document contains mostly PII. AI analysis skipped."
            risk_label = "HIGH"
            final_result_structure["detectors_executed"].append("pii_detection")

        elif word_count < 60:
            verdict = "Too Short for Reliable Analysis"
            ai_msg = f"Insufficient text ({word_count} words) for AI detection."
            risk_label = "UNKNOWN"
            final_result_structure["detectors_executed"].append("short_text_check")

        else:
            ai_score = _calculate_perplexity_score(cleaned_text)

            if ai_score >= 0.80:
                verdict = "Likely AI-generated"
                ai_msg = "Text is highly predictable."
                risk_label = "HIGH"
            elif ai_score >= 0.50:
                verdict = "Suspicious"
                ai_msg = "Text predictability slightly high."
                risk_label = "MEDIUM"
            else:
                verdict = "Safe"
                ai_msg = "Text shows sufficient linguistic variance."
                risk_label = "LOW"

            final_result_structure["detectors_executed"].append("ai_generated_content")

        final_result_structure["risk_score"] = round(ai_score, 3)
        final_result_structure["verdict"] = verdict
        final_result_structure["explanation"] = f"{ai_msg} {status_note}".strip()
        final_result_structure["risk_label"] = risk_label

        final_result_structure["results"].append({
            "type": "AI_ANALYSIS",
            "score": final_result_structure["risk_score"],
            "label": final_result_structure["risk_label"],
            "explanation": final_result_structure["explanation"]
        })

        if pii_detected:
            # Calculate PII risk score using weighted risk engine
            CRITICAL_PII = {'AADHAAR', 'VID', 'PAN', 'CREDIT_DEBIT_CARD', 'CVV', 'BANK_ACCOUNT', 'UPI_ID'}
            SENSITIVE_PII = {'DOB', 'PHONE'}
            MODERATE_PII = {'EMAIL', 'URL', 'UTILITY_ACCOUNT'}
            LOW_PII = {'MASKED_PHONE', 'MASKED_EMAIL', 'MASKED_PAN'}
            
            # Weighted risk scoring (from risk_engine.py)
            risk_score_weighted = 0
            has_critical = False
            
            for p in pii_findings:
                pii_type = p['type']
                confidence = p.get('confidence', 1.0)
                
                if pii_type in CRITICAL_PII:
                    has_critical = True
                    risk_score_weighted += confidence * 8  # Critical = 8x weight
                elif pii_type in SENSITIVE_PII:
                    risk_score_weighted += confidence * 4  # Sensitive = 4x weight
                elif pii_type in MODERATE_PII:
                    risk_score_weighted += confidence * 3  # Moderate = 3x weight
                elif pii_type in LOW_PII:
                    risk_score_weighted += confidence * 1  # Low = 1x weight
            
            # Determine risk level based on weighted score
            if has_critical:
                risk_label = "HIGH"
                ai_score = max(ai_score, 0.9)
                verdict = "High-Risk PII Detected"
                ai_msg = f"Document contains {len(pii_findings)} sensitive PII entities including critical identifiers (Aadhaar/PAN/Cards)."
            elif risk_score_weighted >= 6:
                risk_label = "MEDIUM"
                ai_score = max(ai_score, 0.6)
                verdict = "Medium-Risk PII Detected"
                ai_msg = f"Document contains {len(pii_findings)} PII entities with moderate risk."
            elif risk_score_weighted > 0:
                risk_label = "LOW" if risk_label == "UNKNOWN" else risk_label
                ai_score = max(ai_score, 0.3)
            
            final_result_structure["risk_score"] = round(ai_score, 3)
            final_result_structure["verdict"] = verdict
            final_result_structure["explanation"] = f"{ai_msg} {status_note}".strip()
            final_result_structure["risk_label"] = risk_label
            
            # Generate privacy education tips
            privacy_tips = []
            pii_types = {p['type'] for p in pii_findings}
            
            if "UPI_ID" in pii_types:
                privacy_tips.append("UPI IDs are linked to bank accounts. Never share them publicly.")
            if "AADHAAR" in pii_types:
                privacy_tips.append("Aadhaar numbers should NEVER be shared online or via messaging apps.")
            if "PAN" in pii_types:
                privacy_tips.append("PAN cards contain sensitive tax information. Share only with authorized entities.")
            if "CREDIT_DEBIT_CARD" in pii_types or "CVV" in pii_types:
                privacy_tips.append("Card details can lead to financial fraud. Never share CVV or full card numbers.")
            if "BANK_ACCOUNT" in pii_types:
                privacy_tips.append("Bank account numbers should be shared only through secure, encrypted channels.")
            if any(t.startswith("MASKED_") for t in pii_types):
                privacy_tips.append("Masked personal data detected. This is good privacy practice.")
            if risk_label == "HIGH":
                privacy_tips.append("⚠️ HIGH RISK: Please redact sensitive data before sharing this document.")
            
            if not privacy_tips:
                privacy_tips.append("No major privacy risks detected.")
            
            final_result_structure["results"].append({
                "type": "PII_DETECTION",
                "found": pii_detected,
                "entities": pii_findings,
                "explanation": f"Found {len(pii_findings)} PII entities. Document scrubbed.",
                "privacy_tips": privacy_tips,  # Add privacy education
                "risk_score_weighted": round(risk_score_weighted, 2)
            })
            final_result_structure["detectors_executed"].append("pii_detection")

        return {
            "risk_score": final_result_structure["risk_score"],
            "verdict": final_result_structure["verdict"],
            "explanation": final_result_structure["explanation"],
            "limitations": "File might be corrupted or unreadable.",
            "detectors_executed": final_result_structure["detectors_executed"],
            "results": final_result_structure["results"],
            "risk_label": final_result_structure["risk_label"]
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
