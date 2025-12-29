from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from django.utils import timezone
from django.conf import settings
import requests
from .models import Article, Game, Quiz, AwarenessTopic
from .serializers import ArticleSerializer, GameSerializer, QuizSerializer, AwarenessTopicSerializer
from accounts.models import AuditLog
from accounts.permissions import IsAdminWithMFA # Assuming this exists or generic Admin

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True # Allow read-only for everyone
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'ADMIN'

class ContentAuditViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet handling Audit Logs and Soft Deletes.
    """
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        
        # Admin sees everything not deleted (including inactive)
        if user.is_authenticated and getattr(user, 'role', '') == 'ADMIN':
            return self.queryset.filter(is_deleted=False)
        
        # Public/Standard Users see only active content
        return self.queryset.filter(is_active=True, is_deleted=False)

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
        self._log_action('CREATE', instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self._log_action('UPDATE', instance)

    def perform_destroy(self, instance):
        # Soft delete
        instance.is_deleted = True
        instance.is_active = False 
        instance.save()
        self._log_action('DELETE', instance)

    def _log_action(self, action_type, instance):
        try:
            AuditLog.objects.create(
                actor=self.request.user,
                action=f"CONTENT_{action_type.upper()}",
                target=f"{instance._meta.model_name}:{instance.pk}",
                metadata={"title": getattr(instance, 'title', 'N/A')}
            )
        except Exception as e:
            # Fallback or silent fail to not break the transaction
            print(f"Audit log failed: {e}")

class ArticleViewSet(ContentAuditViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

class GameViewSet(ContentAuditViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

class QuizViewSet(ContentAuditViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

class AwarenessTopicViewSet(ContentAuditViewSet):
    queryset = AwarenessTopic.objects.all()
    serializer_class = AwarenessTopicSerializer


@api_view(['GET'])
def fetch_news(request):
    """
    NewsAPI proxy endpoint with database fallback.
    Fetches live AI news from NewsAPI, falls back to database articles if API fails.
    """
    api_key = getattr(settings, 'NEWS_API_KEY', '')
    
    # Try NewsAPI if key is available
    if api_key:
        try:
            response = requests.get(
                'https://newsapi.org/v2/everything',
                params={
                    'q': 'artificial intelligence OR machine learning OR AI OR deep learning',
                    'language': 'en',
                    'sortBy': 'publishedAt',
                    'pageSize': 20,
                    'apiKey': api_key
                },
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok' and data.get('articles'):
                    # Return NewsAPI articles directly
                    return Response(data['articles'])
        except Exception as e:
            print(f"NewsAPI request failed: {e}")
            # Fall through to database fallback
    
    # Fallback to database articles
    articles = Article.objects.filter(is_active=True, is_deleted=False).order_by('-published_at')
    serializer = ArticleSerializer(articles, many=True)
    
    # Transform to NewsAPI-like format for frontend compatibility
    transformed = []
    for article in serializer.data:
        transformed.append({
            'title': article['title'],
            'author': article['author'],
            'publishedAt': article['published_at'],
            'description': article['description'],
            'url': article.get('source_url', '#'),
            'urlToImage': article.get('image_url'),
            'source': {'name': article.get('source_name', 'AI Awareness')},
            'content': article.get('content', '')
        })
    
    return Response(transformed)
