"""
Models for the Inventory Management module.

Entities:
    - InventoryItem: a stock-keeping item with quantity tracking and low-stock alerts.
    - StockMovement: a record of stock changes (purchase, usage, waste, adjustment).
    - InventoryExpense: a cost record tied to stock movements for expense tracking.
"""
from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from utils.models import TimeStampedModel


class InventoryItem(TimeStampedModel):
    """A stock-keeping item in the restaurant inventory."""

    class Unit(models.TextChoices):
        KG = "kg", "Kilogram"
        GRAM = "gram", "Gram"
        LITRE = "litre", "Litre"
        ML = "ml", "Millilitre"
        PIECE = "piece", "Piece"
        DOZEN = "dozen", "Dozen"
        PACKET = "packet", "Packet"
        BOTTLE = "bottle", "Bottle"
        BOX = "box", "Box"

    name = models.CharField(
        max_length=200,
        unique=True,
        help_text="Name of the inventory item (e.g. 'Basmati Rice').",
    )
    description = models.TextField(
        blank=True,
        default="",
        help_text="Optional description of this item.",
    )
    unit = models.CharField(
        max_length=20,
        choices=Unit.choices,
        default=Unit.KG,
        help_text="Unit of measurement.",
    )
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        default=Decimal("0.000"),
        help_text="Current stock level.",
    )
    low_stock_threshold = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        default=Decimal("0.000"),
        validators=[MinValueValidator(0)],
        help_text="Alert threshold — item is considered low stock at or below this quantity.",
    )
    unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(0)],
        help_text="Latest purchase cost per unit (NPR).",
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Inactive items are hidden from listings.",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} — {self.quantity} {self.get_unit_display()}"

    @property
    def is_low_stock(self) -> bool:
        """Check if the item is at or below the low stock threshold."""
        return self.quantity <= self.low_stock_threshold


class StockMovement(TimeStampedModel):
    """A record of stock changes for an inventory item."""

    class MovementType(models.TextChoices):
        PURCHASE = "purchase", "Purchase"
        USAGE = "usage", "Usage"
        WASTE = "waste", "Waste"
        ADJUSTMENT = "adjustment", "Adjustment"

    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.CASCADE,
        related_name="movements",
        help_text="The inventory item this movement affects.",
    )
    movement_type = models.CharField(
        max_length=20,
        choices=MovementType.choices,
        db_index=True,
        help_text="Type of stock movement.",
    )
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        validators=[MinValueValidator(Decimal("0.001"))],
        help_text="Quantity moved (always positive; direction is determined by movement_type).",
    )
    unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(0)],
        help_text="Cost per unit for this movement (NPR).",
    )
    total_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        editable=False,
        help_text="Auto-calculated: quantity × unit_cost.",
    )
    notes = models.TextField(
        blank=True,
        default="",
        help_text="Optional notes about this movement.",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return (
            f"{self.get_movement_type_display()} — "
            f"{self.quantity} {self.inventory_item.get_unit_display()} of "
            f"{self.inventory_item.name}"
        )

    def save(self, *args, **kwargs):
        """Calculate total_cost before saving."""
        self.total_cost = (self.quantity * self.unit_cost).quantize(
            Decimal("0.01")
        )
        super().save(*args, **kwargs)


class InventoryExpense(TimeStampedModel):
    """
    A cost record for inventory-related expenses.

    Automatically created for purchase, waste, and adjustment movements
    to track costs separately for reporting.
    """

    class ExpenseType(models.TextChoices):
        PURCHASE = "purchase", "Purchase Cost"
        WASTE = "waste", "Waste Cost"
        ADJUSTMENT = "adjustment", "Adjustment Cost"

    stock_movement = models.OneToOneField(
        StockMovement,
        on_delete=models.CASCADE,
        related_name="expense",
        help_text="The stock movement this expense is tied to.",
    )
    expense_type = models.CharField(
        max_length=20,
        choices=ExpenseType.choices,
        db_index=True,
        help_text="Type of expense.",
    )
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        help_text="Quantity from the movement.",
    )
    unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Cost per unit.",
    )
    total_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        editable=False,
        help_text="Auto-calculated: quantity × unit_cost.",
    )
    notes = models.TextField(
        blank=True,
        default="",
        help_text="Optional notes about this expense.",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return (
            f"{self.get_expense_type_display()} — Rs.{self.total_cost} "
            f"({self.stock_movement.inventory_item.name})"
        )

    def save(self, *args, **kwargs):
        """Calculate total_cost before saving."""
        self.total_cost = (self.quantity * self.unit_cost).quantize(
            Decimal("0.01")
        )
        super().save(*args, **kwargs)
