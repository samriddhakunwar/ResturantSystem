"""
Models for the Menu Management module.

Entities:
    - Category: groups menu items (e.g. Appetizers, Mains, Drinks).
    - MenuItem: individual dishes / products with price and availability.
"""
from django.core.validators import MinValueValidator
from django.db import models

from utils.models import TimeStampedModel

# Dietary tags a menu item may carry (rendered as Chips on the QR menu).
DIETARY_TAGS = ["veg", "vegan", "gluten_free", "contains_nuts", "contains_dairy"]


class Category(TimeStampedModel):
    """A grouping label for menu items."""

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Category name (e.g. Appetizers, Mains, Drinks).",
    )
    description = models.TextField(
        blank=True,
        default="",
        help_text="Optional description of this category.",
    )
    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Lower numbers appear first in listings.",
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Inactive categories are hidden from the POS.",
    )

    class Meta(TimeStampedModel.Meta):
        verbose_name_plural = "categories"
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name


class MenuItem(TimeStampedModel):
    """A single dish or product on the restaurant menu."""

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="items",
        help_text="The category this item belongs to.",
    )
    name = models.CharField(
        max_length=200,
        help_text="Name of the menu item.",
    )
    description = models.TextField(
        blank=True,
        default="",
        help_text="Optional description / ingredients.",
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Selling price in NPR.",
    )
    image = models.ImageField(
        upload_to="menu/items/%Y/%m/",
        blank=True,
        null=True,
        help_text="Optional product image.",
    )
    is_available = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Unavailable items are hidden from the POS.",
    )
    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Lower numbers appear first within a category.",
    )
    dietary_tags = models.JSONField(
        default=list,
        blank=True,
        help_text=f"Any of: {', '.join(DIETARY_TAGS)}.",
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Highlighted on the guest QR menu.",
    )
    recommended_by = models.ForeignKey(
        "cats.Cat",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="recommended_items",
        help_text="A resident cat's pick, shown as \"Momo's pick\".",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["display_order", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["category", "name"],
                name="unique_item_per_category",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} — Rs.{self.price}"
