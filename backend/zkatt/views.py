from rest_framework.decorators import api_view, permission_classes, authentication_classes
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
@authentication_classes([])
def simulate_attack(request):
    """
    Mode 2: Free Prompt API for Z-KATT.
    Generates a 5-phase attack scenario JSON using AI.
    """
    from core.ai_client import lmstudio_chat
    
    prompt = request.data.get('prompt', '')
    if not prompt:
        return Response({"error": "Prompt is required"}, status=400)

    system_prompt = """You are a cybersecurity educator. Given a user-described attack scenario, 
generate a JSON object with this exact structure:
{
  "category": "string (short name)",
  "phases": [
    { "phase": "Attacker Action", "content": "string", "details": ["string", "string", "string"] },
    { "phase": "Victim Perspective", "content": "string", "details": ["string", "string", "string"] },
    { "phase": "Consequence", "content": "string", "details": ["string", "string", "string"] },
    { "phase": "Warning Signs", "content": "string", "details": ["string", "string", "string"] },
    { "phase": "Prevention Tips", "content": "string", "details": ["string", "string", "string"] }
  ]
}
Return ONLY valid JSON. No markdown. No preamble. No talk. Ensure it is exactly 5 phases with those specific names."""

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate a simulation for this attack: {prompt}"}
        ]
        
        raw_response = lmstudio_chat(messages, temperature=0.7, max_tokens=1000)
        
        # Robust JSON parsing
        json_str = raw_response.strip()
        if "```" in json_str:
            import re
            blocks = re.findall(r'```(?:json)?\s*(.*?)\s*```', json_str, re.DOTALL)
            if blocks:
                json_str = blocks[0]
        
        # Strip potential non-JSON noise at start/end
        first_brace = json_str.find('{')
        last_brace = json_str.rfind('}')
        if first_brace != -1 and last_brace != -1:
            json_str = json_str[first_brace:last_brace+1]
            
        data = json.loads(json_str)
        return Response(data)

    except Exception as e:
        # Silently log error, frontend will handle fallback
        print(f"Z-KATT AI Error: {e}")
        return Response({"error": "AI generation failed. Switching to guided mode."}, status=200)
