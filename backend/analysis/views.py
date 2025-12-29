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


class AdminReportListView(APIView):
    """
    ADMIN: List all analysis reports.
    GET /admin/reports/
    """
    permission_classes = [IsAdminWithMFA]

    def get(self, request):
        reports = DetectionRun.objects.select_related(
            "user", "file"
        ).order_by("-created_at")

        paginator = StandardPagination()
        paginated_reports = paginator.paginate_queryset(reports, request)

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