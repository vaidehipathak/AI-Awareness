from django.urls import path
from . import views

urlpatterns = [
    path('scan/', views.start_scan, name='start_scan'),
    path('status/<uuid:scan_id>/', views.get_scan_status, name='get_scan_status'),
    path('history/', views.get_scan_history, name='get_scan_history'),
    path('delete/<uuid:scan_id>/', views.delete_scan, name='delete_scan'),
]
