"""
Signals for the Billing System module.

Automatically updates bill payment status when payments are
created, updated, or deleted.
"""
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Payment


@receiver(post_save, sender=Payment)
def update_bill_on_payment_save(sender, instance, **kwargs):
    """Re-check bill payment status when a payment is saved."""
    instance.bill.check_payment_status()


@receiver(post_delete, sender=Payment)
def update_bill_on_payment_delete(sender, instance, **kwargs):
    """Re-check bill payment status when a payment is deleted."""
    instance.bill.check_payment_status()
