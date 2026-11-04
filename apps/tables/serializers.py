"""
Serializers for the Tables & QR module.
"""
from rest_framework import serializers

from .models import ServiceRequest, Table


class TableSerializer(serializers.ModelSerializer):
    """Staff CRUD for tables. The QR token is read-only (use regenerate-token)."""

    display_label = serializers.CharField(read_only=True)

    class Meta:
        model = Table
        fields = [
            "id",
            "number",
            "label",
            "display_label",
            "seats",
            "qr_token",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "qr_token", "created_at", "updated_at"]


class ServiceRequestSerializer(serializers.ModelSerializer):
    """Staff view of a guest's service request."""

    table_label = serializers.CharField(source="table.display_label", read_only=True)
    type_display = serializers.CharField(source="get_type_display", read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "table",
            "table_label",
            "type",
            "type_display",
            "status",
            "resolved_at",
            "created_at",
        ]
        read_only_fields = fields
