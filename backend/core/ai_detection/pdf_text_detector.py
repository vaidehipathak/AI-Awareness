import os
import re
import logging
import json
import torch
import numpy as np
from typing import Dict, Tuple, List, Any
from pypdf import PdfReader
from transformers import AutoTokenizer, AutoModelForCausalLM

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


def _analyze_and_scrub_pii(text: str) -> Tuple[str, bool, bool, List[Dict[str, Any]]]:
    """
    Masks PII including Email, Phone, SSN, Credit Cards, Aadhar.
    Returns:
    scrubbed_text: text with placeholders
    pii_found: True if any PII was found
    pii_only: True if text is mostly PII
    pii_findings: List of detected PII entities
    """

    pii_found = False
    pii_only = False
    pii_findings = []

    patterns = {
        'EMAIL': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'PHONE': r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
        'SSN': r'\b\d{3}-\d{2}-\d{4}\b',
        'CARD': r'\b(?:\d[ -]*?){13,16}\b',
        'AADHAR': r'\b\d{4}\s?\d{4}\s?\d{4}\b'
    }

    scrubbed = text
    total_length = len(text.strip())
    pii_chars = 0

    for p_type, pattern in patterns.items():
        matches = re.findall(pattern, scrubbed)
        if matches:
            pii_found = True
            for match in matches:
                pii_chars += len(match)
                pii_findings.append({
                    "type": p_type,
                    "value": match,
                    "confidence": 1.0,
                    "start": -1,
                    "end": -1
                })

            scrubbed = re.sub(pattern, f"[{p_type}]", scrubbed)

    if total_length > 0 and (pii_chars / total_length) > 0.7:
        pii_only = True

    return scrubbed, pii_found, pii_only, pii_findings


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


def detect_pdf_ai(text_input: str, metadata: Dict) -> Dict:
    logger.info("AI Detection process started.")

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
        raw_text = text_input
        status_note = ""

        scrubbed_text, pii_detected, pii_only, pii_findings = _analyze_and_scrub_pii(raw_text)
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
            final_result_structure["results"].append({
                "type": "PII_DETECTION",
                "found": pii_detected,
                "entities": pii_findings,
                "explanation": "PII found. Document scrubbed."
            })
            final_result_structure["detectors_executed"].append("pii_detection")

        logger.info(
            f"Analysis complete. AI Score: {final_result_structure['risk_score']}, PII Found: {pii_detected}"
        )

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
