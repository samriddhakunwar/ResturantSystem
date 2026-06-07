"""
API views for the Menu Management module.
"""
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from .models import Category, MenuItem
from .serializers import (
    CategorySerializer,
    MenuItemListSerializer,
    MenuItemSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for menu categories.

    Endpoints:
        GET    /categories/          — list all categories
        POST   /categories/          — create a category
        GET    /categories/{id}/     — retrieve a category
        PUT    /categories/{id}/     — update a category
        PATCH  /categories/{id}/     — partial update
        DELETE /categories/{id}/     — delete a category
    """

    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_active"]
    search_fields = ["name"]
    ordering_fields = ["name", "display_order", "created_at"]
    ordering = ["display_order", "name"]

    def get_queryset(self):
        return Category.objects.annotate(items_count=Count("items"))


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for menu items.

    Endpoints:
        GET    /menu-items/          — list all items
        POST   /menu-items/          — create an item
        GET    /menu-items/{id}/     — retrieve an item
        PUT    /menu-items/{id}/     — update an item
        PATCH  /menu-items/{id}/     — partial update
        DELETE /menu-items/{id}/     — delete an item
    """

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "is_available"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "price", "display_order", "created_at"]
    ordering = ["display_order", "name"]

    def get_queryset(self):
        return MenuItem.objects.select_related("category")

    def get_serializer_class(self):
        if self.action == "list":
            return MenuItemListSerializer
        return MenuItemSerializer
