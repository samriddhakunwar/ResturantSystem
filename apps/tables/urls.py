"""
URL configuration for the Tables & QR module.
"""
from django.urls import re_path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"service-requests", views.ServiceRequestViewSet, basename="service-request")
router.register(r"", views.TableViewSet, basename="table")

urlpatterns = [
    re_path(r"^(?P<pk>\d+)/qr\.(?P<fmt>png|svg)$", views.TableQRView.as_view(), name="table-qr"),
] + router.urls
