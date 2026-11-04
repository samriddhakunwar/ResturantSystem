"""
Guest-facing API under ``/api/v1/public/``.

Everything here is ``AllowAny`` and throttled per IP with ``AnonRateThrottle``.
Authentication is switched off for these views, so a stale staff token in
the browser can't turn a public page into a 401.

Endpoints:
    GET  /config/                              — café name, hours, socials
    GET  /menu/                                — active categories and their items
    GET  /tables/{qr_token}/                   — the table a QR code belongs to
    POST /tables/{qr_token}/orders/            — place an order from the table
    POST /tables/{qr_token}/service-requests/  — call staff / request bill / water
    GET  /orders/{public_id}/                  — order status for the tracker
    GET  /cats/                                — cats (?available=1 for adoptable)
    GET  /cats/{slug}/                         — one cat's profile
    POST /cats/{slug}/enquiries/               — ask about adopting a cat
    GET  /bookings/available-slots/?date=      — slots with places left
    POST /bookings/                            — book a visit
"""
import datetime

from django.conf import settings
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from apps.bookings import services as booking_services
from apps.bookings.serializers import PublicBookingSerializer
from apps.cats.models import Cat
from apps.cats.serializers import PublicAdoptionEnquirySerializer, PublicCatSerializer
from apps.menu.models import Category, MenuItem
from apps.orders.models import Order
from apps.tables.models import ServiceRequest, Table

from .serializers import (
    GuestOrderCreateSerializer,
    GuestOrderSerializer,
    GuestServiceRequestSerializer,
    PublicCategorySerializer,
)


class PublicMixin:
    """No auth, open to anyone, rate-limited per IP."""

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [AnonRateThrottle]
    pagination_class = None


def _active_table(qr_token) -> Table:
    """The table for a QR token, or 404 if the token is unknown or the table is off."""
    return get_object_or_404(Table, qr_token=qr_token, is_active=True)


class ConfigView(PublicMixin, APIView):
    """Café branding and settings the frontend needs before anything else."""

    def get(self, request):
        return Response(
            {
                "cafe_name": settings.CAFE_NAME,
                "tagline": settings.CAFE_TAGLINE,
                "wifi": settings.CAFE_WIFI,
                "opening_hours": settings.CAFE_OPENING_HOURS,
                "social": settings.CAFE_SOCIAL,
                "currency": settings.CURRENCY,
                "public_base_url": settings.PUBLIC_BASE_URL,
                "max_qty_per_line": settings.PUBLIC_ORDER_MAX_QTY,
                "booking": {
                    "slot_minutes": settings.BOOKING_SLOT_MINUTES,
                    "max_guests_per_slot": settings.BOOKING_MAX_GUESTS_PER_SLOT,
                },
            }
        )


class MenuView(PublicMixin, generics.ListAPIView):
    """
    Active categories with their items. Sold-out items are included with
    ``is_available: false`` so the menu can show "Napping · sold out"
    (the UI kit keeps them visible); ordering them is still rejected.
    """

    serializer_class = PublicCategorySerializer

    def get_queryset(self):
        items = MenuItem.objects.select_related("recommended_by").order_by(
            "display_order", "name"
        )
        return Category.objects.filter(is_active=True).prefetch_related(
            Prefetch("items", queryset=items, to_attr="public_items")
        )


class TableView(PublicMixin, APIView):
    def get(self, request, qr_token):
        table = _active_table(qr_token)
        return Response({"number": table.number, "label": table.display_label})


class TableOrderCreateView(PublicMixin, APIView):
    def post(self, request, qr_token):
        table = _active_table(qr_token)
        serializer = GuestOrderCreateSerializer(data=request.data, context={"table": table})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(GuestOrderSerializer(order).data, status=status.HTTP_201_CREATED)


class ServiceRequestCreateView(PublicMixin, APIView):
    """Repeated taps while a request of the same type is open return that request."""

    def post(self, request, qr_token):
        table = _active_table(qr_token)
        serializer = GuestServiceRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        existing = ServiceRequest.objects.filter(
            table=table,
            type=serializer.validated_data["type"],
            status=ServiceRequest.Status.OPEN,
        ).first()
        if existing:
            return Response(GuestServiceRequestSerializer(existing).data)
        service_request = serializer.save(table=table)
        return Response(
            GuestServiceRequestSerializer(service_request).data,
            status=status.HTTP_201_CREATED,
        )


class OrderStatusView(PublicMixin, generics.RetrieveAPIView):
    serializer_class = GuestOrderSerializer
    lookup_field = "public_id"
    queryset = Order.objects.select_related("table").prefetch_related("items__menu_item")


class CatListView(PublicMixin, generics.ListAPIView):
    """All cats except adopted ones; ``?available=1`` for adoptable cats only."""

    serializer_class = PublicCatSerializer

    def get_queryset(self):
        cats = Cat.objects.exclude(adoption_status=Cat.AdoptionStatus.ADOPTED)
        if self.request.query_params.get("available"):
            cats = cats.filter(adoption_status=Cat.AdoptionStatus.AVAILABLE)
        if self.request.query_params.get("present"):
            cats = cats.filter(is_present_today=True)
        return cats


class CatDetailView(PublicMixin, generics.RetrieveAPIView):
    serializer_class = PublicCatSerializer
    lookup_field = "slug"
    queryset = Cat.objects.all()


class AdoptionEnquiryCreateView(PublicMixin, APIView):
    def post(self, request, slug):
        cat = get_object_or_404(Cat, slug=slug)
        if cat.adoption_status not in (Cat.AdoptionStatus.AVAILABLE, Cat.AdoptionStatus.RESERVED):
            return Response(
                {"detail": f"{cat.name} isn't looking for a home right now."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = PublicAdoptionEnquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(cat=cat)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AvailableSlotsView(PublicMixin, APIView):
    def get(self, request):
        try:
            date = datetime.date.fromisoformat(request.query_params.get("date", ""))
        except ValueError:
            raise serializers.ValidationError({"date": "Use YYYY-MM-DD."})
        return Response({"date": date, "slots": booking_services.available_slots(date)})


class BookingCreateView(PublicMixin, generics.CreateAPIView):
    serializer_class = PublicBookingSerializer
