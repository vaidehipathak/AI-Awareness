from rest_framework import serializers
from .models import Article, Game, Quiz, AwarenessTopic

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class AwarenessTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = AwarenessTopic
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']
