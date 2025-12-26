import os
from .image_detector import detect_ai_generated

def route_and_detect(user, uploaded_file, metadata):
    # 1. Save file temporarily
    temp_name = f"temp_{user.id}_{uploaded_file.name}"
    with open(temp_name, 'wb+') as f:
        for chunk in uploaded_file.chunks():
            f.write(chunk)

    file_extension = os.path.splitext(uploaded_file.name)[1].lower()
    
    # 2. Run Analysis
    # We initialize results with default values to prevent "Unknown" errors
    results = {
        "is_ai": False, 
        "confidence": 0, 
        "label": "Not Processed", 
        "message": "File type not supported for AI analysis."
    }

    if file_extension in ['.jpg', '.jpeg', '.png']:
        results = detect_ai_generated(temp_name)

    # Cleanup the temp file immediately after analysis
    if os.path.exists(temp_name):
        os.remove(temp_name)

    # 3. MAPPING TO YOUR FRONTEND INTERFACES
    is_ai = results.get('is_ai', False)
    risk_val = "HIGH" if (is_ai and results.get('confidence', 0) > 60) else "LOW"
    score_decimal = float(results.get('confidence', 0)) / 100 

    # We use a name without multiple underscores to avoid the frontend replace bug
    # And we use uppercase AI for professionalism
    display_type = "AI_Generation" 

    # Grammar fix for the explanation
    if is_ai:
        explanation = "The analysis identifies this image as AI-generated."
    else:
        explanation = "The analysis identifies this as a natural, human-made image."

    return {
        "risk_label": risk_val,
        "detectors_executed": ["ai_generation_check"],
        "file_metadata": {
            "name": uploaded_file.name,
            "content_type": uploaded_file.content_type,
            "size_bytes": uploaded_file.size,
            "file_type": file_extension.upper().replace('.', '')
        },
        "results": [
            {
                "detection_type": display_type, 
                "confidence_score": score_decimal,
                "flags": ["Synthetic Patterns", "AI-Generated"] if is_ai else ["Authentic"],
                "short_explanation": explanation # FIXED GRAMMAR
            }
        ]
    }