"""
URL configuration for the Reporting module.
"""
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"daily", views.DailySalesReportViewSet, basename="daily-report")

urlpatterns = router.urls
