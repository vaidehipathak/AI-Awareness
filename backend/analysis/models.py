from django.conf import settings
from django.db import models


class AnalysisFile(models.Model):
    """Lightweight file reference without storing actual file content."""
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)
    size_bytes = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.original_name


class DetectionRun(models.Model):
    """One router invocation per uploaded file."""
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('REVIEWED', 'Reviewed'),
        ('FLAGGED', 'Flagged'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    file = models.ForeignKey(AnalysisFile, on_delete=models.CASCADE, related_name='runs')
    risk_label = models.CharField(max_length=10, choices=[('LOW','LOW'),('MEDIUM','MEDIUM'),('HIGH','HIGH')])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    detectors_executed = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Run {self.id} - {self.file.original_name} - {self.status}"


class DetectorResult(models.Model):
    run = models.ForeignKey(DetectionRun, on_delete=models.CASCADE, related_name='results')
    detector_name = models.CharField(max_length=100)
    output = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.detector_name} -> Run {self.run_id}"
