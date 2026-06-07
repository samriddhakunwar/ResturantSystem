"""
Django admin configuration for the Menu Management module.
"""
from django.contrib import admin

from .models import Category, MenuItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin view for Category."""

    list_display = ["name", "display_order", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name"]
    list_editable = ["display_order", "is_active"]
    ordering = ["display_order", "name"]


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    """Admin view for MenuItem."""

    list_display = [
        "name",
        "category",
        "price",
        "is_available",
        "display_order",
        "created_at",
    ]
    list_filter = ["category", "is_available"]
    search_fields = ["name", "description"]
    list_editable = ["price", "is_available", "display_order"]
    list_select_related = ["category"]
    ordering = ["display_order", "name"]
