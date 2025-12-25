from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdminUserRole, IsOwnerOrAdmin, IsAdminWithMFA
import json

from .router import route_and_detect


class AnalyzeView(APIView):
    """
    API endpoint for file analysis.
    
    POST /api/analyze/
    Requires JWT authentication.
    Accessible to both USER and ADMIN roles.
    
    Accepts multipart/form-data with:
    - file: uploaded file
    - metadata: optional JSON string
    
    Returns unified Phase 2A detection report.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        """Handle file upload and analysis."""
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response(
                {"error": "Missing file"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        metadata = {}
        if 'metadata' in request.POST:
            try:
                meta_str = request.POST['metadata'].strip()
                if meta_str:
                    metadata = json.loads(meta_str)
            except (json.JSONDecodeError, AttributeError):
                # If metadata is invalid, use empty dict; don't fail the request
                pass
        
        # Pass authenticated user to router
        report = route_and_detect(
            user=request.user,
            uploaded_file=uploaded_file,
            metadata=metadata
        )
        
        return Response(report, status=status.HTTP_200_OK)


# Export for backwards compatibility
analyze = AnalyzeView.as_view()

from rest_framework.pagination import PageNumberPagination
from .models import DetectionRun
from .serializers import (
    ReportListSerializer,
    ReportDetailSerializer,
    ReportStatusUpdateSerializer,
)


class StandardPagination(PageNumberPagination):
    """Standard pagination for admin reports list."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class AdminReportListView(APIView):
    """
    List all analysis reports.
    
    GET /admin/reports/
    ADMIN only - returns paginated list of all reports
    
    Query parameters:
    - page: page number (default 1)
    - page_size: items per page (default 20, max 100)
    
    Response includes:
    - report_id
    - submitted_at
    - submitted_by (email)
    - file_type
    - overall_risk
    - status
    """
    permission_classes = [IsAdminWithMFA]
    
    def get(self, request):
        """Get paginated list of all reports."""
        # Get all detection runs ordered by most recent first
        reports = DetectionRun.objects.select_related('user', 'file').order_by('-created_at')
        
        # Apply pagination
        paginator = StandardPagination()
        paginated_reports = paginator.paginate_queryset(reports, request)
        
        serializer = ReportListSerializer(paginated_reports, many=True)
        return paginator.get_paginated_response(serializer.data)


class ReportDetailView(APIView):
    """
    Retrieve detailed information for a specific report.
    
    GET /admin/reports/{id}/ (or generic report endpoint)
    RBAC: Owner OR Admin
    
    Response includes:
    - Full file metadata
    - All detector outputs with confidence scores and explanations
    - Report status
    """
    permission_classes = [IsOwnerOrAdmin]
    
    def get(self, request, report_id):
        """Get detailed report information."""
        try:
            report = DetectionRun.objects.select_related('user', 'file').prefetch_related('results').get(id=report_id)
        except DetectionRun.DoesNotExist:
            return Response(
                {"error": f"Report {report_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check object permissions
        self.check_object_permissions(request, report)
        
        serializer = ReportDetailSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminReportStatusUpdateView(APIView):
    """
    Update the review status of a report.
    
    PATCH /admin/reports/{id}/status/
    ADMIN only - allows updating report status only
    
    Request body:
    {
        "status": "PENDING" | "REVIEWED" | "FLAGGED"
    }
    
    Response: Updated report with new status
    """
    permission_classes = [IsAdminWithMFA]
    
    def patch(self, request, report_id):
        """Update report status."""
        try:
            report = DetectionRun.objects.select_related('user', 'file').prefetch_related('results').get(id=report_id)
        except DetectionRun.DoesNotExist:
            return Response(
                {"error": f"Report {report_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate and update status
        serializer = ReportStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update only the status field (AI results are read-only)
        report.status = serializer.validated_data['status']
        report.save()
        
        # Return updated report details
        detail_serializer = ReportDetailSerializer(report)
        return Response(detail_serializer.data, status=status.HTTP_200_OK)


# Export admin views as views (not as_view)
admin_report_list = AdminReportListView.as_view()
# Re-mapped details view for URL usage
admin_report_detail = ReportDetailView.as_view()
admin_report_status_update = AdminReportStatusUpdateView.as_view()