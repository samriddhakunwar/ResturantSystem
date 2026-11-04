"""
Root URL configuration for the Whisker & Brew cat café system.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # ── Admin ─────────────────────────────────
    path("admin/", admin.site.urls),
    # ── API v1 ────────────────────────────────
    path("api/v1/menu/", include("apps.menu.urls")),
    path("api/v1/orders/", include("apps.orders.urls")),
    path("api/v1/billing/", include("apps.billing.urls")),
    path("api/v1/printers/", include("apps.printers.urls")),
    path("api/v1/reports/", include("apps.reports.urls")),
    path("api/v1/expenses/", include("apps.expenses.urls")),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/tables/", include("apps.tables.urls")),
    path("api/v1/cats/", include("apps.cats.urls")),
    path("api/v1/bookings/", include("apps.bookings.urls")),
    # ── Guest-facing (no login) ───────────────
    path("api/v1/public/", include("apps.cafe.urls")),
    # ── API Documentation ─────────────────────
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    # Django Debug Toolbar
    try:
        import debug_toolbar  # noqa: F401  # pyrefly: ignore

        urlpatterns += [path("__debug__/", include("debug_toolbar.urls"))]
    except ImportError:
        pass
