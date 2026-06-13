"""
Django admin configuration for the Expense Tracking module.
"""
from django.contrib import admin

from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """Admin view for Expense."""

    list_display = ["expense_date", "category", "description", "amount"]
    list_filter = ["category", "expense_date"]
    search_fields = ["description"]
    ordering = ["-expense_date"]
    date_hierarchy = "expense_date"
