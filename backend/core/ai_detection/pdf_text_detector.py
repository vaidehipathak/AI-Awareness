import os
import re
import logging
import json
import torch
import numpy as np 
from typing import Dict, Tuple

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
        
def _analyze_and_scrub_pii(text: str) -> Tuple[str, bool, bool]:
    """
    Masks PII including Email, Phone, SSN, Credit Cards, Aadhar.
    Returns:
        scrubbed_text: text with placeholders
        pii_found: True if any PII was found
        pii_only: True if text is mostly PII
    """
    pii_found = False
    pii_only = False
    
    patterns = {
        '[EMAIL]': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        '[PHONE]': r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
        '[SSN]':   r'\b\d{3}-\d{2}-\d{4}\b',
        '[CARD]':  r'\b(?:\d[ -]*?){13,16}\b',
        '[AADHAR]': r'\b\d{4}\s?\d{4}\s?\d{4}\b'
    }

    scrubbed = text
    total_length = len(text.strip())
    pii_chars = 0
    
    for placeholder, pattern in patterns.items():
        matches = re.findall(pattern, scrubbed)
        if matches:
            pii_found = True
            for match in matches:
                pii_chars += len(match)
            scrubbed = re.sub(pattern, placeholder, scrubbed)
    
    if total_length > 0 and (pii_chars / total_length) > 0.7:
        pii_only = True
        
    return scrubbed, pii_found, pii_only

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
                status_note = "Note: PDF appears to be a scanned image or text layer is missing/corrupted (no selectable text found)."
            else:
                status_note = "Note: PDF is empty or text extraction yielded no content."
    
            
    except Exception as e:
    
        status_note = f"Error during PDF structure reading: {str(e)}"
        raise RuntimeError(f"Could not read PDF structure: {str(e)}")
    
    return full_text, status_note


def _calculate_perplexity_score(text: str) -> float:
    """Calculates the perplexity score (0.0 to 1.0) based on DistilGPT2."""
    
    
    encodings = tokenizer(text, return_tensors='pt')
    
    max_length = model.config.n_positions 
    
    nlls = []
    input_ids = encodings.input_ids
    
    
    for i in range(0, input_ids.size(1), max_length - 1):
        end = min(i + max_length, input_ids.size(1))
        chunk_ids = input_ids[:, i:end]
        
        
        with torch.no_grad():
            outputs = model(chunk_ids, labels=chunk_ids)
            
            neg_log_likelihood = outputs.loss
            nlls.append(neg_log_likelihood)

    
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

# --- MODIFIED FUNCTION SIGNATURE TO ACCEPT TEXT AND METADATA ---
def detect_pdf_ai(text_input: str, metadata: Dict) -> Dict:
    logger.info("AI Detection process started.")
    
    result = {
        "content_type": "text",
        "risk_score": 0.0,
        "verdict": "Safe",
        "explanation": "",
        "limitations": "Accuracy drops on very short text. Results based on perplexity, which may flag highly structured/boilerplate text.",
        "error": None,
        
        "file_metadata": {"name": metadata.get("source", "analyzed_text_input"), "metadata_received": metadata}, 
        "detectors_executed": [],
        "results": [],
        "risk_label": "UNKNOWN"
    }

    if not _load_model_safely():
        result["error"] = "AI Model failed to load locally."
        result["verdict"] = "Unknown"
        return {
            "file_metadata": result["file_metadata"],
            "detectors_executed": [],
            "results": [{"detection_type": "model_load_failure", "confidence_score": 0.0, "flags": [], "short_explanation": result["error"]}],
            "risk_label": "ERROR"
        }

    try:
        raw_text = text_input
        status_note = "" 
        
        scrubbed_text, pii_detected, pii_only = _analyze_and_scrub_pii(raw_text)
        cleaned_text = _clean_text(scrubbed_text)

        word_count = len(cleaned_text.split())

        
        if pii_only:
            result.update({
                "risk_score": 1.0,
                "verdict": "Sensitive PII Detected",
                "explanation": "Document contains mostly PII (SSN/Aadhar/CC/etc).",
                "risk_label": "HIGH",
                "detectors_executed": ["pii_detection"],
                "results": [{
                    "detection_type": "pii_detection",
                    "confidence_score": 1.0,
                    "flags": ["Sensitive PII Detected"],
                    "short_explanation": "Document contains mostly PII (SSN/Aadhar/CC/etc)."
                }]
            })
            return {"results": [result]}

        if word_count < 60: 
            pii_msg = "PII detected. " if pii_detected else ""
            explanation_text = f"{pii_msg}{status_note or 'Insufficient text for analysis.'}".strip()
            
            result.update({
                "risk_score": 0.0,
                "verdict": "Too Short for Reliable AI Detection",
                "explanation": explanation_text,
                "risk_label": "UNKNOWN",
                "detectors_executed": ["pii_detection"] if pii_detected else ["short_text_check"],
                "results": [{
                    "detection_type": "pii_detection" if pii_detected else "short_text",
                    "confidence_score": 0.0,
                    "flags": [result["verdict"]],
                    "short_explanation": explanation_text
                }]
            })
            return {"results": [result]}



        ai_score = _calculate_perplexity_score(cleaned_text) 
        
        result["risk_score"] = round(ai_score, 3)
        
        
        if ai_score >= 0.80:
            verdict = "Likely AI-generated"
            ai_msg = "Text is highly predictable (low perplexity)."
            risk_label = "HIGH"
        elif ai_score >= 0.50: 
            verdict = "Suspicious"
            ai_msg = "Text predictability is slightly lower than average human text."
            risk_label = "MEDIUM"
        else: 
            verdict = "Safe"
            ai_msg = "Text exhibits sufficient linguistic variance."
            risk_label = "LOW"

        explanation_msg = f"{ai_msg} {status_note}".strip()
        
        result.update({
            "verdict": verdict,
            "explanation": explanation_msg,
            "risk_label": risk_label,
            "detectors_executed": ["ai_generated_content"],
            "results": [{
                "detection_type": "ai_generated_content",
                "confidence_score": result["risk_score"],
                "flags": [verdict],
                "short_explanation": explanation_msg
            }]
        })

        logger.info(f"Analysis complete. Score: {result['risk_score']}")
        
        return {"results": [result]}

    except Exception as e:
        logger.error(f"Detection failed: {e}")
        error_detail = {
            "content_type": result.get("content_type", "unknown"),
            "risk_score": 0.0,
            "verdict": "Error",
            "explanation": "Failed to analyze document content.",
            "limitations": "File might be corrupted, password protected, or unreadable.",
            
            "error": f"Error: {str(e)} - Metadata for error context: {metadata.get('metadata_received', 'N/A')}", 
            "file_metadata": {
                "name": "Error Processing File", 
                "size_bytes": 0,
                "file_type": "ERROR"
            }, 
            "detectors_executed": [],
            "results": [],
            "risk_label": "ERROR"
        }
        
        return {"results": [error_detail]}