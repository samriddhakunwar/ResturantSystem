"""
Serializers for the Inventory Management module.
"""
from rest_framework import serializers

from .models import InventoryExpense, InventoryItem, StockMovement


class InventoryItemListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for inventory item list views."""

    unit_display = serializers.CharField(source="get_unit_display", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "name",
            "unit",
            "unit_display",
            "quantity",
            "low_stock_threshold",
            "unit_cost",
            "is_low_stock",
            "is_active",
            "created_at",
        ]


class InventoryItemSerializer(serializers.ModelSerializer):
    """Full serializer for InventoryItem CRUD."""

    unit_display = serializers.CharField(source="get_unit_display", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "name",
            "description",
            "unit",
            "unit_display",
            "quantity",
            "low_stock_threshold",
            "unit_cost",
            "is_low_stock",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "quantity", "created_at", "updated_at"]


class StockMovementSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and listing stock movements.

    On create, this automatically:
      - Updates the inventory item's quantity
      - Creates an InventoryExpense for purchase/waste/adjustment types
    """

    inventory_item_name = serializers.CharField(
        source="inventory_item.name", read_only=True
    )
    movement_type_display = serializers.CharField(
        source="get_movement_type_display", read_only=True
    )

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "inventory_item",
            "inventory_item_name",
            "movement_type",
            "movement_type_display",
            "quantity",
            "unit_cost",
            "total_cost",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "total_cost", "created_at"]

    def validate(self, attrs):
        """Validate that usage/waste doesn't exceed current stock."""
        movement_type = attrs.get("movement_type")
        quantity = attrs.get("quantity")
        inventory_item = attrs.get("inventory_item")

        if movement_type in (
            StockMovement.MovementType.USAGE,
            StockMovement.MovementType.WASTE,
        ):
            if quantity > inventory_item.quantity:
                raise serializers.ValidationError(
                    {
                        "quantity": (
                            f"Insufficient stock. Current: {inventory_item.quantity} "
                            f"{inventory_item.get_unit_display()}, "
                            f"Requested: {quantity}."
                        )
                    }
                )
        return attrs


class InventoryExpenseSerializer(serializers.ModelSerializer):
    """Read-only serializer for listing inventory expenses."""

    inventory_item_name = serializers.CharField(
        source="stock_movement.inventory_item.name", read_only=True
    )
    expense_type_display = serializers.CharField(
        source="get_expense_type_display", read_only=True
    )

    class Meta:
        model = InventoryExpense
        fields = [
            "id",
            "stock_movement",
            "inventory_item_name",
            "expense_type",
            "expense_type_display",
            "quantity",
            "unit_cost",
            "total_cost",
            "notes",
            "created_at",
        ]
        read_only_fields = fields
