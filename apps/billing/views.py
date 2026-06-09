"""
API views for the Billing System module.
"""
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Bill, Payment
from .serializers import (
    BillListSerializer,
    BillSerializer,
    PaymentSerializer,
)


class BillViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for bills.

    Endpoints:
        GET    /billing/bills/                    — list all bills
        POST   /billing/bills/                    — create a bill from an order
        GET    /billing/bills/{id}/               — retrieve a bill
        PUT    /billing/bills/{id}/               — update a bill
        PATCH  /billing/bills/{id}/               — partial update
        DELETE /billing/bills/{id}/               — delete a bill
        PATCH  /billing/bills/{id}/mark-paid/     — mark bill as paid
    """

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_paid"]
    search_fields = ["bill_number", "order__order_number"]
    ordering_fields = ["created_at", "grand_total", "bill_number"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Bill.objects.select_related("order")
            .prefetch_related("payments")
        )

    def get_serializer_class(self):
        if self.action == "list":
            return BillListSerializer
        return BillSerializer

    @action(detail=True, methods=["patch"], url_path="mark-paid")
    def mark_paid(self, request, pk=None):
        """Manually mark a bill as fully paid."""
        bill = self.get_object()
        bill.is_paid = True
        bill.save(update_fields=["is_paid", "updated_at"])
        return Response(
            BillSerializer(bill).data,
            status=status.HTTP_200_OK,
        )


class PaymentViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for payments.

    Endpoints:
        GET    /billing/payments/                 — list all payments
        POST   /billing/payments/                 — record a payment
        GET    /billing/payments/{id}/            — retrieve a payment
        PUT    /billing/payments/{id}/            — update a payment
        DELETE /billing/payments/{id}/            — delete a payment
    """

    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["bill", "method"]
    search_fields = ["bill__bill_number", "reference"]
    ordering_fields = ["created_at", "amount"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Payment.objects.select_related("bill")
