from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, MFAEnrollView, MFAVerifyView, AdminAuditLogListView, ForgotPasswordView, ResetPasswordView

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # MFA Endpoints
    path('otp/enroll/', MFAEnrollView.as_view(), name='mfa_enroll'),
    path('otp/verify/', MFAVerifyView.as_view(), name='mfa_verify'),
    path('otp/confirm-enroll/', MFAVerifyView.as_view(), name='mfa_confirm_enroll'), # Support confirm-enroll as alias if needed, or mapped to Verify
    
    # Password Reset
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    
    # Admin Audit Log Endpoint
    # We use 'admin/audit-logs/' here, but typically admin routes might be prefixed differently in core/urls.py
    # Assuming this is included via 'auth/', so the path will be /auth/admin/audit-logs/
    # If the user specifically wanted /admin/audit-logs/ at the root, we'd need to change core/urls.py.
    # But usually 'accounts' urls are for auth related things.
    # The requirement says: Endpoint: GET /admin/audit-logs/
    # If I put it here, it becomes /auth/admin/audit-logs/ if backend/core/urls.py has `path('auth/', include('accounts.urls'))`.
    # Let's check core/urls.py again to be sure where accounts.urls is included.
    path('admin/audit-logs/', AdminAuditLogListView.as_view(), name='admin_audit_logs'),
]
