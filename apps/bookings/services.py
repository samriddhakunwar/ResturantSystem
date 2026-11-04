"""
Slot and capacity logic for the Visit Bookings module.
"""
import datetime

from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from .models import Booking, BookingSlot


class SlotFull(Exception):
    """Raised when a booking would exceed the slot's capacity."""


def _parse_time(value: str) -> datetime.time:
    return datetime.datetime.strptime(value, "%H:%M").time()


def day_slots() -> list[datetime.time]:
    """Slot start times for a day, from BOOKING_DAY_START until closing."""
    length = datetime.timedelta(minutes=settings.BOOKING_SLOT_MINUTES)
    base = datetime.date(2000, 1, 1)
    start = datetime.datetime.combine(base, _parse_time(settings.BOOKING_DAY_START))
    end = datetime.datetime.combine(base, _parse_time(settings.BOOKING_DAY_END))
    slots = []
    while start + length <= end:
        slots.append(start.time())
        start += length
    return slots


def guests_booked(date: datetime.date, slot_start: datetime.time) -> int:
    """Guests holding a place in a slot (cancelled / no-show don't count)."""
    return (
        Booking.objects.filter(date=date, slot_start=slot_start)
        .exclude(status__in=Booking.RELEASED_STATUSES)
        .aggregate(total=Sum("party_size"))["total"]
        or 0
    )


def available_slots(date: datetime.date) -> list[dict]:
    """Every slot of the day with its remaining places. Past slots are full."""
    capacity = settings.BOOKING_MAX_GUESTS_PER_SLOT
    now = timezone.localtime()
    booked = dict(
        Booking.objects.filter(date=date)
        .exclude(status__in=Booking.RELEASED_STATUSES)
        .values_list("slot_start")
        .annotate(total=Sum("party_size"))
    )
    result = []
    for slot in day_slots():
        used = booked.get(slot, 0)
        is_past = date < now.date() or (date == now.date() and slot <= now.time())
        remaining = 0 if is_past else max(capacity - used, 0)
        result.append(
            {
                "start": slot.strftime("%H:%M"),
                "booked": used,
                "capacity": capacity,
                "remaining": remaining,
            }
        )
    return result


def create_booking(**data) -> Booking:
    """
    Create a booking if the slot still has room.

    The per-slot ``BookingSlot`` row is locked with ``select_for_update`` for
    the length of the transaction, so concurrent requests for the same slot
    queue up and each sees the others' bookings. (Locking the Booking rows
    alone wouldn't work: an empty slot has no rows to lock.)
    """
    BookingSlot.objects.get_or_create(date=data["date"], slot_start=data["slot_start"])
    with transaction.atomic():
        BookingSlot.objects.select_for_update().get(
            date=data["date"], slot_start=data["slot_start"]
        )
        used = guests_booked(data["date"], data["slot_start"])
        if used + data["party_size"] > settings.BOOKING_MAX_GUESTS_PER_SLOT:
            raise SlotFull
        return Booking.objects.create(**data)
