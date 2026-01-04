from rest_framework import serializers

# List of known disposable/temporary email domains
# Case-insensitive matching will be applied
BLOCKED_DOMAINS = {
    'mailinator.com',
    'tempmail.com',
    'temp-mail.org',
    '10minutemail.com',
    'guerrillamail.com',
    'yopmail.com',
    'throwawaymail.com',
    'sharklasers.com',
    'getairmail.com',
    'dispostable.com',
    'mail.tm',
    'tempmail.net',
    'tempmail.info',
    'anonbox.net',
    'grr.la',
    'guerrillamail.biz',
    'guerrillamail.de',
    'guerrillamail.net',
    'guerrillamail.org',
    'guerrillamailblock.com',
    'spam4.me',
    'trashmail.com',
    'maildrop.cc',
}

def validate_email_domain(email: str):
    """
    Validates that the email address does not belong to a disposable domain.
    Raises serializers.ValidationError if it does.
    """
    if not email or '@' not in email:
        return

    domain = email.split('@')[-1].lower()
    
    # Check exact domain match
    if domain in BLOCKED_DOMAINS:
        raise serializers.ValidationError("Temporary or disposable email addresses are not allowed.")

    # Check for subdomains of blocked domains (e.g. m.mailinator.com)
    for blocked in BLOCKED_DOMAINS:
        if domain.endswith('.' + blocked):
             raise serializers.ValidationError("Temporary or disposable email addresses are not allowed.")

def send_password_reset_email(email: str, reset_link: str):
    """
    Sends a password reset email using the configured email backend.
    """
    from django.core.mail import send_mail
    from django.conf import settings
    
    subject = "Password Reset Request"
    message = f"Click the following link to reset your password:\n\n{reset_link}\n\nIf you did not request this, please ignore this email."
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception:
        # In a real app, log this error
        return False

