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
    NewsAPI proxy endpoint with rate limiting (2 requests/day), caching, and filtering.
    Fetches AI, cybersecurity, and cybercrime news from the last 15 days.
    """
    from datetime import datetime, timedelta
    from django.utils import timezone as tz
    from .models import NewsAPIRequestLog, CachedNewsArticle
    
    # Check cache first (12-hour expiration)
    cache_expiry = tz.now() - timedelta(hours=12)
    cached_articles = CachedNewsArticle.objects.filter(cached_at__gte=cache_expiry)
    
    if cached_articles.exists():
        # Return cached articles
        articles_data = []
        for article in cached_articles:
            articles_data.append({
                'title': article.title,
                'author': article.author or 'Unknown Author',
                'publishedAt': article.published_at.isoformat(),
                'description': article.description or 'Click to read more.',
                'url': article.url,
                'urlToImage': article.url_to_image,
                'source': {'name': article.source_name},
                'content': article.content or ''
            })
        
        if articles_data:
            return Response(articles_data)
    
    # Check rate limit (max 2 requests per day)
    today_start = tz.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_requests = NewsAPIRequestLog.objects.filter(requested_at__gte=today_start).count()
    
    if today_requests >= 2:
        # Rate limit exceeded, return stale cache or database fallback
        stale_cached = CachedNewsArticle.objects.all()[:50]
        if stale_cached.exists():
            articles_data = []
            for article in stale_cached:
                articles_data.append({
                    'title': article.title,
                    'author': article.author or 'Unknown Author',
                    'publishedAt': article.published_at.isoformat(),
                    'description': article.description or 'Click to read more.',
                    'url': article.url,
                    'urlToImage': article.url_to_image,
                    'source': {'name': article.source_name},
                    'content': article.content or ''
                })
            return Response(articles_data)
        else:
            # Fallback to database
            return _get_database_fallback()
    
    # Fetch from NewsAPI
    api_key = getattr(settings, 'NEWS_API_KEY', '')
    
    if not api_key:
        return _get_database_fallback()
    
    try:
        url = "https://newsapi.org/v2/everything"
        
        # Calculate date range (last 15 days)
        from_date = (tz.now() - timedelta(days=15)).strftime('%Y-%m-%d')
        
        # Request parameters with focused keywords
        params = {
            "q": '("artificial intelligence" OR "AI" OR "machine learning" OR "cybersecurity" OR "cyber security" OR "cybercrime" OR "cyber crime" OR "cyber attack" OR "data breach")',
            "language": "en",
            "sortBy": "publishedAt",
            "from": from_date,
            "pageSize": 100,
            "apiKey": api_key,
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            valid_articles = []
            
            if 'articles' in data:
                raw_articles = data['articles']
                
                # Clear old cache
                CachedNewsArticle.objects.all().delete()
                
                for article in raw_articles:
                    title_text = (article.get('title') or '').lower()
                    
                    # Filter out removed content
                    if '[removed]' in title_text or article.get('title') == '[Removed]':
                        continue
                    
                    source_name = 'AI News'
                    if article.get('source') and article['source'].get('name'):
                        source_name = article['source']['name']
                    
                    article_url = article.get('url')
                    if not article_url:
                        continue
                    
                    # Parse published date
                    published_at = article.get('publishedAt')
                    if published_at:
                        try:
                            published_dt = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                        except:
                            published_dt = tz.now()
                    else:
                        published_dt = tz.now()
                    
                    # Save to cache
                    try:
                        cached_article, created = CachedNewsArticle.objects.get_or_create(
                            url=article_url,
                            defaults={
                                'title': article.get('title') or 'Untitled Article',
                                'author': article.get('author'),
                                'published_at': published_dt,
                                'description': (article.get('description') or 'Click to read more.')[:500],
                                'url_to_image': article.get('urlToImage'),
                                'source_name': source_name,
                                'content': (article.get('content') or '')[:500]
                            }
                        )
                        
                        sanitized_article = {
                            'title': cached_article.title,
                            'author': cached_article.author or 'Unknown Author',
                            'publishedAt': cached_article.published_at.isoformat(),
                            'description': cached_article.description,
                            'url': cached_article.url,
                            'urlToImage': cached_article.url_to_image,
                            'source': {'name': cached_article.source_name},
                            'content': cached_article.content
                        }
                        
                        valid_articles.append(sanitized_article)
                    except Exception as e:
                        print(f"Error caching article: {e}")
                        continue
                
                # Log the API request
                NewsAPIRequestLog.objects.create(
                    success=True,
                    articles_fetched=len(valid_articles)
                )
                
                if valid_articles:
                    return Response(valid_articles)
        else:
            # Log failed request
            NewsAPIRequestLog.objects.create(
                success=False,
                articles_fetched=0
            )
            
    except Exception as e:
        print(f"NewsAPI.org ERROR: {e}")
        # Log failed request
        NewsAPIRequestLog.objects.create(
            success=False,
            articles_fetched=0
        )
    
    # Fallback to database or stale cache
    return _get_database_fallback()


def _get_database_fallback():
    """Helper function to return database articles as fallback."""
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

