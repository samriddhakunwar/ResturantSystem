"""
Models for the Order Management module.

Entities:
    - Order: a customer order with status tracking and auto-calculated totals.
    - OrderItem: a line item linking an Order to a MenuItem with quantity and price snapshot.
"""
import uuid

from django.core.validators import MinValueValidator
from django.db import models

from utils.models import TimeStampedModel


class Order(TimeStampedModel):
    """A customer order placed at the restaurant."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PREPARING = "preparing", "Preparing"
        READY = "ready", "Ready"
        SERVED = "served", "Served"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    class Source(models.TextChoices):
        POS = "pos", "POS"
        QR = "qr", "QR menu"

    order_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text="Auto-generated order number (e.g. ORD-000001).",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
        help_text="Current order status.",
    )
    table_number = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text="Optional table number (filled in from ``table`` when set).",
    )
    table = models.ForeignKey(
        "tables.Table",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="orders",
        help_text="The café table, if known.",
    )
    source = models.CharField(
        max_length=3,
        choices=Source.choices,
        default=Source.POS,
        db_index=True,
        help_text="Where the order came from: staff POS or a guest's QR menu.",
    )
    public_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        help_text="Unguessable id guests use to track their order.",
    )
    confirmed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When staff accepted the order. QR orders start unconfirmed.",
    )
    notes = models.TextField(
        blank=True,
        default="",
        help_text="Optional notes for the kitchen or staff.",
    )
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        editable=False,
        help_text="Sum of all item totals (auto-calculated).",
    )
    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        editable=False,
        help_text="Final order total (auto-calculated).",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.order_number} — Rs.{self.total} ({self.get_status_display()})"

    def save(self, *args, **kwargs):
        """Auto-generate order number on first save; mirror the table's number."""
        if not self.order_number:
            self.order_number = self._generate_order_number()
        if self.table_id:
            self.table_number = self.table.number
        super().save(*args, **kwargs)

    @property
    def guest_step(self) -> str:
        """Where the order is on the guest's 5-step tracker."""
        if self.status == self.Status.PENDING:
            return "confirmed" if self.confirmed_at else "received"
        return {
            self.Status.PREPARING: "brewing",
            self.Status.READY: "ready",
            self.Status.SERVED: "served",
            self.Status.COMPLETED: "served",
            self.Status.CANCELLED: "cancelled",
        }[self.status]

    def recalculate_total(self) -> None:
        """Recalculate subtotal and total from order items."""
        from django.db.models import Sum

        item_sum = self.items.aggregate(total=Sum("item_total"))["total"] or 0
        self.subtotal = item_sum
        self.total = item_sum  # Billing module will add tax/discount later
        self.save(update_fields=["subtotal", "total", "updated_at"])

    @staticmethod
    def _generate_order_number() -> str:
        """Generate a sequential order number like ORD-000001."""
        last_order = (
            Order.objects.filter(order_number__startswith="ORD-")
            .order_by("-order_number")
            .values_list("order_number", flat=True)
            .first()
        )
        if last_order:
            last_num = int(last_order.split("-")[1])
            return f"ORD-{last_num + 1:06d}"
        return "ORD-000001"


class OrderItem(TimeStampedModel):
    """A single line item within an order."""

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        help_text="The order this item belongs to.",
    )
    menu_item = models.ForeignKey(
        "menu.MenuItem",
        on_delete=models.PROTECT,
        related_name="order_items",
        help_text="The menu item ordered.",
    )
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Number of units ordered.",
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False,
        help_text="Price per unit at time of order (snapshot).",
    )
    item_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        editable=False,
        help_text="quantity × unit_price (auto-calculated).",
    )
    notes = models.TextField(
        blank=True,
        default="",
        help_text="Optional item-level notes (e.g. 'no onions').",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.quantity}× {self.menu_item.name} — Rs.{self.item_total}"

    def save(self, *args, **kwargs):
        """Capture unit_price from menu item and calculate item_total."""
        if not self.unit_price:
            self.unit_price = self.menu_item.price
        self.item_total = self.quantity * self.unit_price
        super().save(*args, **kwargs)
