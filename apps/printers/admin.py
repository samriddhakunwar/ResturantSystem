"""
Django admin configuration for the Thermal Printer System module.
"""
from django.contrib import admin

from .models import Printer, PrintJob


class PrintJobInline(admin.TabularInline):
    """Inline viewer for recent print jobs within the Printer admin."""

    model = PrintJob
    extra = 0
    readonly_fields = [
        "job_type",
        "order",
        "status",
        "error_message",
        "retry_count",
        "created_at",
    ]
    fields = ["job_type", "order", "status", "error_message", "retry_count", "created_at"]
    ordering = ["-created_at"]
    max_num = 10
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Printer)
class PrinterAdmin(admin.ModelAdmin):
    """Admin view for Printer."""

    list_display = [
        "name",
        "connection_type",
        "role",
        "is_active",
        "paper_width",
        "created_at",
    ]
    list_filter = ["connection_type", "role", "is_active"]
    search_fields = ["name"]
    list_editable = ["is_active"]
    ordering = ["name"]
    inlines = [PrintJobInline]

    fieldsets = (
        (None, {
            "fields": ("name", "connection_type", "role", "paper_width", "is_active"),
        }),
        ("USB Settings", {
            "fields": ("usb_vendor_id", "usb_product_id"),
            "classes": ("collapse",),
            "description": "Only required for USB-connected printers.",
        }),
        ("LAN Settings", {
            "fields": ("ip_address", "port"),
            "classes": ("collapse",),
            "description": "Only required for LAN-connected printers.",
        }),
    )


@admin.register(PrintJob)
class PrintJobAdmin(admin.ModelAdmin):
    """Admin view for PrintJob."""

    list_display = [
        "id",
        "printer",
        "job_type",
        "order",
        "status",
        "retry_count",
        "created_at",
    ]
    list_filter = ["job_type", "status", "printer", "created_at"]
    search_fields = ["order__order_number", "content"]
    list_select_related = ["printer", "order"]
    readonly_fields = [
        "printer",
        "job_type",
        "order",
        "status",
        "content",
        "error_message",
        "retry_count",
        "created_at",
        "updated_at",
    ]
    ordering = ["-created_at"]

    def has_add_permission(self, request):
        """Print jobs are created by the system, not manually."""
        return False
