"""
Custom Versioned JWT Authentication backend for AI-AwareX.
Verifies jwt_token_version claim against user.jwt_token_version to enforce instant session revocation.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
import logging

logger = logging.getLogger(__name__)

class VersionedJWTAuthentication(JWTAuthentication):
    """
    Extends SimpleJWT's JWTAuthentication to enforce token version checks.
    When user resets password or logs out of all sessions, user.jwt_token_version is incremented.
    Any JWT token issued prior to the reset will have an outdated version claim and be rejected immediately.
    """
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        
        # Extract token_version claim
        token_version = validated_token.get('jwt_token_version')
        
        # If token has version claim, verify against user's current version
        if token_version is not None and token_version != user.jwt_token_version:
            logger.warning(f"Revoked token used for user {user.username} (token_version: {token_version}, user_version: {user.jwt_token_version})")
            raise AuthenticationFailed(
                'Token has been invalidated due to password reset or session revocation.',
                code='token_invalidated'
            )
            
        return user
