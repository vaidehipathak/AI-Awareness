from rest_framework import permissions
from .models import AuditLog

class BaseAuditPermission(permissions.BasePermission):
    """
    Base permission class that logs ACCESS_DENIED events.
    """
    def _log_denial(self, request, role_required):
        if request.user and request.user.is_authenticated:
            # Avoid logging excessively for simple checks, but important for security enforcement
            AuditLog.objects.create(
                actor=request.user,
                action="ACCESS_DENIED",
                target=request.path,
                metadata={
                    "method": request.method,
                    "role_required": role_required,
                    "user_role": getattr(request.user, 'role', 'UNKNOWN')
                }
            )

class IsAdminUserRole(BaseAuditPermission):
    """
    Allows access only to users with the ADMIN role.
    DEPRECATED for high-value endpoints: Use IsAdminWithMFA instead.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.role == 'ADMIN':
            return True
            
        self._log_denial(request, "ADMIN")
        return False

class IsAdminWithMFA(BaseAuditPermission):
    """
    STRICT SECURITY: Allows access only if:
    1. User is ADMIN
    2. JWT token has 'mfa_verified': True
    """
    def has_permission(self, request, view):
        # 1. Check Auth (Standard)
        if not request.user or not request.user.is_authenticated:
            return False
            
        # 2. Check Role
        if request.user.role != 'ADMIN':
            # Not an admin at all
            self._log_denial(request, "ADMIN_MFA")
            return False

        # 3. Check MFA Claim in JWT
        # request.auth is the validated token payload/object
        mfa_verified = False
        if request.auth:
            # SimpleJWT exposes dictionary-like interface
            mfa_verified = request.auth.get('mfa_verified', False)

        if mfa_verified:
            return True
            
        # If Admin but no MFA verification
        self._log_denial(request, "ADMIN_MFA_MISSING")
        return False

class IsLearnerUserRole(BaseAuditPermission):
    """
    Allows access only to users with the LEARNER role.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.role == 'LEARNER':
            return True
            
        self._log_denial(request, "LEARNER")
        return False

class IsOwnerOrAdmin(BaseAuditPermission):
    """
    Object-level permission to only allow owners of an object (or admins) to edit/view it.
    Assumes the model instance has a `user` attribute.
    """
    def has_permission(self, request, view):
        # Allow at the view level if authenticated
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin can do anything - BUT should we enforce MFA here?
        # Ideally yes, but typically view-level permission (has_permission) handles the gate.
        # If IsAdminWithMFA is used at view level, request.user.role == ADMIN is already MFA checked.
        if request.user.role == 'ADMIN':
            return True

        # Check ownership
        # We assume the object has a 'user' field pointing to the owner
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
            
        self._log_denial(request, "OWNER_OR_ADMIN")
        return False
