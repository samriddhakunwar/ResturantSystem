"""
Serializers for the guest-facing café API.

Nothing here trusts the client with money: prices are read from the menu
on the server, and totals come from the same maths the billing module uses.
"""
from decimal import Decimal

from django.conf import settings
from rest_framework import serializers

from apps.billing.models import Bill
from apps.menu.models import Category, MenuItem
from apps.orders.models import Order, OrderItem
from apps.tables.models import ServiceRequest


class PublicMenuItemSerializer(serializers.ModelSerializer):
    recommended_by = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "name",
            "description",
            "price",
            "image",
            "is_available",
            "is_featured",
            "dietary_tags",
            "recommended_by",
        ]
        read_only_fields = fields

    def get_recommended_by(self, obj):
        cat = obj.recommended_by
        return {"name": cat.name, "slug": cat.slug} if cat else None


class PublicCategorySerializer(serializers.ModelSerializer):
    items = PublicMenuItemSerializer(many=True, read_only=True, source="public_items")

    class Meta:
        model = Category
        fields = ["id", "name", "description", "items"]
        read_only_fields = fields


class GuestOrderLineSerializer(serializers.Serializer):
    menu_item = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.select_related("category")
    )
    quantity = serializers.IntegerField(min_value=1, max_value=settings.PUBLIC_ORDER_MAX_QTY)
    notes = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")

    def validate_menu_item(self, item):
        if not item.is_available or not item.category.is_active:
            raise serializers.ValidationError(f"Sorry, {item.name} is napping (sold out).")
        return item


class GuestOrderCreateSerializer(serializers.Serializer):
    """
    A guest's order from the QR menu. Any price the client sends is ignored:
    only ``menu_item``, ``quantity`` and ``notes`` are read.
    """

    items = GuestOrderLineSerializer(many=True, allow_empty=False)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True, default="")

    def validate_items(self, items):
        if len(items) > settings.PUBLIC_ORDER_MAX_LINES:
            raise serializers.ValidationError(
                f"Please split this into orders of at most {settings.PUBLIC_ORDER_MAX_LINES} lines."
            )
        return items

    def create(self, validated_data):
        table = self.context["table"]
        order = Order.objects.create(
            source=Order.Source.QR,
            table=table,
            notes=validated_data["notes"],
        )
        for line in validated_data["items"]:
            OrderItem.objects.create(
                order=order,
                menu_item=line["menu_item"],
                quantity=line["quantity"],
                unit_price=line["menu_item"].price,  # server-side price snapshot
                notes=line["notes"],
            )
        order.refresh_from_db()
        return order


class GuestOrderItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="menu_item.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["name", "quantity", "unit_price", "item_total", "notes"]
        read_only_fields = fields


class GuestOrderSerializer(serializers.ModelSerializer):
    """What a guest sees about their order: no internal ids or order numbers."""

    step = serializers.CharField(source="guest_step", read_only=True)
    code = serializers.SerializerMethodField()
    table_label = serializers.SerializerMethodField()
    items = GuestOrderItemSerializer(many=True, read_only=True)
    charges = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "public_id",
            "code",
            "step",
            "table_label",
            "notes",
            "items",
            "subtotal",
            "charges",
            "created_at",
        ]
        read_only_fields = fields

    def get_code(self, obj) -> str:
        """Short reference to read out to staff, e.g. 'A7F2'."""
        return obj.public_id.hex[:4].upper()

    def get_table_label(self, obj):
        return obj.table.display_label if obj.table else None

    def get_charges(self, obj) -> dict:
        """
        Estimated bill using the billing module's own formula and defaults
        (10% service charge, then 13% VAT). The real Bill may add a discount.
        """
        bill = getattr(obj, "bill", None) or Bill(subtotal=obj.subtotal)
        bill.calculate_totals()
        return {
            "service_charge_percent": bill.service_charge_percent,
            "service_charge": bill.service_charge_amount,
            "vat_percent": bill.tax_percent,
            "vat": bill.tax_amount,
            "discount": bill.discount_amount,
            "total": bill.grand_total.quantize(Decimal("0.01")),
        }


class GuestServiceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = ["id", "type", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]
