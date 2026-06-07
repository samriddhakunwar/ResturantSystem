"""
API views for the Order Management module.
"""
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

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
    """

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "table_number"]
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

    @action(detail=True, methods=["patch"], url_path="update-status")
    def update_status(self, request, pk=None):
        """Update only the status of an order with transition validation."""
        order = self.get_object()
        serializer = self.get_serializer(order, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Return full order detail after status update
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
