from django.core.management.base import BaseCommand
from content.models import Article, Game, Quiz, AwarenessTopic
import json

class Command(BaseCommand):
    help = 'Seeds initial content from frontend hardcoded data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding content...")

        # 1. Articles (Mock data since original was NewsAPI)
        if not Article.objects.exists():
            Article.objects.create(
                title="The Future of AI Ethics",
                author="System Admin",
                content="Artificial Intelligence is reshaping our world...",
                description="An overview of ethical considerations in AI.",
                is_active=True
            )
            Article.objects.create(
                title="Understanding Neural Networks",
                author="AI Educator",
                content="Neural networks are inspired by the human brain...",
                description="Deep dive into how deep learning works.",
                is_active=True
            )
            self.stdout.write("Articles seeded.")

        # 2. Games
        if not Game.objects.exists():
            # Drag & Drop
            Game.objects.create(
                title="AI Terminology Match",
                game_type='DRAG_DROP',
                description="Match the AI terms to their definitions.",
                game_data=[
                    {"term": "Machine Learning", "definition": "Algorithm that learns from data"},
                    {"term": "Neural Network", "definition": "Brain-inspired computing system"},
                    {"term": "Deep Learning", "definition": "ML with multiple layers"},
                    {"term": "NLP", "definition": "Natural language processing"},
                    {"term": "Computer Vision", "definition": "AI interpreting images"}
                ]
            )
            # True/False
            Game.objects.create(
                title="True/False Lightning",
                game_type='TRUE_FALSE',
                description="Quick fire questions about AI facts.",
                game_data=[
                     {"question": "Machine Learning is a subset of AI", "answer": True},
                     {"question": "Deep Learning always requires labeled data", "answer": False},
                     {"question": "Neural networks are inspired by the brain", "answer": True}
                ]
            )
            # Spot Bias
            Game.objects.create(
                title="Spot the Bias",
                game_type='SPOT_BIAS',
                description="Identify the bias in these scenarios.",
                game_data=[
                    {
                      "scenario": "Resume Screening AI",
                      "description": "AI ranks top 5 engineering candidates...",
                      "candidates": ["Alex (Male)", "Sarah (Female)", "Michael", "Jennifer", "David"],
                      "biasType": "Gender bias",
                      "correctAnswer": 1
                    }
                ]
            )
            self.stdout.write("Games seeded.")

        # 3. Quizzes (Splitting into difficulty levels as separate Quizzes for management flexibility)
        if not Quiz.objects.exists():
            # Easy
            Quiz.objects.create(
                title="AI Basics (Easy)",
                difficulty='easy',
                questions=[
                  {
                    "prompt": "What does AI stand for?",
                    "options": ["Automatic Interface", "Artificial Intelligence", "Advanced Internet", "Applied Innovation"],
                    "correctIndex": 1,
                    "explanation": "AI stands for Artificial Intelligence."
                  },
                  {
                    "prompt": "Which of these uses AI?",
                    "options": ["Smartphone camera", "Electric fan", "Calculator", "Light bulb"],
                    "correctIndex": 0,
                    "explanation": "Smartphone cameras use AI for face detection."
                  }
                ]
            )
            self.stdout.write("Quizzes seeded.")

        # 4. Awareness Topics
        if not AwarenessTopic.objects.exists():
            AwarenessTopic.objects.create(
                title="What is AI, Really?",
                category="AI Basics",
                teaser="It's not just robots. Discover the invisible intelligence you use every single day.",
                icon_name="Brain",
                color_theme="from-blue-500 to-purple-600",
                final_action="You've got the basics!",
                modules=[
                  {
                    "info": {
                      "title": "Module 1: AI in Your Pocket",
                      "summary": "Artificial Intelligence teaches computers to perform tasks...",
                      "points": [
                        { "title": "Navigation", "detail": "Google Maps predicts traffic..." }
                      ]
                    },
                    "quiz": {
                      "question": "Based on the info, which of these is a direct use of AI?",
                      "options": ["A simple calculator app", "Netflix recommending a new show", "A basic digital clock"],
                      "correctAnswerIndex": 1,
                      "explanation": "Recommendation engines are a classic example of AI."
                    }
                  }
                ]
            )
            self.stdout.write("Awareness Topics seeded.")
