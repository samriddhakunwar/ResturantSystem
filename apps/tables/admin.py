"""
Django admin configuration for the Tables & QR module.
"""
from django.contrib import admin

from .models import ServiceRequest, Table


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    """Admin view for Table."""

    list_display = ["number", "label", "seats", "is_active", "qr_token"]
    list_filter = ["is_active"]
    readonly_fields = ["qr_token", "created_at", "updated_at"]
    ordering = ["number"]


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    """Admin view for ServiceRequest."""

    list_display = ["table", "type", "status", "created_at", "resolved_at"]
    list_filter = ["status", "type"]
    list_select_related = ["table"]
