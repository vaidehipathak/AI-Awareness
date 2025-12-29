from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid

class User(AbstractUser):
    """
    Custom User model extended for security requirements.
    
    Security features:
    - Role-based access control (RBAC) via 'role' field.
    - Account lockout capabilities via 'failed_login_attempts' and 'account_locked_until'.
    - MFA readiness via 'mfa_enabled'.
    """

    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('Admin')
        LEARNER = 'LEARNER', _('Learner')

    # RBAC Role
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.LEARNER,
        help_text=_("User role for RBAC.")
    )

    # Security / Lockout fields
    failed_login_attempts = models.IntegerField(
        default=0,
        help_text=_("Count of consecutive failed login attempts.")
    )
    
    account_locked_until = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Timestamp until which the account is locked.")
    )
    
    mfa_enabled = models.BooleanField(
        default=False,
        help_text=_("Indicates if MFA is active for this user.")
    )

    mfa_reset_required = models.BooleanField(
        default=False,
        help_text=_("If true, user must re-enroll MFA on next login; set when admin resets MFA.")
    )

    # Explicitly mentioning is_active as per requirements, 
    # though AbstractUser already provides this with default=True.
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.username} ({self.role})"


class MFASecret(models.Model):
    """
    Stores encrypted MFA secrets and hashed backup codes.
    
    Security decisions:
    - OneToOne relationship ensures only one active MFA configuration per user.
    - Secrets are stored encrypted (assumed handled by application logic).
    - Backup codes are stored hashed to prevent retrieval if DB is compromised.
    """
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='mfa_secret',
        help_text=_("The user this MFA secret belongs to.")
    )
    
    # Encrypted secret key for TOTP
    secret_encrypted = models.TextField(
        help_text=_("Encrypted TOTP secret key.")
    )
    
    # Hashed backup codes
    backup_codes_hashed = models.JSONField(
        help_text=_("List of hashed backup codes.")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_("When this MFA secret was generated.")
    )
    
    last_used_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When MFA was last successfully verified.")
    )

    class Meta:
        verbose_name = _("MFA Secret")
        verbose_name_plural = _("MFA Secrets")

    def __str__(self):
        return f"MFA Secret for {self.user.username}"


class AuditLog(models.Model):
    """
    Immutable audit log for security-critical actions.
    
    Security decisions:
    - Immutable by design (application logic should enforce this).
    - Captures actor, action, target, and metadata for full context.
    - 'actor' is nullable to support system-level actions (e.g. background tasks).
    """
    
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        help_text=_("User who performed the action. Null for system actions.")
    )
    
    action = models.CharField(
        max_length=50,
        help_text=_("Short string identifier for the action (e.g., 'LOGIN_FAILED').")
    )
    
    target = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text=_("Identifier of the object being acted upon (e.g., 'report:123').")
    )
    
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text=_("Additional context about the event.")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text=_("Timestamp when the event occurred.")
    )

    class Meta:
        verbose_name = _("Audit Log")
        verbose_name_plural = _("Audit Logs")
        ordering = ['-created_at']

    def __str__(self):
        actor_name = self.actor.username if self.actor else "System"
        return f"[{self.created_at}] {actor_name} -> {self.action}"

    def save(self, *args, **kwargs):
        """
        Enforce immutability.
        Prevent updates to existing log entries.
        """
        if self.pk:
            raise NotImplementedError("AuditLog entries are immutable and cannot be updated.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """
        Enforce immutability.
        Prevent deletion of log entries.
        """
        raise NotImplementedError("AuditLog entries are immutable and cannot be deleted.")


class PasswordResetToken(models.Model):
    """
    Stores hashed password reset tokens.
    
    Security decisions:
    - Tokens are hashed (SHA-256) before storage to prevent leakage if DB is compromised.
    - Tokens are single-use and time-limited.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens',
        help_text=_("The user requesting password reset.")
    )
    
    token_hash = models.CharField(
        max_length=128,
        help_text=_("SHA-256 hash of the reset token.")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_("When the token was generated.")
    )
    
    expires_at = models.DateTimeField(
        help_text=_("When the token expires.")
    )
    
    used = models.BooleanField(
        default=False,
        help_text=_("Whether this token has been used.")
    )
    
    class Meta:
        verbose_name = _("Password Reset Token")
        verbose_name_plural = _("Password Reset Tokens")
        
    def __str__(self):
        return f"Reset Token for {self.user.username} (Expires: {self.expires_at})"
