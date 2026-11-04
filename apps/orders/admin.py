"""
Django admin configuration for the Order Management module.
"""
from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    """Inline editor for order items within the Order admin."""

    model = OrderItem
    extra = 1
    readonly_fields = ["unit_price", "item_total"]
    autocomplete_fields = ["menu_item"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin view for Order."""

    list_display = [
        "order_number",
        "status",
        "source",
        "table_number",
        "total",
        "confirmed_at",
        "created_at",
    ]
    list_filter = ["status", "source", "created_at"]
    search_fields = ["order_number"]
    readonly_fields = [
        "order_number",
        "public_id",
        "subtotal",
        "total",
        "confirmed_at",
        "created_at",
        "updated_at",
    ]
    ordering = ["-created_at"]
    inlines = [OrderItemInline]
