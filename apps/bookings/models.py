"""
Models for the Visit Bookings module.

Entities:
    - Booking: a guest's reservation for a visit slot.
    - BookingSlot: one row per (date, slot) used only as a lock, so two
      concurrent bookings for an empty slot can't both pass the capacity check.
"""
from django.core.validators import MinValueValidator
from django.db import models

from utils.models import TimeStampedModel


class BookingSlot(models.Model):
    """Lock row for a booking slot (see ``services.create_booking``)."""

    date = models.DateField()
    slot_start = models.TimeField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["date", "slot_start"], name="unique_booking_slot"),
        ]

    def __str__(self) -> str:
        return f"{self.date} {self.slot_start:%H:%M}"


class Booking(TimeStampedModel):
    """A guest's booked visit."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        ARRIVED = "arrived", "Arrived"
        CANCELLED = "cancelled", "Cancelled"
        NO_SHOW = "no_show", "No-show"

    # Bookings in these states don't take up space in a slot.
    RELEASED_STATUSES = [Status.CANCELLED, Status.NO_SHOW]

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default="")
    date = models.DateField(db_index=True)
    slot_start = models.TimeField()
    party_size = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Total guests, including children.",
    )
    kids_count = models.PositiveSmallIntegerField(
        default=0,
        help_text="How many of the party are under 12.",
    )
    accepted_rules = models.BooleanField(
        default=False,
        help_text="Guest accepted the café rules (wash hands, let sleeping cats lie…).",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    notes = models.TextField(blank=True, default="", max_length=1000)

    class Meta(TimeStampedModel.Meta):
        ordering = ["date", "slot_start", "created_at"]

    def __str__(self) -> str:
        return f"{self.name} × {self.party_size} — {self.date} {self.slot_start:%H:%M}"
