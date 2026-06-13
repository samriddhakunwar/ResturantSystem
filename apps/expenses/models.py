"""
Models for the Expense Tracking module.

Entities:
    - Expense: a single operating cost (ingredients, labor, utilities, …)
      recorded against a date, used for the dashboard expenses breakdown.
"""
from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from utils.models import TimeStampedModel


class Expense(TimeStampedModel):
    """A single recorded operating expense."""

    class Category(models.TextChoices):
        INGREDIENTS = "ingredients", "Ingredients"
        LABOR = "labor", "Labor"
        UTILITIES = "utilities", "Utilities"
        RENT = "rent", "Rent"
        OTHER = "other", "Other"

    expense_date = models.DateField(
        db_index=True,
        help_text="The date this expense was incurred.",
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
        db_index=True,
        help_text="Type of expense.",
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Optional description (e.g. 'Cheese supplier — June').",
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Expense amount in NPR.",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["-expense_date", "-created_at"]
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"

    def __str__(self) -> str:
        return f"{self.expense_date} — {self.get_category_display()} Rs.{self.amount}"
