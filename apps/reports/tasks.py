"""
Celery tasks for the Reporting module.

Provides automated nightly generation of daily sales reports.
"""
import datetime
import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    name="reports.generate_daily_sales_report",
    max_retries=3,
    default_retry_delay=60,
)
def generate_daily_sales_report(self, date_str=None):
    """
    Generate a DailySalesReport for a given date.

    Args:
        date_str: Optional ISO date string (YYYY-MM-DD).
                  Defaults to yesterday in the project timezone.

    This task is designed to be scheduled nightly via Celery Beat.
    It is idempotent — running it multiple times for the same date
    simply overwrites the existing report.
    """
    from apps.reports.models import DailySalesReport

    target_date = None
    if date_str:
        try:
            target_date = datetime.date.fromisoformat(date_str)
        except ValueError:
            logger.error("Invalid date format: %s. Expected YYYY-MM-DD.", date_str)
            return {"error": f"Invalid date format: {date_str}"}

    try:
        report, created = DailySalesReport.generate_report(target_date)
        action = "Created" if created else "Updated"
        logger.info(
            "%s daily sales report for %s: %d orders, Rs.%s total sales.",
            action,
            report.report_date,
            report.total_orders,
            report.total_sales,
        )
        return {
            "status": "success",
            "action": action.lower(),
            "report_date": str(report.report_date),
            "total_orders": report.total_orders,
            "total_sales": str(report.total_sales),
        }
    except Exception as exc:
        logger.exception(
            "Failed to generate daily sales report for %s.",
            date_str or "yesterday",
        )
        raise self.retry(exc=exc)
