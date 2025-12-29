from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'articles', views.ArticleViewSet)
router.register(r'games', views.GameViewSet)
router.register(r'quiz', views.QuizViewSet)
router.register(r'awareness', views.AwarenessTopicViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('news/', views.fetch_news, name='fetch-news'),
]
