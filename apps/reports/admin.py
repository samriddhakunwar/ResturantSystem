"""
Django admin configuration for the Reporting module.
"""
from django.contrib import admin

from .models import DailySalesReport


@admin.register(DailySalesReport)
class DailySalesReportAdmin(admin.ModelAdmin):
    """Admin view for DailySalesReport."""

    list_display = [
        "report_date",
        "total_orders",
        "total_sales",
        "average_order_value",
        "highest_order_amount",
        "lowest_order_amount",
    ]
    list_filter = ["report_date"]
    search_fields = ["report_date"]
    readonly_fields = [
        "report_date",
        "total_orders",
        "total_sales",
        "average_order_value",
        "highest_order_amount",
        "lowest_order_amount",
        "created_at",
        "updated_at",
    ]
    ordering = ["-report_date"]
    date_hierarchy = "report_date"
