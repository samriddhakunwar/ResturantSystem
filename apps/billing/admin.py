"""
Django admin configuration for the Billing System module.
"""
from django.contrib import admin

from .models import Bill, Payment


class PaymentInline(admin.TabularInline):
    """Inline editor for payments within the Bill admin."""

    model = Payment
    extra = 0
    readonly_fields = ["created_at"]


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    """Admin view for Bill."""

    list_display = [
        "bill_number",
        "order",
        "subtotal",
        "discount_amount",
        "service_charge_amount",
        "tax_amount",
        "grand_total",
        "is_paid",
        "created_at",
    ]
    list_filter = ["is_paid", "created_at"]
    search_fields = ["bill_number", "order__order_number"]
    readonly_fields = [
        "bill_number",
        "subtotal",
        "tax_amount",
        "discount_amount",
        "service_charge_amount",
        "grand_total",
        "created_at",
        "updated_at",
    ]
    ordering = ["-created_at"]
    inlines = [PaymentInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin view for Payment."""

    list_display = [
        "bill",
        "method",
        "amount",
        "reference",
        "created_at",
    ]
    list_filter = ["method", "created_at"]
    search_fields = ["bill__bill_number", "reference"]
    ordering = ["-created_at"]
