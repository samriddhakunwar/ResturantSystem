from django.apps import AppConfig
from django.core import checks


class TablesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.tables"
    verbose_name = "Tables & QR"

    def ready(self):
        checks.register(check_public_base_url)


def check_public_base_url(app_configs, **kwargs):
    """Warn when table QR codes would point at localhost (phones can't open it)."""
    from django.conf import settings

    if "localhost" in settings.PUBLIC_BASE_URL or "127.0.0.1" in settings.PUBLIC_BASE_URL:
        return [
            checks.Warning(
                f"PUBLIC_BASE_URL is {settings.PUBLIC_BASE_URL!r}.",
                hint="Table QR codes encode this URL. Set it to the café's LAN IP "
                "or domain (e.g. http://192.168.1.20:5173) before printing table cards.",
                id="tables.W001",
            )
        ]
    return []
