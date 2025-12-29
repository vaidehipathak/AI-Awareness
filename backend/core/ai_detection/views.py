import os
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .pdf_text_detector import detect_pdf_ai

@csrf_exempt
@require_http_methods(["POST"])
def detect_ai_content(request):
    """
    API endpoint for PDF and Text AI detection.
    Accepts either a file upload (PDF) or raw text in JSON body.
    """
    try:
        if 'file' in request.FILES:
            file_obj = request.FILES['file']
            
            temp_path = f"temp_{file_obj.name}"
            with open(temp_path, 'wb+') as destination:
                for chunk in file_obj.chunks():
                    destination.write(chunk)
         
            result = detect_pdf_ai(temp_path)
            
            
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return JsonResponse(result)

        
        else:
            data = json.loads(request.body)
            text_input = data.get('text', '')
            result = detect_pdf_ai(text_input)
            return JsonResponse(result)

    except Exception as e:
        return JsonResponse({
            "content_type": "unknown",
            "risk_score": 0.0,
            "verdict": "Unknown",
            "explanation": "Analysis failed.",
            "limitations": "Check backend logs.",
            "error": str(e)
        }, status=500)