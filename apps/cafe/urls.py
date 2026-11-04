"""
URL configuration for the guest-facing café API (mounted at /api/v1/public/).
"""
from django.urls import path

from . import views

urlpatterns = [
    path("config/", views.ConfigView.as_view(), name="public-config"),
    path("menu/", views.MenuView.as_view(), name="public-menu"),
    path("tables/<uuid:qr_token>/", views.TableView.as_view(), name="public-table"),
    path(
        "tables/<uuid:qr_token>/orders/",
        views.TableOrderCreateView.as_view(),
        name="public-table-orders",
    ),
    path(
        "tables/<uuid:qr_token>/service-requests/",
        views.ServiceRequestCreateView.as_view(),
        name="public-service-requests",
    ),
    path("orders/<uuid:public_id>/", views.OrderStatusView.as_view(), name="public-order"),
    path("cats/", views.CatListView.as_view(), name="public-cats"),
    path("cats/<slug:slug>/", views.CatDetailView.as_view(), name="public-cat"),
    path(
        "cats/<slug:slug>/enquiries/",
        views.AdoptionEnquiryCreateView.as_view(),
        name="public-cat-enquiry",
    ),
    path(
        "bookings/available-slots/",
        views.AvailableSlotsView.as_view(),
        name="public-available-slots",
    ),
    path("bookings/", views.BookingCreateView.as_view(), name="public-bookings"),
]
