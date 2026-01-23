from accounts.admin import admin_site
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
import logging

# Import the chatbot safety logic
from .safety import generate_safe_reply

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def ask_ai(request):
    try:
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
        if not user_message:
            return JsonResponse({'reply': 'Please provide a message.'}, status=400)
        reply = generate_safe_reply(user_message)
        return JsonResponse({'reply': reply})
    except Exception as e:
        return JsonResponse({
            'reply': 'Ensure LM Studio is running on http://localhost:1234 with Gemma 3 loaded.'
        }, status=500)

@require_http_methods(["GET"])
def health_check(request):
    return JsonResponse({'status': 'ok'})

urlpatterns = [
    path('admin/', admin_site.urls),
    path('api/ask-ai/', ask_ai, name='ask-ai'),
    path('api/health/', health_check, name='health-check'),
    
    # This covers /api/analyze/ and /api/admin/reports/
    path('api/', include('analysis.urls')), 
    
    path('auth/', include('accounts.urls')),
    path('api/content/', include('content.urls')),
    path('api/scanner/', include('scanner.urls')),  # Vulnerability scanner endpoints
]
