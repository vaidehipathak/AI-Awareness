from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import AuditLog

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for registering a new user.
    Enforces password strength and defaults to LEARNER role.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields did not match."})
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        # Default security settings for new users
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.Role.LEARNER,  # Default role
            failed_login_attempts=0,
            mfa_enabled=False
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for login validation.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        # Basic field validation only.
        # Authentication logic (lockout checks, etc.) is handled in the View
        # to ensure we capture the user object even on failure for auditing.
        return attrs

    def get_tokens(self, user):
        """
        Generate JWT tokens with custom claims (role).
        """
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims
        refresh['role'] = user.role
        refresh['email'] = user.email

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
            'user_id': user.id
        }


class AuditLogSerializer(serializers.ModelSerializer):
    """
    Serializer for audit logs.
    Read-only, for admin use.
    """
    actor_username = serializers.ReadOnlyField(source='actor.username')
    actor_id = serializers.ReadOnlyField(source='actor.id')

    class Meta:
        model = AuditLog
        fields = ['id', 'actor_id', 'actor_username', 'action', 'target', 'metadata', 'created_at']
        read_only_fields = fields


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"new_password": "Password fields did not match."})
        return attrs
