"""
Serializers for the Order Management module.
"""
from rest_framework import serializers

from apps.menu.serializers import MenuItemListSerializer

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order line items (used nested inside OrderSerializer)."""

    menu_item_detail = MenuItemListSerializer(source="menu_item", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "menu_item",
            "menu_item_detail",
            "quantity",
            "unit_price",
            "item_total",
            "notes",
        ]
        read_only_fields = ["id", "unit_price", "item_total"]


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order list views."""

    items_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "table_number",
            "total",
            "items_count",
            "created_at",
        ]


class OrderSerializer(serializers.ModelSerializer):
    """Full serializer for Order CRUD with nested item creation."""

    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "table_number",
            "notes",
            "subtotal",
            "total",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "order_number",
            "subtotal",
            "total",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        """Create order with nested items in a single request."""
        items_data = validated_data.pop("items")
        if not items_data:
            raise serializers.ValidationError(
                {"items": "An order must have at least one item."}
            )

        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        # Refresh to get calculated totals
        order.refresh_from_db()
        return order

    def update(self, instance, validated_data):
        """Update order and replace items if provided."""
        items_data = validated_data.pop("items", None)

        # Update order fields
        instance.table_number = validated_data.get(
            "table_number", instance.table_number
        )
        instance.notes = validated_data.get("notes", instance.notes)
        instance.status = validated_data.get("status", instance.status)
        instance.save()

        # Replace items if provided
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)
            instance.refresh_from_db()

        return instance


class OrderStatusSerializer(serializers.ModelSerializer):
    """Serializer for updating only the order status."""

    class Meta:
        model = Order
        fields = ["status"]

    def validate_status(self, value):
        """Validate status transitions."""
        current = self.instance.status

        valid_transitions = {
            Order.Status.PENDING: [Order.Status.PREPARING, Order.Status.CANCELLED],
            Order.Status.PREPARING: [Order.Status.COMPLETED, Order.Status.CANCELLED],
            Order.Status.COMPLETED: [],
            Order.Status.CANCELLED: [],
        }

        allowed = valid_transitions.get(current, [])
        if value not in allowed:
            raise serializers.ValidationError(
                f"Cannot transition from '{current}' to '{value}'. "
                f"Allowed: {[s.value for s in allowed] or 'none (terminal state)'}."
            )
        return value
