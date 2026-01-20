from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


class RoleBasedAdminSite(admin.AdminSite):
    """
    Custom admin site that enforces ADMIN role for access.
    
    Only users with role='ADMIN' can access the admin panel,
    in addition to standard is_active and is_staff checks.
    """
    site_header = "AI AwareX Administration"
    site_title = "AI AwareX Admin"
    index_title = "Welcome to AI AwareX Admin Panel"
    
    def has_permission(self, request):
        """
        Check if user has permission to access admin site.
        Requires: is_active, is_staff, and role='ADMIN'.
        """
        return (
            request.user.is_active
            and request.user.is_staff
            and hasattr(request.user, 'role')
            and request.user.role == 'ADMIN'
        )


class UserAdmin(BaseUserAdmin):
    """Admin interface for custom User model with role field."""
    
    list_display = ('email', 'username', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('email', 'username')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Role', {'fields': ('role',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role', 'is_staff', 'is_active'),
        }),
    )


# Create custom admin site instance
admin_site = RoleBasedAdminSite(name='admin')

# Register models with custom admin site
admin_site.register(User, UserAdmin)
