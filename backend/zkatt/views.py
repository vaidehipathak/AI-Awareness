from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import os
import sys
import json

# Add parent directory to path to import zkatt_finetuning modules
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'zkatt_finetuning'))

try:
    from pipeline_v2 import ZKATT_V2_Pipeline
    IMPORT_ERROR = None
except ImportError as e:
    # Capture error to return to client
    ZKATT_V2_Pipeline = None
    IMPORT_ERROR = str(e)

@api_view(['POST'])
@permission_classes([AllowAny])
def simulate_attack(request):
    """
    API Endpoint for Z-KATT Risk Verdict Simulation.
    Visual Flow: User Input -> Console -> Verdict.
    """
    description = request.data.get('description', '')
    
    if IMPORT_ERROR:
        return Response({"error": f"Server Configuration Error: {IMPORT_ERROR}"}, status=500)

    if not description:
        return Response({"error": "Description is required"}, status=400)

    # Initialize Pipeline (Ensure LM Studio is running or use mock)
    try:
        pipeline = ZKATT_V2_Pipeline() # This might fail if LM Studio is down
    except Exception as e:
        return Response({"error": f"Failed to init pipeline: {str(e)}"}, status=503)

    # Run Pipeline (This is synchronous and slow - ideally use Celery, but for MVP we wait)
    # TODO: Add progress streaming if possible
    try:
        result = pipeline.run(description)
        
        # Parse the 'analysis' string which should now be in JSON format due to updated prompt
        try:
            raw_analysis = result.get('analysis', '{}')
            # Use regex to find the first JSON object
            import re
            json_match = re.search(r'(\{.*\})', raw_analysis, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(1)
                analysis_json = json.loads(json_str)
            else:
                # Fallback: try pure string load if no braces found (unlikely but safe)
                analysis_json = json.loads(raw_analysis)
                
        except Exception as e:
            print(f"DEBUG: JSON Parsing Failed: {str(e)} | Raw: {raw_analysis}")
            # Fallback if parsing fails
            analysis_json = {
                "overall_risk_score": 50,
                "risk_summary": {
                    "identity_manipulation": "UNKNOWN", 
                    "ai_detection_evasion": "UNKNOWN", 
                    "deepfake_potential": "UNKNOWN"
                },
                "attack_cards": [],
                "actionable_awareness": ["Automated analysis failed. Please review logs."],
                "delta_message": "Analysis failed to parse structured output."
            }

        response_data = {
            "risk_verdict": analysis_json,
            "evidence": {
                "original_pdf": "/media/zkatt/twin_original.pdf", # Placeholder URL logic
                "attacked_pdf": "/media/zkatt/twin_attacked.pdf"
            }
        }
        
        return Response(response_data)

    except Exception as e:
        return Response({"error": f"Simulation failed: {str(e)}"}, status=500)
