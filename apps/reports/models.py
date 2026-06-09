"""
Models for the Reporting module.

Entities:
    - DailySalesReport: aggregated daily snapshot of sales metrics
      (total orders, total sales, average order value, etc.).
"""
from decimal import Decimal

from django.db import models
from django.db.models import Avg, Count, Max, Min, Sum
from django.utils import timezone

from utils.models import TimeStampedModel


class DailySalesReport(TimeStampedModel):
    """
    A daily snapshot of sales performance.

    Each row stores pre-computed aggregates for a single calendar date,
    derived from completed orders. Reports are idempotent — regenerating
    for the same date simply overwrites the existing row.
    """

    report_date = models.DateField(
        unique=True,
        db_index=True,
        help_text="The calendar date this report covers.",
    )
    total_orders = models.PositiveIntegerField(
        default=0,
        help_text="Number of completed orders on this date.",
    )
    total_sales = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Sum of all completed order totals (NPR).",
    )
    average_order_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Average order total (total_sales / total_orders).",
    )
    highest_order_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Largest single order total on this date.",
    )
    lowest_order_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Smallest single order total on this date.",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["-report_date"]
        verbose_name = "Daily Sales Report"
        verbose_name_plural = "Daily Sales Reports"

    def __str__(self) -> str:
        return (
            f"{self.report_date} — {self.total_orders} orders, "
            f"Rs.{self.total_sales}"
        )

    @classmethod
    def generate_report(cls, target_date=None):
        """
        Generate (or regenerate) the daily sales report for a given date.

        Queries all completed orders on ``target_date``, aggregates
        their totals, and upserts a DailySalesReport row.

        Args:
            target_date: A ``datetime.date`` object. Defaults to yesterday
                         (in the project timezone).

        Returns:
            Tuple of (DailySalesReport, created: bool).
        """
        from apps.orders.models import Order

        if target_date is None:
            target_date = timezone.localdate() - timezone.timedelta(days=1)

        completed_orders = Order.objects.filter(
            status=Order.Status.COMPLETED,
            created_at__date=target_date,
        )

        aggregates = completed_orders.aggregate(
            order_count=Count("id"),
            sales_sum=Sum("total"),
            sales_avg=Avg("total"),
            sales_max=Max("total"),
            sales_min=Min("total"),
        )

        total_orders = aggregates["order_count"] or 0
        total_sales = aggregates["sales_sum"] or Decimal("0.00")
        average_order_value = aggregates["sales_avg"] or Decimal("0.00")
        highest_order_amount = aggregates["sales_max"] or Decimal("0.00")
        lowest_order_amount = aggregates["sales_min"] or Decimal("0.00")

        # Quantize decimals for consistent storage
        total_sales = Decimal(str(total_sales)).quantize(Decimal("0.01"))
        average_order_value = Decimal(str(average_order_value)).quantize(
            Decimal("0.01")
        )
        highest_order_amount = Decimal(str(highest_order_amount)).quantize(
            Decimal("0.01")
        )
        lowest_order_amount = Decimal(str(lowest_order_amount)).quantize(
            Decimal("0.01")
        )

        report, created = cls.objects.update_or_create(
            report_date=target_date,
            defaults={
                "total_orders": total_orders,
                "total_sales": total_sales,
                "average_order_value": average_order_value,
                "highest_order_amount": highest_order_amount,
                "lowest_order_amount": lowest_order_amount,
            },
        )

        return report, created
