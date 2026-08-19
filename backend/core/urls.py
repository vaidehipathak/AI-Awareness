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

from rest_framework.views import APIView
from rest_framework.response import Response as DRFResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle

class AIChatbotThrottle(UserRateThrottle):
    """Dedicated throttle for the AI chatbot — 30 requests/hour per user."""
    scope = 'ai_chatbot'

MAX_AI_INPUT_LENGTH = 2000  # characters

class AskAIView(APIView):
    """
    POST /api/ask-ai/
    Authenticated users only. Rate-limited. Input capped at 2,000 characters.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [AIChatbotThrottle]

    def post(self, request):
        try:
            user_message = (request.data.get('message') or '').strip()
            if not user_message:
                return DRFResponse({'reply': 'Please provide a message.'}, status=400)
            if len(user_message) > MAX_AI_INPUT_LENGTH:
                return DRFResponse(
                    {'reply': f'Message exceeds the {MAX_AI_INPUT_LENGTH}-character limit.'},
                    status=400
                )
            reply = generate_safe_reply(user_message)
            return DRFResponse({'reply': reply})
        except Exception as e:
            logger.exception("ask_ai error: %s", e)
            return DRFResponse(
                {'reply': 'AI service is temporarily unavailable.'},
                status=500
            )

ask_ai = AskAIView.as_view()

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
    path('api/zkatt/', include('zkatt.urls')),
]

# Serve media files in development — gated behind login to prevent public exposure
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.decorators import login_required
from django.views.static import serve as _serve_static

if settings.DEBUG:
    # Wrap the built-in static file server with login_required
    # so /media/* requires an authenticated session even in dev mode.
    _protected_media = login_required(_serve_static)
    urlpatterns += [
        path(
            'media/<path:path>',
            _protected_media,
            {'document_root': settings.MEDIA_ROOT},
            name='protected-media',
        )
    ]
