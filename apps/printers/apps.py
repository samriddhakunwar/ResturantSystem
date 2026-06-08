from django.apps import AppConfig


class PrintersConfig(AppConfig):
    """Configuration for the Thermal Printer System app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.printers"
    verbose_name = "Thermal Printer System"
