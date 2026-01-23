from django.contrib import admin
from .models import SecurityScan


@admin.register(SecurityScan)
class SecurityScanAdmin(admin.ModelAdmin):
    list_display = ('target_url', 'user', 'status', 'vulnerability_count', 'risk_score', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('target_url', 'user__email')
    readonly_fields = ('scan_id', 'created_at', 'completed_at', 'vulnerability_count', 'risk_score')
    
    fieldsets = (
        ('Scan Information', {
            'fields': ('scan_id', 'user', 'target_url', 'status')
        }),
        ('Results', {
            'fields': ('vulnerability_count', 'risk_score', 'results', 'error_message')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'completed_at')
        }),
    )
