from rest_framework import serializers
import pyotp
import uuid
from .utils import decrypt_secret

class MFAEnrollmentSerializer(serializers.Serializer):
    """
    Serializer to start MFA enrollment.
    Generates a new secret, backup codes, and OTP URI.
    """
    # Response fields
    secret = serializers.CharField(read_only=True)
    otp_uri = serializers.CharField(read_only=True)
    backup_codes = serializers.ListField(child=serializers.CharField(), read_only=True)

    def create(self, validated_data):
        user = self.context['request'].user
        
        # 1. Generate random base32 Secret
        secret = pyotp.random_base32()
        
        # 2. Generate Provisioning URI (for QR Code)
        otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name="AI-AwareX-Platform"
        )
        
        # 3. Generate 10 random backup codes (8 chars hex)
        backup_codes = [uuid.uuid4().hex[:8].upper() for _ in range(10)]
        
        return {
            'secret': secret,
            'otp_uri': otp_uri,
            'backup_codes': backup_codes
        }

class MFAVerifySerializer(serializers.Serializer):
    """
    Serializer to verify MFA setup or login.
    Accepts either 'otp' (6 digits) or 'backup_code'.
    """
    otp = serializers.CharField(required=False, min_length=6, max_length=6)
    backup_code = serializers.CharField(required=False)
    
    def validate(self, attrs):
        if not attrs.get('otp') and not attrs.get('backup_code'):
            raise serializers.ValidationError("Must provide either 'otp' or 'backup_code'.")
        return attrs
