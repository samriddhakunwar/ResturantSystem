from django.apps import AppConfig


class MenuConfig(AppConfig):
    """Configuration for the Menu Management app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.menu"
    verbose_name = "Menu Management"
