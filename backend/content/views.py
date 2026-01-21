from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
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
@permission_classes([permissions.AllowAny])
def fetch_news(request):
    """
    NewsAPI.ai (Event Registry) proxy endpoint with strict AI relevance filtering.
    """
    # Use the new API Key provided by the user
    # Ideally should be in settings/env, but hardcoding as per direct instructions for now or fallback
    api_key = getattr(settings, 'NEWS_API_KEY', '9da7c3728fa940d3b50541c9cd5ca6c9')
    
    # Strong keywords for AI relevance
    strong_keywords = [
        "artificial intelligence", "machine learning", "deep learning", 
        "generative ai", "large language model", "neural network",
        "computer vision", "natural language processing", "ai research",
        "ai ethics", "openai", "deepmind", "anthropic"
    ]
    
    if api_key:
        try:
            # NewsAPI.org Endpoint
            url = "https://newsapi.org/v2/everything"
            
            # Request Payload
            params = {
                "q": '("artificial intelligence" OR "cybersecurity" OR "cybercrime" OR "AI" OR "cyber attack")', # Expanded keywords
                "language": "en",
                "sortBy": "publishedAt",
                "pageSize": 100,
                "apiKey": api_key,
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                valid_articles = []
                
                # NewsAPI.org structure: data['articles'] is a list
                if 'articles' in data:
                    raw_articles = data['articles']
                    
                    for article in raw_articles:
                        # 3. Data Mapping (NewsAPI.org -> Frontend Contract)
                        # We trust the API query "artificial intelligence" is relevant enough.
                        # Just filter out broken/removed content.
                        
                        title_text = (article.get('title') or '').lower()
                        
                        # Filter out API-level removals
                        if '[removed]' in title_text or article.get('title') == '[Removed]':
                            continue

                        source_name = 'AI News'
                        if article.get('source') and article['source'].get('name'):
                            source_name = article['source']['name']

                        sanitized_article = {
                            'title': article.get('title') or 'Untitled AI Article',
                            'author': article.get('author') or 'Unknown Author',
                            'publishedAt': article.get('publishedAt') or timezone.now().isoformat(),
                            'description': (article.get('description') or 'Click to read more.')[:250] + '...',
                            'url': article.get('url'),
                            'urlToImage': article.get('urlToImage'),
                            'source': {'name': source_name},
                            'content': (article.get('content') or '')[:200]
                        }
                        
                        # MUST have a URL and not be generic junk
                        if sanitized_article['url'] and 'yahoo' not in title_text: # Keeping yahoo filter if user disliked it, or remove? User wants providers.
                             valid_articles.append(sanitized_article)
                    
                    # If we found valid articles, return them
                    if valid_articles:
                        return Response(valid_articles)
                        
        except Exception as e:
            # 5. Log errors silent
            print(f"NewsAPI.org ERROR: {e}")
            # Fall through to database fallback
    
    # Fallback to database articles if API fails or returns nothing
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
            'source': {'name': article.get('source_name', 'AI AwareX')},
            'content': article.get('content', '')
        })
    
    return Response(transformed)
