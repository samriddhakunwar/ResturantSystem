from django.apps import AppConfig


class BillingConfig(AppConfig):
    """Configuration for the Billing System app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.billing"
    verbose_name = "Billing System"

    def ready(self):
        import apps.billing.signals  # noqa: F401
