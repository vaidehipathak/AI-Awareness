"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from accounts.admin import admin_site
from django.urls import path
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
import logging

from .safety import generate_safe_reply

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def ask_ai(request):
    """
    Safe AI chat endpoint with two-stage classifier + assistant pipeline.
    
    POST /api/ask-ai/
    Body: {"message": "<user text>"}
    Response: {"reply": "<assistant text>"}
    """
    try:
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return JsonResponse({
                'reply': 'Please provide a message.'
            }, status=400)
        
        logger.info(f"Processing message: {user_message[:50]}...")
        
        # Two-stage pipeline: classify + generate
        reply = generate_safe_reply(user_message)
        
        logger.info(f"Generated reply: {reply[:50]}...")
        return JsonResponse({'reply': reply})
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in request")
        return JsonResponse({
            'reply': 'Invalid request format. Please send valid JSON.'
        }, status=400)
    except Exception as e:
        logger.exception(f"Error in ask_ai: {e}")
        return JsonResponse({
            'reply': (
                'I encountered an error processing your request. '
                'Please ensure LM Studio is running on http://localhost:1234 '
                'with the Gemma 3 12B model loaded, and try again.'
            )
        }, status=500)


@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'ok',
        'message': 'Backend server is running and ready for AI chat'
    })


from analysis.views import analyze
from django.urls import include

urlpatterns = [
    path('admin/', admin_site.urls),
    path('api/ask-ai/', ask_ai, name='ask-ai'),
    path('api/analyze/', analyze, name='analyze'),
    path('api/', include('analysis.urls')),
    path('api/health/', health_check, name='health-check'),
    path('auth/', include('accounts.urls')),
    path('api/content/', include('content.urls')),
]
