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
    NewsAPI.ai (Event Registry) proxy endpoint with strict AI relevance filtering.
    """
    # Use the new API Key provided by the user
    # Ideally should be in settings/env, but hardcoding as per direct instructions for now or fallback
    api_key = getattr(settings, 'NEWS_API_KEY', '5924a2b1-6217-4525-9d20-2861524ffd32')
    
    # Strong keywords for AI relevance
    strong_keywords = [
        "artificial intelligence", "machine learning", "deep learning", 
        "generative ai", "large language model", "neural network",
        "computer vision", "natural language processing", "ai research",
        "ai ethics", "openai", "deepmind", "anthropic"
    ]
    
    if api_key:
        try:
            # NewsAPI.ai / Event Registry Endpoint
            url = "http://eventregistry.org/api/v1/article/getArticles"
            
            # Request Payload
            payload = {
                "action": "getArticles",
                "keyword": "artificial intelligence", # Primary keyword
                "lang": ["eng"],
                "articlesPage": 1,
                "articlesCount": 50, # Fetch plenty to allow for filtering
                "articlesSortBy": "date",
                "articlesSortByAsc": False,
                "apiKey": api_key,
                "resultType": "articles",
                "dataType": ["news", "blog"]
            }
            
            response = requests.post(url, json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Check for nested results structure
                valid_articles = []
                
                # NewsAPI.ai structure: data['articles']['results']
                if 'articles' in data and 'results' in data['articles']:
                    raw_articles = data['articles']['results']
                    
                    for article in raw_articles:
                        # 2. Backend Relevance Filtering
                        # Check title and body (description)
                        title_text = (article.get('title') or '').lower()
                        # Use FULL body for relevance check, truncate only for display
                        desc_text = (article.get('body') or '').lower() 
                        
                        # Count keyword matches
                        title_matches = any(kw in title_text for kw in strong_keywords)
                        desc_matches = sum(1 for kw in strong_keywords if kw in desc_text)
                        
                        # Accept if Title has 1 strong keyword OR Description has 2+ keywords
                        if title_matches or desc_matches >= 2:
                            
                            # 3. Data Mapping & Sanitization (NewsAPI.ai -> Frontend Contract)
                            
                            # Image: 'image' field
                            image_url = article.get('image')
                            if not image_url and 'media' in article:
                                # Sometimes in media list
                                pass 
                            
                            # Source
                            source_name = 'AI News'
                            if 'source' in article and 'title' in article['source']:
                                source_name = article['source']['title']
                                
                            # Author
                            author_name = 'Unknown Author'
                            if 'authors' in article and isinstance(article['authors'], list) and len(article['authors']) > 0:
                                author_name = article['authors'][0].get('name', 'Unknown Author')

                            sanitized_article = {
                                'title': article.get('title') or 'Untitled AI Article',
                                'author': author_name,
                                'publishedAt': article.get('dateTime') or timezone.now().isoformat(),
                                'description': (article.get('body') or 'Click to read more.')[:250] + '...', # Truncate body for description
                                'url': article.get('url'),
                                'urlToImage': image_url,
                                'source': {'name': source_name},
                                'content': (article.get('body') or '')[:200]
                            }
                            
                            # MUST have a URL to be effective
                            if sanitized_article['url']:
                                valid_articles.append(sanitized_article)
                    
                    # If we found valid articles, return them
                    if valid_articles:
                        return Response(valid_articles)

        except Exception as e:
            # 5. Log errors silent
            print(f"NewsAPI.ai ERROR: {e}")
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
            'source': {'name': article.get('source_name', 'AI Awareness')},
            'content': article.get('content', '')
        })
    
    return Response(transformed)
