from django.urls import path
from .views import admin_report_list, admin_report_detail, admin_report_status_update, AdminDashboardStatsView

app_name = 'analysis'

urlpatterns = [
    # Admin report management endpoints
    path('admin/reports/', admin_report_list, name='admin-report-list'),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
    path('admin/reports/<int:report_id>/', admin_report_detail, name='admin-report-detail'),
    path('admin/reports/<int:report_id>/status/', admin_report_status_update, name='admin-report-status'),
]
