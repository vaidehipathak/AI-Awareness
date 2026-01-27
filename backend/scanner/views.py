from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import threading
from .models import SecurityScan
from .scanner_utils import run_basic_scan
from django.shortcuts import get_object_or_404


@api_view(['POST'])
@permission_classes([AllowAny])  # Public access - no auth required
def start_scan(request):
    """Start a new security scan - runs directly in Django"""
    url = request.data.get('url')
    
    if not url:
        return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate URL format
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    # Create scan record (user can be None for public access)
    scan = SecurityScan.objects.create(
        user=request.user if request.user.is_authenticated else None,
        target_url=url,
        status='running'
    )
    
    # Run scan in background thread
    def run_scan_async():
        try:
            # Run the actual security scan
            results = run_basic_scan(url)
            
            # Update scan record with results
            scan.results = results
            scan.vulnerability_count = results.get('vulnerability_count', 0)
            scan.risk_score = results.get('risk_score', 0)
            scan.status = 'completed'
            scan.completed_at = timezone.now()
            scan.save()
            
        except Exception as e:
            scan.status = 'failed'
            scan.error_message = str(e)
            scan.save()
    
    # Start background thread
    thread = threading.Thread(target=run_scan_async)
    thread.daemon = True
    thread.start()
    
    return Response({
        'scan_id': str(scan.scan_id),
        'status': 'running',
        'target_url': scan.target_url,
        'message': 'Scan started successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])  # Public access - no auth required
def get_scan_status(request, scan_id):
    """Get status and results of a specific scan"""
    try:
        scan = SecurityScan.objects.get(scan_id=scan_id)
    except SecurityScan.DoesNotExist:
        return Response({'error': 'Scan not found'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response({
        'scan_id': str(scan.scan_id),
        'status': scan.status,
        'target_url': scan.target_url,
        'results': scan.results,
        'vulnerability_count': scan.vulnerability_count,
        'risk_score': scan.risk_score,
        'error_message': scan.error_message,
        'created_at': scan.created_at,
        'completed_at': scan.completed_at
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])  # Public access - no auth required
def get_scan_history(request):
    """Get user's scan history"""
    # If authenticated, show user's scans; otherwise show recent public scans
    # Only show scans for authenticated users
    if request.user.is_authenticated:
        scans = SecurityScan.objects.filter(user=request.user)[:20]
    else:
        # Do NOT show shared scans. Return empty list if not logged in.
        scans = SecurityScan.objects.none()
    
    scan_list = [{
        'scan_id': str(scan.scan_id),
        'target_url': scan.target_url,
        'status': scan.status,
        'results': scan.results,
        'vulnerability_count': scan.vulnerability_count,
        'risk_score': scan.risk_score,
        'created_at': scan.created_at,
        'completed_at': scan.completed_at
    } for scan in scans]
    
    return Response({
        'scans': scan_list,
        'total': scans.count()
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])  # Keep auth for delete
def delete_scan(request, scan_id):
    """Delete a scan from history"""
    scan = get_object_or_404(SecurityScan, scan_id=scan_id, user=request.user)
    scan.delete()
    
    return Response({
        'message': 'Scan deleted successfully'
    }, status=status.HTTP_200_OK)
