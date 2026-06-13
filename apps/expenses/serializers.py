"""
Serializers for the Expense Tracking module.
"""
from rest_framework import serializers

from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    """Full serializer for Expense CRUD operations."""

    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )

    class Meta:
        model = Expense
        fields = [
            "id",
            "expense_date",
            "category",
            "category_display",
            "description",
            "amount",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
