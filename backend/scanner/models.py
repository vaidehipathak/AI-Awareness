from django.db import models
from accounts.models import User
import uuid


class SecurityScan(models.Model):
    """Model to store security scan history and results"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    scan_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    target_url = models.URLField(max_length=500)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    results = models.JSONField(null=True, blank=True)
    vulnerability_count = models.IntegerField(default=0)
    risk_score = models.IntegerField(default=0)  # 0-100 scale
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['scan_id']),
        ]
    
    def __str__(self):
        return f"{self.target_url} - {self.status} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
    
    def calculate_risk_score(self):
        """Calculate risk score based on results"""
        if not self.results:
            return 0
        
        # Count vulnerabilities
        vuln_count = 0
        for key, value in self.results.items():
            if isinstance(value, dict) and value.get('vulnerable'):
                vuln_count += 1
        
        self.vulnerability_count = vuln_count
        # Simple risk score: 10 points per vulnerability, capped at 100
        self.risk_score = min(vuln_count * 10, 100)
        return self.risk_score
