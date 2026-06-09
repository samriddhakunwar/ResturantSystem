"""
API views for the Thermal Printer System module.
"""
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.orders.models import Order

from .models import Printer, PrintJob
from .serializers import (
    PrinterListSerializer,
    PrinterSerializer,
    PrintJobListSerializer,
    PrintJobSerializer,
    PrintKitchenTicketSerializer,
    PrintTestPageSerializer,
)
from .services import print_customer_bill, print_kitchen_ticket, print_test_page


class PrinterViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for printer configurations.

    Endpoints:
        GET    /printers/                          — list all printers
        POST   /printers/                          — register a printer
        GET    /printers/{id}/                     — retrieve a printer
        PUT    /printers/{id}/                     — update a printer
        PATCH  /printers/{id}/                     — partial update
        DELETE /printers/{id}/                     — delete a printer
        POST   /printers/{id}/test-print/          — print a test page
        POST   /printers/{id}/print-kitchen-ticket/ — print kitchen ticket
        POST   /printers/{id}/print-bill/          — print customer bill
    """

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["connection_type", "role", "is_active"]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        return Printer.objects.annotate(jobs_count=Count("jobs"))

    def get_serializer_class(self):
        if self.action == "list":
            return PrinterListSerializer
        if self.action == "test_print":
            return PrintTestPageSerializer
        if self.action in ("print_kitchen_ticket_action", "print_bill"):
            return PrintKitchenTicketSerializer
        return PrinterSerializer

    @action(detail=True, methods=["post"], url_path="test-print")
    def test_print(self, request, pk=None):
        """Send a test page to this printer to verify connectivity."""
        printer = self.get_object()
        if not printer.is_active:
            return Response(
                {"detail": "Printer is not active."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        job = print_test_page(printer)
        return Response(
            PrintJobSerializer(job).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="print-kitchen-ticket")
    def print_kitchen_ticket_action(self, request, pk=None):
        """Print a kitchen ticket for a given order on this printer."""
        printer = self.get_object()
        serializer = PrintKitchenTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.get(pk=serializer.validated_data["order_id"])
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        job = print_kitchen_ticket(order, printer=printer)
        if job is None:
            return Response(
                {"detail": "Print job could not be created."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response(
            PrintJobSerializer(job).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="print-bill")
    def print_bill(self, request, pk=None):
        """Print a customer bill for a given order on this printer."""
        printer = self.get_object()
        serializer = PrintKitchenTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.get(pk=serializer.validated_data["order_id"])
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        job = print_customer_bill(order, printer=printer)
        if job is None:
            return Response(
                {"detail": "Print job could not be created."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response(
            PrintJobSerializer(job).data,
            status=status.HTTP_201_CREATED,
        )


class PrintJobViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only views for print job history.

    Endpoints:
        GET    /print-jobs/         — list all print jobs
        GET    /print-jobs/{id}/    — retrieve a print job
    """

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["printer", "job_type", "status"]
    search_fields = ["content", "order__order_number"]
    ordering_fields = ["created_at", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return PrintJob.objects.select_related("printer", "order")

    def get_serializer_class(self):
        if self.action == "list":
            return PrintJobListSerializer
        return PrintJobSerializer
