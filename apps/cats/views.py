"""
API views for the Café Cats module (staff only).
Guest-facing cat pages are served from ``apps.cafe``.
"""
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from .models import AdoptionEnquiry, Cat
from .serializers import AdoptionEnquirySerializer, CatSerializer


class CatViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for cats.

    Endpoints:
        GET    /cats/          — list cats
        POST   /cats/          — add a cat (multipart for a photo)
        GET    /cats/{id}/     — retrieve a cat
        PATCH  /cats/{id}/     — edit, e.g. {"is_present_today": false}
        DELETE /cats/{id}/     — remove a cat
    """

    queryset = Cat.objects.all()
    serializer_class = CatSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    lookup_value_regex = r"\d+"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["adoption_status", "is_present_today"]
    search_fields = ["name"]
    ordering = ["display_order", "name"]


class AdoptionEnquiryViewSet(viewsets.ModelViewSet):
    """
    Staff inbox for adoption enquiries.

    Endpoints:
        GET    /cats/enquiries/          — list (filter ?status=new)
        GET    /cats/enquiries/{id}/     — retrieve
        PATCH  /cats/enquiries/{id}/     — change status
        DELETE /cats/enquiries/{id}/     — delete
    """

    serializer_class = AdoptionEnquirySerializer
    http_method_names = ["get", "patch", "delete", "head", "options"]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "cat"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return AdoptionEnquiry.objects.select_related("cat")
