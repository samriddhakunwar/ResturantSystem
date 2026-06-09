"""
Django admin configuration for the Inventory Management module.
"""
from django.contrib import admin

from .models import InventoryExpense, InventoryItem, StockMovement


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    """Admin view for InventoryItem."""

    list_display = [
        "name",
        "unit",
        "quantity",
        "low_stock_threshold",
        "unit_cost",
        "is_active",
        "created_at",
    ]
    list_filter = ["is_active", "unit", "created_at"]
    search_fields = ["name", "description"]
    readonly_fields = ["quantity", "created_at", "updated_at"]
    ordering = ["name"]


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    """Admin view for StockMovement."""

    list_display = [
        "inventory_item",
        "movement_type",
        "quantity",
        "unit_cost",
        "total_cost",
        "created_at",
    ]
    list_filter = ["movement_type", "created_at"]
    search_fields = ["inventory_item__name", "notes"]
    readonly_fields = ["total_cost", "created_at", "updated_at"]
    ordering = ["-created_at"]
    autocomplete_fields = ["inventory_item"]


@admin.register(InventoryExpense)
class InventoryExpenseAdmin(admin.ModelAdmin):
    """Admin view for InventoryExpense."""

    list_display = [
        "stock_movement",
        "expense_type",
        "quantity",
        "unit_cost",
        "total_cost",
        "created_at",
    ]
    list_filter = ["expense_type", "created_at"]
    search_fields = ["stock_movement__inventory_item__name", "notes"]
    readonly_fields = [
        "stock_movement",
        "expense_type",
        "quantity",
        "unit_cost",
        "total_cost",
        "created_at",
        "updated_at",
    ]
    ordering = ["-created_at"]
