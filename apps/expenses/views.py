"""
API views for the Expense Tracking module.
"""
from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Expense
from .serializers import ExpenseSerializer

MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for expenses.

    Endpoints:
        GET    /expenses/                      — list expenses
        POST   /expenses/                      — record an expense
        GET    /expenses/{id}/                 — retrieve an expense
        PUT    /expenses/{id}/                 — update an expense
        PATCH  /expenses/{id}/                 — partial update
        DELETE /expenses/{id}/                 — delete an expense
        GET    /expenses/monthly-breakdown/    — 12-month breakdown by category
    """

    serializer_class = ExpenseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "expense_date"]
    search_fields = ["description"]
    ordering_fields = ["expense_date", "amount", "created_at"]
    ordering = ["-expense_date"]

    def get_queryset(self):
        """Optionally filter by date range: ?date_from=…&date_to=…"""
        queryset = Expense.objects.all()
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if date_from:
            queryset = queryset.filter(expense_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(expense_date__lte=date_to)
        return queryset

    @action(detail=False, methods=["get"], url_path="monthly-breakdown")
    def monthly_breakdown(self, request):
        """
        Aggregate a year's expenses into a 12-month, per-category series for the
        dashboard chart.

        Query params:
            ?year=2026   (defaults to current year)

        Returns a list of 12 objects:
            [{ "month": "Jan", "ingredients": 0, "labor": 0, "utilities": 0,
               "rent": 0, "other": 0, "total": 0 }, …]
        """
        try:
            year = int(request.query_params.get("year", timezone.localdate().year))
        except (ValueError, TypeError):
            return Response(
                {"error": "year must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        categories = [c.value for c in Expense.Category]
        buckets = [
            {"month": label, **{cat: 0.0 for cat in categories}, "total": 0.0}
            for label in MONTH_LABELS
        ]

        rows = (
            Expense.objects.filter(expense_date__year=year)
            .values("expense_date__month", "category")
            .annotate(total=Sum("amount"))
        )
        for row in rows:
            idx = row["expense_date__month"] - 1
            if 0 <= idx < 12:
                amount = float((row["total"] or Decimal("0")).quantize(Decimal("0.01")))
                buckets[idx][row["category"]] = amount
                buckets[idx]["total"] += amount

        return Response(buckets, status=status.HTTP_200_OK)
