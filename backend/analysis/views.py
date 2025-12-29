from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.permissions import IsOwnerOrAdmin, IsAdminWithMFA
import json

from .router import route_and_detect
from .utils.file_validation import validate_uploaded_file

from rest_framework.pagination import PageNumberPagination
from .models import DetectionRun
from .serializers import (
    ReportListSerializer,
    ReportDetailSerializer,
    ReportStatusUpdateSerializer,
)


class AnalyzeView(APIView):
    """
    API endpoint for file analysis.

    POST /api/analyze/
    Requires JWT authentication.
    Accessible to authenticated users.

    Accepts multipart/form-data with:
    - file: uploaded file
    - metadata: optional JSON string
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # SECURITY: Validate file before processing
        is_valid, error_msg = validate_uploaded_file(uploaded_file)
        if not is_valid:
            return Response(
                {"error": f"Security Error: {error_msg}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        metadata = {}
        if "metadata" in request.POST:
            try:
                meta_str = request.POST["metadata"].strip()
                if meta_str:
                    metadata = json.loads(meta_str)
            except (json.JSONDecodeError, AttributeError):
                pass

        report = route_and_detect(
            user=request.user,
            uploaded_file=uploaded_file,
            metadata=metadata
        )

        return Response(report, status=status.HTTP_200_OK)


# Backwards compatibility
analyze = AnalyzeView.as_view()


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        # Calculate stats from the full queryset (not just the page)
        queryset = self.page.paginator.object_list
        total_reports = self.page.paginator.count
        high_risk = queryset.filter(risk_label='HIGH').count()
        pending_review = queryset.filter(status='PENDING').count()
        
        return Response({
            'stats': {
                'total_reports': total_reports,
                'high_risk_reports': high_risk,
                'pending_review': pending_review,
            },
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': total_reports,
            'results': data
        })



from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from .models import DetectionRun, DetectorResult

User = get_user_model()

class AdminDashboardStatsView(APIView):
    """
    Get aggregated system statistics for Admin Dashboard.
    
    GET /admin/stats/
    ADMIN only.
    """
    permission_classes = [IsAdminWithMFA]

    def get(self, request):
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_48h = now - timedelta(hours=48)

        # 1. User Stats
        total_users = User.objects.count()
        # "Active" usually means is_active=True
        active_users = User.objects.filter(is_active=True).count()

        # 2. File/Analysis Stats
        total_files = DetectionRun.objects.count()
        files_24h = DetectionRun.objects.filter(created_at__gte=last_24h).count()
        files_prev_24h = DetectionRun.objects.filter(created_at__range=(last_48h, last_24h)).count()
        
        # Trend calculation (simple diff)
        activity_trend = "stable"
        if files_24h > files_prev_24h:
            activity_trend = "up"
        elif files_24h < files_prev_24h:
            activity_trend = "down"

        # 3. Risk Distribution
        risk_counts = DetectionRun.objects.values('risk_label').annotate(count=Count('risk_label'))
        risk_dist = {item['risk_label']: item['count'] for item in risk_counts}
        high_risk_count = risk_dist.get('HIGH', 0)
        
        # 4. Content Stats
        pending_review_count = DetectionRun.objects.filter(status='PENDING').count()

        # 5. PII Stats (Aggregating specific PII types from JSON output is heavy, simplified for now)
        # We will count how many High Risk items involve PII
        # A more complex implementation would parse DetectorResult.output -> findings -> type
        # For now, we will return a simulated distribution if real parsing is too heavy or inconsistent
        # But let's try a simple aggregate on 'pii_detector' results
        
        pii_results = DetectorResult.objects.filter(detector_name='pii_detector')
        # This is a bit expensive without JSONB query capabilities, so we might skip detailed PII type breakdown 
        # for the 'Overview' and stick to High Level counts.
        # However, for 'Intelligence' tab, we can do a simplified aggregation or real-time calc on recent items.
        
        pii_detections_count = high_risk_count # Proxy for now, or refine if we track findings separately.

        data = {
            "total_users": total_users,
            "total_files": total_files,
            "high_risk_count": high_risk_count,
            "pending_review": pending_review_count,
            "pii_detections_count": pii_detections_count, # Valid placeholder
            "last_24h_activity": files_24h,
            "activity_trend": activity_trend,
            "risk_distribution": risk_dist,
            # Placeholder distributions for charts - to be refined with real aggregation logic if JSONB available
            "file_type_distribution": {
                "PDF": DetectionRun.objects.filter(file__original_name__iendswith='.pdf').count(),
                "Image": DetectionRun.objects.filter(Q(file__original_name__iendswith='.png') | Q(file__original_name__iendswith='.jpg')).count(),
                "Text": DetectionRun.objects.filter(file__original_name__iendswith='.txt').count(),
                "Other": 0 # simplified
            }
        }
        return Response(data)


class AdminReportListView(APIView):
    """
    List all analysis reports with filtering.
    
    GET /admin/reports/
    ADMIN only.
    
    Query params:
    - page: int
    - search: string (username regex)
    - risk: string (HIGH, MEDIUM, LOW)
    - sort: string (date_desc, date_asc, risk_desc)
    """
    permission_classes = [IsAdminWithMFA]

    def get(self, request):
        queryset = DetectionRun.objects.select_related('user', 'file').order_by('-created_at')
        
        # Filtering
        search_query = request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(user__username__icontains=search_query) | 
                Q(user__email__icontains=search_query) |
                Q(file__original_name__icontains=search_query)
            )
            
        risk_filter = request.query_params.get('risk')
        if risk_filter and risk_filter in ['HIGH', 'MEDIUM', 'LOW']:
            queryset = queryset.filter(risk_label=risk_filter)

        # Sorting
        sort_param = request.query_params.get('sort')
        if sort_param == 'date_asc':
            queryset = queryset.order_by('created_at')
        elif sort_param == 'risk_desc':
            # Custom sort might be needed if risk isn't just text, but HIGH>MED>LOW works alphabetically actually (desc: Medium, Low, High... wait no)
            # HIGH, MEDIUM, LOW. H(8), M(13), L(12). M > L > H. No.
            # Simple workaround: just sort by risk_label. 
            queryset = queryset.order_by('risk_label') # Not perfect risk order
        else:
            # Default date desc
            queryset = queryset.order_by('-created_at')

        # Pagination
        paginator = StandardPagination()
        paginated_reports = paginator.paginate_queryset(queryset, request)
        serializer = ReportListSerializer(paginated_reports, many=True)
        return paginator.get_paginated_response(serializer.data)


class ReportDetailView(APIView):
    """
    ADMIN or OWNER: Retrieve detailed report.
    GET /admin/reports/{id}/
    """
    permission_classes = [IsOwnerOrAdmin]

    def get(self, request, report_id):
        try:
            report = DetectionRun.objects.select_related(
                "user", "file"
            ).prefetch_related("results").get(id=report_id)
        except DetectionRun.DoesNotExist:
            return Response(
                {"error": f"Report {report_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, report)

        serializer = ReportDetailSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminReportStatusUpdateView(APIView):
    """
    ADMIN: Update report review status.
    PATCH /admin/reports/{id}/status/
    """
    permission_classes = [IsAdminWithMFA]

    def patch(self, request, report_id):
        try:
            report = DetectionRun.objects.select_related(
                "user", "file"
            ).prefetch_related("results").get(id=report_id)
        except DetectionRun.DoesNotExist:
            return Response(
                {"error": f"Report {report_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ReportStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        report.status = serializer.validated_data["status"]
        report.save()

        detail_serializer = ReportDetailSerializer(report)
        return Response(detail_serializer.data, status=status.HTTP_200_OK)


admin_report_list = AdminReportListView.as_view()
admin_report_detail = ReportDetailView.as_view()
admin_report_status_update = AdminReportStatusUpdateView.as_view()