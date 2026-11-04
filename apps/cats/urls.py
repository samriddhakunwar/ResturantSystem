"""
URL configuration for the Café Cats module.
"""
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"enquiries", views.AdoptionEnquiryViewSet, basename="adoption-enquiry")
router.register(r"", views.CatViewSet, basename="cat")

urlpatterns = router.urls
