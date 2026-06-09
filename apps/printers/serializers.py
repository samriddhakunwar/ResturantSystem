"""
Serializers for the Thermal Printer System module.
"""
from rest_framework import serializers

from .models import Printer, PrintJob


class PrinterListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for printer list views."""

    jobs_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Printer
        fields = [
            "id",
            "name",
            "connection_type",
            "role",
            "is_active",
            "jobs_count",
            "created_at",
        ]


class PrinterSerializer(serializers.ModelSerializer):
    """Full serializer for Printer CRUD operations."""

    jobs_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Printer
        fields = [
            "id",
            "name",
            "connection_type",
            "usb_vendor_id",
            "usb_product_id",
            "ip_address",
            "port",
            "role",
            "paper_width",
            "is_active",
            "jobs_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data):
        """Ensure required connection fields are provided based on type."""
        conn_type = data.get(
            "connection_type",
            self.instance.connection_type if self.instance else None,
        )

        if conn_type == Printer.ConnectionType.USB:
            if not data.get(
                "usb_vendor_id",
                getattr(self.instance, "usb_vendor_id", None),
            ):
                raise serializers.ValidationError(
                    {"usb_vendor_id": "Required for USB printers."}
                )
            if not data.get(
                "usb_product_id",
                getattr(self.instance, "usb_product_id", None),
            ):
                raise serializers.ValidationError(
                    {"usb_product_id": "Required for USB printers."}
                )

        if conn_type == Printer.ConnectionType.LAN:
            if not data.get(
                "ip_address",
                getattr(self.instance, "ip_address", None),
            ):
                raise serializers.ValidationError(
                    {"ip_address": "Required for LAN printers."}
                )

        return data


class PrintJobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for print job list views."""

    printer_name = serializers.CharField(source="printer.name", read_only=True)
    order_number = serializers.CharField(
        source="order.order_number", read_only=True, default=None
    )

    class Meta:
        model = PrintJob
        fields = [
            "id",
            "printer",
            "printer_name",
            "job_type",
            "order",
            "order_number",
            "status",
            "retry_count",
            "created_at",
        ]


class PrintJobSerializer(serializers.ModelSerializer):
    """Full serializer for PrintJob detail views."""

    printer_name = serializers.CharField(source="printer.name", read_only=True)
    order_number = serializers.CharField(
        source="order.order_number", read_only=True, default=None
    )

    class Meta:
        model = PrintJob
        fields = [
            "id",
            "printer",
            "printer_name",
            "job_type",
            "order",
            "order_number",
            "status",
            "content",
            "error_message",
            "retry_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "content",
            "error_message",
            "retry_count",
            "created_at",
            "updated_at",
        ]


class PrintKitchenTicketSerializer(serializers.Serializer):
    """Serializer for the print-kitchen-ticket action."""

    order_id = serializers.IntegerField(
        help_text="ID of the order to print a kitchen ticket for."
    )


class PrintTestPageSerializer(serializers.Serializer):
    """Serializer for the test-print action — no fields needed."""

    pass
