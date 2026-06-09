"""
Management command to generate daily sales reports.

Usage:
    python manage.py generate_daily_report                              # yesterday
    python manage.py generate_daily_report --date 2026-06-01            # specific date
    python manage.py generate_daily_report --range 2026-06-01 2026-06-08  # date range
"""
import datetime

from django.core.management.base import BaseCommand, CommandError

from apps.reports.models import DailySalesReport


class Command(BaseCommand):
    help = "Generate daily sales report(s) from completed orders."

    def add_arguments(self, parser):
        parser.add_argument(
            "--date",
            type=str,
            help="Generate report for a specific date (YYYY-MM-DD).",
        )
        parser.add_argument(
            "--range",
            nargs=2,
            type=str,
            metavar=("START", "END"),
            help="Generate reports for a date range (YYYY-MM-DD YYYY-MM-DD).",
        )

    def handle(self, *args, **options):
        date_str = options.get("date")
        date_range = options.get("range")

        if date_str and date_range:
            raise CommandError("Cannot use --date and --range together.")

        if date_range:
            self._generate_range(date_range[0], date_range[1])
        elif date_str:
            self._generate_single(date_str)
        else:
            # Default: yesterday
            self._generate_single(None)

    def _parse_date(self, date_str):
        """Parse a date string in YYYY-MM-DD format."""
        try:
            return datetime.date.fromisoformat(date_str)
        except ValueError:
            raise CommandError(
                f"Invalid date format: '{date_str}'. Use YYYY-MM-DD."
            )

    def _generate_single(self, date_str):
        """Generate report for a single date."""
        target_date = self._parse_date(date_str) if date_str else None

        report, created = DailySalesReport.generate_report(target_date)
        action = "Created" if created else "Updated"

        self.stdout.write(
            self.style.SUCCESS(
                f"{action} report for {report.report_date}: "
                f"{report.total_orders} orders, "
                f"Rs.{report.total_sales} total sales, "
                f"Rs.{report.average_order_value} avg order."
            )
        )

    def _generate_range(self, start_str, end_str):
        """Generate reports for each date in a range (inclusive)."""
        start_date = self._parse_date(start_str)
        end_date = self._parse_date(end_str)

        if start_date > end_date:
            raise CommandError(
                f"Start date ({start_date}) must be before or equal to "
                f"end date ({end_date})."
            )

        current = start_date
        created_count = 0
        updated_count = 0

        while current <= end_date:
            report, created = DailySalesReport.generate_report(current)
            if created:
                created_count += 1
            else:
                updated_count += 1

            self.stdout.write(
                f"  {'Created' if created else 'Updated'} {report.report_date}: "
                f"{report.total_orders} orders, Rs.{report.total_sales}"
            )
            current += datetime.timedelta(days=1)

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! {created_count} created, {updated_count} updated."
            )
        )
