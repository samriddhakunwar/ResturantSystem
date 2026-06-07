"""
Signals for the Order Management module.

Automatically recalculates order totals when order items are
created, updated, or deleted.
"""
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import OrderItem


@receiver(post_save, sender=OrderItem)
def recalculate_order_on_item_save(sender, instance, **kwargs):
    """Recalculate order total when an item is saved."""
    instance.order.recalculate_total()


@receiver(post_delete, sender=OrderItem)
def recalculate_order_on_item_delete(sender, instance, **kwargs):
    """Recalculate order total when an item is deleted."""
    instance.order.recalculate_total()
