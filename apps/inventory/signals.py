"""
Signals for the Inventory Management module.

Automatically:
    - Updates InventoryItem quantity when a StockMovement is created.
    - Creates an InventoryExpense for purchase, waste, and adjustment movements.
    - Reverses quantity changes when a StockMovement is deleted.
"""
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import InventoryExpense, StockMovement


# Movement types that generate expenses
_EXPENSE_TYPES = {
    StockMovement.MovementType.PURCHASE,
    StockMovement.MovementType.WASTE,
    StockMovement.MovementType.ADJUSTMENT,
}


@receiver(post_save, sender=StockMovement)
def handle_stock_movement_save(sender, instance, created, **kwargs):
    """
    When a StockMovement is created:
      1. Update the inventory item's quantity.
      2. Update the inventory item's unit_cost (for purchases).
      3. Create an InventoryExpense record (for purchase/waste/adjustment).
    """
    if not created:
        return

    item = instance.inventory_item

    # Update quantity based on movement type
    if instance.movement_type == StockMovement.MovementType.PURCHASE:
        item.quantity += instance.quantity
        # Update the latest unit cost on purchase
        if instance.unit_cost > 0:
            item.unit_cost = instance.unit_cost
    elif instance.movement_type in (
        StockMovement.MovementType.USAGE,
        StockMovement.MovementType.WASTE,
    ):
        item.quantity -= instance.quantity
    elif instance.movement_type == StockMovement.MovementType.ADJUSTMENT:
        # Adjustment can go either direction; use the quantity as-is
        # Positive = adding, negative adjustments should be handled by
        # setting the quantity directly or using usage type
        item.quantity += instance.quantity

    item.save(update_fields=["quantity", "unit_cost", "updated_at"])

    # Create expense record for trackable movement types
    if instance.movement_type in _EXPENSE_TYPES:
        InventoryExpense.objects.create(
            stock_movement=instance,
            expense_type=instance.movement_type,
            quantity=instance.quantity,
            unit_cost=instance.unit_cost,
            notes=instance.notes,
        )


@receiver(post_delete, sender=StockMovement)
def handle_stock_movement_delete(sender, instance, **kwargs):
    """
    Reverse the quantity change when a StockMovement is deleted.
    The related InventoryExpense is auto-deleted via CASCADE.
    """
    item = instance.inventory_item

    if instance.movement_type == StockMovement.MovementType.PURCHASE:
        item.quantity -= instance.quantity
    elif instance.movement_type in (
        StockMovement.MovementType.USAGE,
        StockMovement.MovementType.WASTE,
    ):
        item.quantity += instance.quantity
    elif instance.movement_type == StockMovement.MovementType.ADJUSTMENT:
        item.quantity -= instance.quantity

    item.save(update_fields=["quantity", "updated_at"])
