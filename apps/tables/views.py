"""
API views for the Tables & QR module (staff only).
"""
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from . import qr
from .models import ServiceRequest, Table
from .serializers import ServiceRequestSerializer, TableSerializer


class TableViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for café tables.

    Endpoints:
        GET    /tables/                       — list tables
        POST   /tables/                       — add a table
        GET    /tables/{id}/                  — retrieve a table
        PATCH  /tables/{id}/                  — edit / deactivate a table
        DELETE /tables/{id}/                  — delete a table
        POST   /tables/{id}/regenerate-token/ — issue a new QR token
        GET    /tables/{id}/qr.png            — QR code as PNG (see TableQRView)
        GET    /tables/{id}/qr.svg            — QR code as SVG
    """

    queryset = Table.objects.all()
    serializer_class = TableSerializer
    lookup_value_regex = r"\d+"
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["is_active"]
    ordering = ["number"]

    @action(detail=True, methods=["post"], url_path="regenerate-token")
    def regenerate_token(self, request, pk=None):
        """Invalidate the old QR code (e.g. it leaked) and issue a new one."""
        table = self.get_object()
        table.regenerate_token()
        return Response(TableSerializer(table).data, status=status.HTTP_200_OK)


class TableQRView(APIView):
    """Render a table's QR code. ``?download=1`` adds a download filename."""

    def get(self, request, pk: int, fmt: str):
        table = get_object_or_404(Table, pk=pk)
        url = qr.table_url(table)
        if fmt == "png":
            response = HttpResponse(qr.render_png(url), content_type="image/png")
        else:
            response = HttpResponse(qr.render_svg(url), content_type="image/svg+xml")
        if request.query_params.get("download"):
            response["Content-Disposition"] = (
                f'attachment; filename="table-{table.number}-qr.{fmt}"'
            )
        return response


class ServiceRequestViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Staff inbox of guest service requests.

    Endpoints:
        GET  /tables/service-requests/               — list (filter ?status=open)
        POST /tables/service-requests/{id}/resolve/  — mark resolved
    """

    serializer_class = ServiceRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "type", "table"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return ServiceRequest.objects.select_related("table")

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        """Mark a service request as handled."""
        service_request = self.get_object()
        service_request.status = ServiceRequest.Status.RESOLVED
        service_request.resolved_at = timezone.now()
        service_request.save(update_fields=["status", "resolved_at", "updated_at"])
        return Response(ServiceRequestSerializer(service_request).data)
