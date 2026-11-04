"""
API views for the Visit Bookings module (staff only).
Guest booking endpoints are served from ``apps.cafe``.
"""
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from .models import Booking
from .serializers import BookingSerializer


class BookingViewSet(viewsets.ModelViewSet):
    """
    Staff management of bookings.

    Endpoints:
        GET    /bookings/                 — list (filter ?date=YYYY-MM-DD&status=)
        GET    /bookings/{id}/            — retrieve
        PATCH  /bookings/{id}/            — change status / notes
        DELETE /bookings/{id}/            — delete
    """

    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    http_method_names = ["get", "patch", "delete", "head", "options"]
    lookup_value_regex = r"\d+"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["date", "status", "slot_start"]
    search_fields = ["name", "phone", "email"]
    ordering = ["date", "slot_start", "created_at"]
