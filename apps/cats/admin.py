"""
Django admin configuration for the Café Cats module.
"""
from django.contrib import admin

from .models import AdoptionEnquiry, Cat


@admin.register(Cat)
class CatAdmin(admin.ModelAdmin):
    """Admin view for Cat."""

    list_display = ["name", "adoption_status", "is_present_today", "display_order"]
    list_filter = ["adoption_status", "is_present_today"]
    list_editable = ["is_present_today", "display_order"]
    prepopulated_fields = {"slug": ["name"]}
    search_fields = ["name"]


@admin.register(AdoptionEnquiry)
class AdoptionEnquiryAdmin(admin.ModelAdmin):
    """Admin view for AdoptionEnquiry."""

    list_display = ["name", "cat", "phone", "status", "created_at"]
    list_filter = ["status"]
    list_select_related = ["cat"]
