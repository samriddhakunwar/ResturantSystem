"""
URL configuration for the Expense Tracking module.
"""
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"expenses", views.ExpenseViewSet, basename="expense")

urlpatterns = router.urls
