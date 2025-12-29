from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User

class ContentBase(models.Model):
    """
    Abstract base class for all admin-managed content.
    """
    title = models.CharField(max_length=255, help_text=_("Title of the content."))
    description = models.TextField(blank=True, null=True, help_text=_("Description or summary."))
    
    is_active = models.BooleanField(
        default=True,
        help_text=_("If unchecked, this content will be hidden from users.")
    )
    is_deleted = models.BooleanField(
        default=False,
        help_text=_("Soft delete flag.")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_created",
        help_text=_("Admin who created this content.")
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class Article(ContentBase):
    """
    Blog Articles.
    """
    author = models.CharField(max_length=255, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    content = models.TextField(help_text=_("Main content (Markdown or HTML)."))
    source_name = models.CharField(max_length=255, blank=True, null=True, help_text=_("Original source name if curated."))
    source_url = models.URLField(blank=True, null=True, help_text=_("Link to original source."))
    published_at = models.DateTimeField(auto_now_add=True)

class Game(ContentBase):
    """
    Games configuration (e.g. Memory, Drag & Drop).
    actual game logic is frontend, but data comes from here.
    """
    class GameType(models.TextChoices):
        DRAG_DROP = 'DRAG_DROP', _('Drag & Drop')
        TRUE_FALSE = 'TRUE_FALSE', _('True / False')
        MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', _('Multiple Choice (Quiz Game)')
        SPOT_BIAS = 'SPOT_BIAS', _('Spot the Bias')
        MEMORY = 'MEMORY', _('Memory Match')
        OTHER = 'OTHER', _('Other')

    game_type = models.CharField(max_length=50, choices=GameType.choices, default=GameType.OTHER)
    
    # Stores the raw game data (e.g. terms/definitions array, questions array)
    # This allows flexibility for different game types without multiple tables.
    game_data = models.JSONField(help_text=_("JSON structure defining the game content (questions, terms, scenarios)."))

class Quiz(ContentBase):
    """
    Standalone Quizzes (separate from Games page quiz if any).
    Or can replace the 'Quiz' page content.
    """
    difficulty = models.CharField(
        max_length=20, 
        choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')],
        default='easy'
    )
    # Stores the questions. 
    # Structure: [{prompt: "", options: [], correctIndex: 0, explanation: ""}]
    questions = models.JSONField(default=list) 

class AwarenessTopic(ContentBase):
    """
    High-level topic in Awareness Hub (e.g. 'AI Basics').
    """
    category = models.CharField(max_length=100) # e.g. "AI Basics", "Privacy"
    teaser = models.TextField(help_text=_("Short teaser text for the card."))
    icon_name = models.CharField(max_length=50, help_text=_("Lucide icon name (e.g. 'Brain', 'Lock')."))
    color_theme = models.CharField(max_length=50, help_text=_("CSS gradient class (e.g. 'from-blue-500 to-purple-600')."))
    final_action = models.CharField(max_length=255, blank=True, null=True)
    
    # Stores the learning modules
    # Structure: [{info: {title, summary, points}, quiz: {question, options, correctIndex, explanation}}]
    modules = models.JSONField(default=list, help_text=_("List of learning modules."))
