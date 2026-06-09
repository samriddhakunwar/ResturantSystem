"""
Serializers for the Billing System module.
"""
from decimal import Decimal

from django.db.models import Sum
from rest_framework import serializers

from apps.orders.serializers import OrderListSerializer

from .models import Bill, Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payment records."""

    method_display = serializers.CharField(
        source="get_method_display", read_only=True
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "bill",
            "method",
            "method_display",
            "amount",
            "reference",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class BillListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for bill list views."""

    order_number = serializers.CharField(
        source="order.order_number", read_only=True
    )
    total_paid = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = [
            "id",
            "bill_number",
            "order_number",
            "subtotal",
            "grand_total",
            "is_paid",
            "total_paid",
            "created_at",
        ]

    def get_total_paid(self, obj) -> str:
        """Sum of all payments made against this bill."""
        total = obj.payments.aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0")
        return str(total)


class BillSerializer(serializers.ModelSerializer):
    """Full serializer for Bill CRUD with nested payments (read-only)."""

    order_detail = OrderListSerializer(source="order", read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    total_paid = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = [
            "id",
            "bill_number",
            "order",
            "order_detail",
            "subtotal",
            "tax_percent",
            "tax_amount",
            "discount_percent",
            "discount_amount",
            "service_charge_percent",
            "service_charge_amount",
            "grand_total",
            "notes",
            "is_paid",
            "total_paid",
            "payments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "bill_number",
            "subtotal",
            "tax_amount",
            "discount_amount",
            "service_charge_amount",
            "grand_total",
            "is_paid",
            "created_at",
            "updated_at",
        ]

    def get_total_paid(self, obj) -> str:
        """Sum of all payments made against this bill."""
        total = obj.payments.aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0")
        return str(total)

    def validate_order(self, value):
        """Ensure the order doesn't already have a bill."""
        if self.instance is None and hasattr(value, "bill"):
            raise serializers.ValidationError(
                f"Order {value.order_number} already has a bill."
            )
        return value

    def create(self, validated_data):
        """Create a bill and snapshot the order subtotal."""
        order = validated_data["order"]
        validated_data["subtotal"] = order.subtotal
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Update bill — recalculate totals if percentages changed."""
        # Don't allow changing the order
        validated_data.pop("order", None)

        instance.tax_percent = validated_data.get(
            "tax_percent", instance.tax_percent
        )
        instance.discount_percent = validated_data.get(
            "discount_percent", instance.discount_percent
        )
        instance.service_charge_percent = validated_data.get(
            "service_charge_percent", instance.service_charge_percent
        )
        instance.notes = validated_data.get("notes", instance.notes)
        instance.save()
        return instance
