"""
Serializers for the Reporting module.
"""
from rest_framework import serializers

from .models import DailySalesReport


class DailySalesReportSerializer(serializers.ModelSerializer):
    """Full serializer for a single daily sales report."""

    class Meta:
        model = DailySalesReport
        fields = [
            "id",
            "report_date",
            "total_orders",
            "total_sales",
            "average_order_value",
            "highest_order_amount",
            "lowest_order_amount",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class MonthlySummarySerializer(serializers.Serializer):
    """
    Serializer for the aggregated monthly summary view.

    This is not tied to a model — it represents computed output
    from aggregating multiple DailySalesReport rows.
    """

    year = serializers.IntegerField(help_text="Report year.")
    month = serializers.IntegerField(help_text="Report month (1-12).")
    total_days_with_sales = serializers.IntegerField(
        help_text="Number of days that had at least one completed order."
    )
    total_orders = serializers.IntegerField(
        help_text="Total completed orders in the month."
    )
    total_sales = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        help_text="Total sales revenue for the month (NPR).",
    )
    average_daily_sales = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Average daily sales (total_sales / days_with_sales).",
    )
    average_order_value = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Average order value across the month.",
    )
    best_day = serializers.DictField(
        help_text="Day with highest sales: {date, total_sales, total_orders}.",
        allow_null=True,
    )
    worst_day = serializers.DictField(
        help_text="Day with lowest sales: {date, total_sales, total_orders}.",
        allow_null=True,
    )
    daily_reports = DailySalesReportSerializer(
        many=True,
        help_text="All daily reports for this month.",
    )
