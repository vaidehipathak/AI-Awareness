from rest_framework import serializers
from .models import AnalysisFile, DetectionRun, DetectorResult


class AnalysisFileSerializer(serializers.ModelSerializer):
    """Serializer for AnalysisFile metadata."""
    
    class Meta:
        model = AnalysisFile
        fields = ('id', 'original_name', 'content_type', 'size_bytes', 'created_at')
        read_only_fields = fields


class DetectorResultSerializer(serializers.ModelSerializer):
    """Serializer for individual detector results."""
    
    class Meta:
        model = DetectorResult
        fields = ('id', 'detector_name', 'output', 'created_at')
        read_only_fields = fields


class ReportListSerializer(serializers.ModelSerializer):
    """Serializer for listing all reports in admin panel."""
    
    report_id = serializers.SerializerMethodField()
    submitted_at = serializers.DateTimeField(source='created_at', read_only=True)
    submitted_by = serializers.SerializerMethodField()
    file_type = serializers.SerializerMethodField()
    overall_risk = serializers.CharField(source='risk_label', read_only=True)
    
    class Meta:
        model = DetectionRun
        fields = ('report_id', 'submitted_at', 'submitted_by', 'file_type', 'overall_risk', 'status')
        read_only_fields = fields
    
    def get_report_id(self, obj):
        """Return the DetectionRun ID as report_id."""
        return obj.id
    
    def get_submitted_by(self, obj):
        """Return email of submitting user."""
        return obj.user.email if obj.user else 'Anonymous'
    
    def get_file_type(self, obj):
        """Return file type from related AnalysisFile."""
        # File type isn't stored, but we can infer from detectors executed or original filename
        filename = obj.file.original_name.lower()
        if filename.endswith('.pdf'):
            return 'PDF'
        elif any(filename.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
            return 'Image'
        else:
            return 'Text'


class ReportDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed report view including all detection results."""
    
    report_id = serializers.SerializerMethodField()
    submitted_at = serializers.DateTimeField(source='created_at', read_only=True)
    submitted_by = serializers.SerializerMethodField()
    file_metadata = serializers.SerializerMethodField()
    detector_results = serializers.SerializerMethodField()
    overall_risk = serializers.CharField(source='risk_label', read_only=True)
    
    class Meta:
        model = DetectionRun
        fields = (
            'report_id',
            'submitted_at',
            'submitted_by',
            'file_metadata',
            'detector_results',
            'overall_risk',
            'detectors_executed',
            'status'
        )
        read_only_fields = fields
    
    def get_report_id(self, obj):
        """Return the DetectionRun ID as report_id."""
        return obj.id
    
    def get_submitted_by(self, obj):
        """Return email of submitting user."""
        return obj.user.email if obj.user else 'Anonymous'
    
    def get_file_metadata(self, obj):
        """Return full file metadata."""
        file_obj = obj.file
        return {
            'file_id': file_obj.id,
            'original_name': file_obj.original_name,
            'content_type': file_obj.content_type,
            'size_bytes': file_obj.size_bytes,
            'created_at': file_obj.created_at,
        }
    
    def get_detector_results(self, obj):
        """Return all detector results with confidence scores and explanations."""
        results = obj.results.all()
        return [
            {
                'detector_name': result.detector_name,
                'confidence_score': result.output.get('confidence_score', 0.0),
                'flags': result.output.get('flags', []),
                'short_explanation': result.output.get('short_explanation', ''),
                'full_output': result.output,
            }
            for result in results
        ]


class ReportStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating report status."""
    
    status = serializers.ChoiceField(
        choices=['PENDING', 'REVIEWED', 'FLAGGED'],
        help_text='Status must be PENDING, REVIEWED, or FLAGGED'
    )
    
    class Meta:
        model = DetectionRun
        fields = ('status',)
    
    def validate_status(self, value):
        """Validate status is one of the allowed choices."""
        allowed_statuses = ['PENDING', 'REVIEWED', 'FLAGGED']
        if value not in allowed_statuses:
            raise serializers.ValidationError(
                f"Status must be one of {allowed_statuses}"
            )
        return value
