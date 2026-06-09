"""
API views for the Reporting module.
"""
from decimal import Decimal

from django.db.models import Avg, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import DailySalesReport
from .serializers import DailySalesReportSerializer, MonthlySummarySerializer


class DailySalesReportViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoints for daily sales reports.

    Endpoints:
        GET  /reports/daily/                       — list daily reports
        GET  /reports/daily/{id}/                  — single report detail
        GET  /reports/daily/monthly-summary/       — aggregated 1-month view
        POST /reports/daily/generate/              — manually trigger report generation
    """

    serializer_class = DailySalesReportSerializer
    ordering = ["-report_date"]

    def get_queryset(self):
        """
        Optionally filter by date range using query params:
            ?date_from=2026-06-01&date_to=2026-06-30
        """
        queryset = DailySalesReport.objects.all()

        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if date_from:
            queryset = queryset.filter(report_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(report_date__lte=date_to)

        return queryset.order_by("-report_date")

    @action(detail=False, methods=["get"], url_path="monthly-summary")
    def monthly_summary(self, request):
        """
        Return an aggregated summary for a given month.

        Query params:
            ?year=2026&month=6

        Defaults to the current month if not provided.
        """
        now = timezone.localdate()
        try:
            year = int(request.query_params.get("year", now.year))
            month = int(request.query_params.get("month", now.month))
        except (ValueError, TypeError):
            return Response(
                {"error": "year and month must be integers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not (1 <= month <= 12):
            return Response(
                {"error": "month must be between 1 and 12."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        daily_reports = DailySalesReport.objects.filter(
            report_date__year=year,
            report_date__month=month,
        ).order_by("report_date")

        if not daily_reports.exists():
            return Response(
                {
                    "year": year,
                    "month": month,
                    "total_days_with_sales": 0,
                    "total_orders": 0,
                    "total_sales": "0.00",
                    "average_daily_sales": "0.00",
                    "average_order_value": "0.00",
                    "best_day": None,
                    "worst_day": None,
                    "daily_reports": [],
                },
                status=status.HTTP_200_OK,
            )

        aggregates = daily_reports.aggregate(
            days_with_sales=Sum(
                "total_orders",
                output_field=None,
            ),
            month_total_orders=Sum("total_orders"),
            month_total_sales=Sum("total_sales"),
            month_avg_order=Avg("average_order_value"),
        )

        total_days_with_sales = daily_reports.filter(total_orders__gt=0).count()
        total_orders = aggregates["month_total_orders"] or 0
        total_sales = aggregates["month_total_sales"] or Decimal("0.00")
        avg_order_value = aggregates["month_avg_order"] or Decimal("0.00")

        # Average daily sales (only counting days that had sales)
        if total_days_with_sales > 0:
            average_daily_sales = (
                Decimal(str(total_sales)) / total_days_with_sales
            ).quantize(Decimal("0.01"))
        else:
            average_daily_sales = Decimal("0.00")

        avg_order_value = Decimal(str(avg_order_value)).quantize(Decimal("0.01"))

        # Best and worst performing days
        best = daily_reports.filter(total_orders__gt=0).order_by("-total_sales").first()
        worst = daily_reports.filter(total_orders__gt=0).order_by("total_sales").first()

        best_day = None
        if best:
            best_day = {
                "date": str(best.report_date),
                "total_sales": str(best.total_sales),
                "total_orders": best.total_orders,
            }

        worst_day = None
        if worst:
            worst_day = {
                "date": str(worst.report_date),
                "total_sales": str(worst.total_sales),
                "total_orders": worst.total_orders,
            }

        summary_data = {
            "year": year,
            "month": month,
            "total_days_with_sales": total_days_with_sales,
            "total_orders": total_orders,
            "total_sales": str(total_sales),
            "average_daily_sales": str(average_daily_sales),
            "average_order_value": str(avg_order_value),
            "best_day": best_day,
            "worst_day": worst_day,
            "daily_reports": DailySalesReportSerializer(
                daily_reports, many=True
            ).data,
        }

        serializer = MonthlySummarySerializer(data=summary_data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="generate")
    def generate_report(self, request):
        """
        Manually trigger report generation for a specific date.

        Body (optional):
            {"date": "2026-06-08"}

        Defaults to yesterday if no date provided.
        """
        import datetime

        date_str = request.data.get("date")

        if date_str:
            try:
                target_date = datetime.date.fromisoformat(date_str)
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            target_date = None  # generate_report defaults to yesterday

        report, created = DailySalesReport.generate_report(target_date)

        return Response(
            {
                "message": (
                    f"Report {'created' if created else 'updated'} "
                    f"for {report.report_date}."
                ),
                "report": DailySalesReportSerializer(report).data,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
