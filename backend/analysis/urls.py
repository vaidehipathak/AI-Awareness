from django.urls import path
from .views import analyze, admin_report_list, admin_report_detail, admin_report_status_update

app_name = 'analysis'

urlpatterns = [
    # This is the one that works for images
    path('analyze/', analyze, name='analyze'), 
    
    # ADD THESE TWO LINES to catch the PDF and PII calls from your frontend:
    path('detect-pdf-ai/', analyze, name='detect-pdf-ai'),
    path('detect-pii/', analyze, name='detect-pii'),
    
    # Admin report management
    path('admin/reports/', admin_report_list, name='admin-report-list'),
    path('admin/reports/<int:report_id>/', admin_report_detail, name='admin-report-detail'),
    path('admin/reports/<int:report_id>/status/', admin_report_status_update, name='admin-report-status'),
]