"""
URL configuration for the Thermal Printer System module.
"""
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"printers", views.PrinterViewSet, basename="printer")
router.register(r"print-jobs", views.PrintJobViewSet, basename="printjob")

urlpatterns = router.urls
