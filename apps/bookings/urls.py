"""
URL configuration for the Visit Bookings module.
"""
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"", views.BookingViewSet, basename="booking")

urlpatterns = router.urls
