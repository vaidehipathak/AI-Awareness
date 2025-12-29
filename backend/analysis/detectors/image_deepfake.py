import os
import tempfile
# This imports your working ViT code from the parent folder
from ..image_detector import detect_ai_generated

def detect(file_bytes: bytes, metadata: dict) -> dict:
    """
    Bridge: Takes bytes from router, 
    saves to temp file, and runs your ViT AI model.
    """
    if not file_bytes:
        return {
            "detection_type": "AI_Generation",
            "confidence_score": 0.0,
            "flags": [],
            "short_explanation": "No image data received."
        }

    # 1. Create a temporary file so the AI model can read it
    # We use a suffix to help the image processor identify the format
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
        tmp_file.write(file_bytes)
        tmp_path = tmp_file.name

    try:
        # 2. Call your actual Vision Transformer model
        results = detect_ai_generated(tmp_path)
        
        # 3. Clean up the temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

        # 4. Extract data and map to Frontend requirements
        is_ai = results.get('is_ai', False)
        # Teammate's router/frontend expects decimal (0.0 to 1.0)
        score_decimal = float(results.get('confidence', 0)) / 100

        return {
            "detection_type": "AI_Generation", # Clean UI name
            "confidence_score": score_decimal,    # Fixes NaN/0%
            "flags": ["Synthetic Patterns", "ViT-Verified"] if is_ai else ["Authentic"],
            "short_explanation": results.get('message', '')
        }

    except Exception as e:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        return {
            "detection_type": "AI_Generation",
            "confidence_score": 0.0,
            "flags": ["error"],
            "short_explanation": f"Internal Model Error: {str(e)}"
        }