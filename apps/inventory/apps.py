from django.apps import AppConfig


class InventoryConfig(AppConfig):
    """Configuration for the Inventory Management app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.inventory"
    verbose_name = "Inventory Management"

    def ready(self):
        import apps.inventory.signals  # noqa: F401
