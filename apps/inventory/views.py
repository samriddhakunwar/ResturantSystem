"""
API views for the Inventory Management module.
"""
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import InventoryExpense, InventoryItem, StockMovement
from .serializers import (
    InventoryExpenseSerializer,
    InventoryItemListSerializer,
    InventoryItemSerializer,
    StockMovementSerializer,
)


class InventoryItemViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for inventory items.

    Endpoints:
        GET    /inventory/items/                  — list all items
        POST   /inventory/items/                  — create an item
        GET    /inventory/items/{id}/             — retrieve an item
        PUT    /inventory/items/{id}/             — update an item
        PATCH  /inventory/items/{id}/             — partial update
        DELETE /inventory/items/{id}/             — delete an item
        GET    /inventory/items/low-stock/        — list low-stock items
    """

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_active", "unit"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "quantity", "unit_cost", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        return InventoryItem.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return InventoryItemListSerializer
        return InventoryItemSerializer

    @action(detail=False, methods=["get"], url_path="low-stock")
    def low_stock(self, request):
        """List all items at or below their low stock threshold."""
        from django.db.models import F

        queryset = self.get_queryset().filter(
            quantity__lte=F("low_stock_threshold"),
            is_active=True,
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = InventoryItemListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = InventoryItemListSerializer(queryset, many=True)
        return Response(serializer.data)


class StockMovementViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for stock movements.

    Endpoints:
        GET    /inventory/movements/              — list all movements
        POST   /inventory/movements/              — create a movement
        GET    /inventory/movements/{id}/         — retrieve a movement
        DELETE /inventory/movements/{id}/         — delete a movement
    """

    serializer_class = StockMovementSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["inventory_item", "movement_type"]
    search_fields = ["inventory_item__name", "notes"]
    ordering_fields = ["created_at", "quantity", "total_cost"]
    ordering = ["-created_at"]
    # Movements shouldn't be edited — only created or deleted
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        return StockMovement.objects.select_related("inventory_item")


class InventoryExpenseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only listing of inventory expenses.

    Endpoints:
        GET    /inventory/expenses/               — list all expenses
        GET    /inventory/expenses/{id}/          — retrieve an expense
    """

    serializer_class = InventoryExpenseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["expense_type"]
    search_fields = ["stock_movement__inventory_item__name", "notes"]
    ordering_fields = ["created_at", "total_cost"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return InventoryExpense.objects.select_related(
            "stock_movement__inventory_item"
        )
