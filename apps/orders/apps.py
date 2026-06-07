from django.apps import AppConfig


class OrdersConfig(AppConfig):
    """Configuration for the Order Management app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.orders"
    verbose_name = "Order Management"

    def ready(self):
        import apps.orders.signals  # noqa: F401
