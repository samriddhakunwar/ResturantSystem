"""
Tests for visit bookings and slot capacity.
"""
import datetime
import threading
import unittest

from django.db import connection
from django.test import TestCase, TransactionTestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Booking

URL = "/api/v1/public/bookings/"


def booking(party_size, name="Guest", days_ahead=1):
    return {
        "name": name,
        "phone": "9841000000",
        "date": (timezone.localdate() + datetime.timedelta(days=days_ahead)).isoformat(),
        "slot_start": "11:00",
        "party_size": party_size,
        "kids_count": 0,
        "accepted_rules": True,
    }


@override_settings(BOOKING_MAX_GUESTS_PER_SLOT=12)
class BookingTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_slot_capacity_is_enforced(self):
        self.assertEqual(self.client.post(URL, booking(8), format="json").status_code, 201)
        self.assertEqual(self.client.post(URL, booking(4), format="json").status_code, 201)
        full = self.client.post(URL, booking(1), format="json")
        self.assertEqual(full.status_code, 400)
        self.assertIn("slot_start", full.data)

        slots = self.client.get(
            "/api/v1/public/bookings/available-slots/", {"date": booking(1)["date"]}
        ).data["slots"]
        eleven = next(s for s in slots if s["start"] == "11:00")
        self.assertEqual(eleven["remaining"], 0)

    def test_cancelled_bookings_free_their_places(self):
        self.client.post(URL, booking(12), format="json")
        Booking.objects.update(status=Booking.Status.CANCELLED)
        self.assertEqual(self.client.post(URL, booking(12), format="json").status_code, 201)

    def test_rules_past_dates_and_bad_slots_are_rejected(self):
        self.assertEqual(
            self.client.post(URL, {**booking(2), "accepted_rules": False}, format="json").status_code, 400
        )
        self.assertEqual(self.client.post(URL, booking(2, days_ahead=-1), format="json").status_code, 400)
        self.assertEqual(
            self.client.post(URL, {**booking(2), "slot_start": "11:30"}, format="json").status_code, 400
        )
        self.assertEqual(
            self.client.post(URL, {**booking(2), "kids_count": 3}, format="json").status_code, 400
        )


@unittest.skipUnless(connection.vendor == "postgresql", "SQLite ignores select_for_update")
@override_settings(BOOKING_MAX_GUESTS_PER_SLOT=12)
class ConcurrentBookingTests(TransactionTestCase):
    def test_concurrent_requests_cannot_overbook(self):
        """Ten parallel bookings of 4 into a 12-guest slot: exactly three win."""
        results = []
        barrier = threading.Barrier(10)

        def book(i):
            try:
                barrier.wait()
                res = APIClient().post(URL, booking(4, name=f"Guest {i}"), format="json")
                results.append(res.status_code)
            finally:
                connection.close()

        threads = [threading.Thread(target=book, args=(i,)) for i in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(results.count(201), 3)
        self.assertEqual(results.count(400), 7)
        self.assertEqual(sum(Booking.objects.values_list("party_size", flat=True)), 12)
