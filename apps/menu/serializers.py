"""
Serializers for the Menu Management module.
"""
from rest_framework import serializers

from .models import DIETARY_TAGS, Category, MenuItem


def validate_dietary_tags(value):
    """Only the known dietary tags, no duplicates."""
    if not isinstance(value, list) or any(tag not in DIETARY_TAGS for tag in value):
        raise serializers.ValidationError(f"Allowed tags: {', '.join(DIETARY_TAGS)}.")
    return list(dict.fromkeys(value))


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
            "dietary_tags",
            "is_featured",
            "recommended_by",
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
            "dietary_tags",
            "is_featured",
            "recommended_by",
            "recommended_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    recommended_by_name = serializers.CharField(
        source="recommended_by.name", read_only=True, default=None
    )

    def validate_dietary_tags(self, value):
        return validate_dietary_tags(value)

    def validate_price(self, value):
        """Ensure price is positive."""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
