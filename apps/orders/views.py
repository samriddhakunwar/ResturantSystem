"""
API views for the Order Management module.
"""
from django.conf import settings
from django.db import models
from django.db.models import Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.printers.tasks import queue_kitchen_ticket

from .models import Order
from .serializers import (
    OrderListSerializer,
    OrderSerializer,
    OrderStatusSerializer,
)


class OrderViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for orders.

    Endpoints:
        GET    /orders/                       — list all orders
        POST   /orders/                       — create an order (with items)
        GET    /orders/{id}/                  — retrieve an order
        PUT    /orders/{id}/                  — update an order
        PATCH  /orders/{id}/                  — partial update
        DELETE /orders/{id}/                  — delete an order
        PATCH  /orders/{id}/update-status/    — update order status only
        POST   /orders/{id}/confirm/          — accept a QR order and print its ticket
        GET    /orders/kitchen/               — active orders with items for the kitchen board

    Useful filters: ``?status__in=pending,preparing,ready``, ``?source=qr``,
    ``?confirmed_at__isnull=true``, ``?created_at__date=2026-11-04``.
    """

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        "status": ["exact", "in"],
        "table_number": ["exact"],
        "table": ["exact"],
        "source": ["exact"],
        "confirmed_at": ["isnull"],
        "created_at": ["date", "date__gte", "date__lte"],
    }
    search_fields = ["order_number"]
    ordering_fields = ["created_at", "total", "order_number"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Order.objects.prefetch_related("items__menu_item")
        if self.action == "list":
            queryset = queryset.annotate(items_count=Count("items"))
        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return OrderListSerializer
        if self.action == "update_status":
            return OrderStatusSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        """Staff-entered orders are confirmed on the spot."""
        order = serializer.save(source=Order.Source.POS, confirmed_at=timezone.now())
        if settings.KITCHEN_AUTO_PRINT_POS:
            queue_kitchen_ticket(order.pk)

    @action(detail=False, methods=["get"])
    def kitchen(self, request):
        """
        The kitchen board: every pending, preparing and ready order, plus
        those served today, with their items (one query, no pagination).
        """
        active = [Order.Status.PENDING, Order.Status.PREPARING, Order.Status.READY]
        today = timezone.localdate()
        queryset = (
            Order.objects.prefetch_related("items__menu_item")
            .filter(
                models.Q(status__in=active)
                | models.Q(status=Order.Status.SERVED, updated_at__date=today)
            )
            .order_by("created_at")
        )
        return Response(OrderSerializer(queryset, many=True).data)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        """Accept a guest's QR order and send its ticket to the kitchen printer."""
        order = self.get_object()
        if order.confirmed_at is not None:
            return Response(
                {"detail": "Order is already confirmed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if order.status == Order.Status.CANCELLED:
            return Response(
                {"detail": "Cancelled orders can't be confirmed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.confirmed_at = timezone.now()
        order.save(update_fields=["confirmed_at", "updated_at"])
        queue_kitchen_ticket(order.pk)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="update-status")
    def update_status(self, request, pk=None):
        """Update only the status of an order with transition validation."""
        order = self.get_object()
        serializer = self.get_serializer(order, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Return full order detail after status update
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
