"""
Serializers for the Visit Bookings module.
"""
from django.conf import settings
from django.utils import timezone
from rest_framework import serializers

from . import services
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    """Staff view of a booking; staff edit status and notes."""

    class Meta:
        model = Booking
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "date",
            "slot_start",
            "party_size",
            "kids_count",
            "accepted_rules",
            "status",
            "notes",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "name",
            "phone",
            "email",
            "date",
            "slot_start",
            "party_size",
            "kids_count",
            "accepted_rules",
            "created_at",
        ]


class PublicBookingSerializer(serializers.ModelSerializer):
    """A guest's 'Book a visit' form."""

    slot_start = serializers.TimeField(format="%H:%M", input_formats=["%H:%M", "%H:%M:%S"])

    class Meta:
        model = Booking
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "date",
            "slot_start",
            "party_size",
            "kids_count",
            "accepted_rules",
            "notes",
            "status",
        ]
        read_only_fields = ["id", "status"]

    def validate_accepted_rules(self, value):
        if not value:
            raise serializers.ValidationError("Please accept the café rules to book.")
        return value

    def validate_party_size(self, value):
        if not 1 <= value <= settings.BOOKING_MAX_GUESTS_PER_SLOT:
            raise serializers.ValidationError(
                f"Party size must be 1–{settings.BOOKING_MAX_GUESTS_PER_SLOT}."
            )
        return value

    def validate(self, attrs):
        date, slot = attrs["date"], attrs["slot_start"]
        if attrs.get("kids_count", 0) > attrs["party_size"]:
            raise serializers.ValidationError(
                {"kids_count": "Children are counted in the party size."}
            )
        if slot not in services.day_slots():
            raise serializers.ValidationError({"slot_start": "That isn't one of our slots."})
        now = timezone.localtime()
        if date < now.date() or (date == now.date() and slot <= now.time()):
            raise serializers.ValidationError({"slot_start": "That slot has already started."})
        return attrs

    def create(self, validated_data):
        try:
            return services.create_booking(**validated_data)
        except services.SlotFull:
            raise serializers.ValidationError(
                {"slot_start": "Sorry, that slot just filled up. Please pick another."}
            )
