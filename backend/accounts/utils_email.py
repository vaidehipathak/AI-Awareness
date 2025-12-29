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
