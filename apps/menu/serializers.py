"""
Serializers for the Menu Management module.
"""
from rest_framework import serializers

from .models import Category, MenuItem


class CategorySerializer(serializers.ModelSerializer):
    """Full serializer for Category CRUD operations."""

    items_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "display_order",
            "is_active",
            "items_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class MenuItemListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views — omits heavy fields."""

    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "name",
            "price",
            "is_available",
            "category",
            "category_name",
            "display_order",
            "image",
        ]


class MenuItemSerializer(serializers.ModelSerializer):
    """Full serializer for MenuItem CRUD operations."""

    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "category",
            "category_name",
            "name",
            "description",
            "price",
            "image",
            "is_available",
            "display_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_price(self, value):
        """Ensure price is positive."""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
