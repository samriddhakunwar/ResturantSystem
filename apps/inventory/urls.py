"""
URL configuration for the Inventory Management module.
"""
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"items", views.InventoryItemViewSet, basename="inventory-item")
router.register(r"movements", views.StockMovementViewSet, basename="stock-movement")
router.register(r"expenses", views.InventoryExpenseViewSet, basename="inventory-expense")

urlpatterns = router.urls
