"""
URL configuration for the Billing System module.
"""
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"bills", views.BillViewSet, basename="bill")
router.register(r"payments", views.PaymentViewSet, basename="payment")

urlpatterns = router.urls
