"""
Django admin configuration for the Visit Bookings module.
"""
from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """Admin view for Booking."""

    list_display = ["name", "date", "slot_start", "party_size", "kids_count", "status"]
    list_filter = ["status", "date"]
    search_fields = ["name", "phone", "email"]
