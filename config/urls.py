"""
Root URL configuration for the Restaurant Management System.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

# ---------------------------------------------------------------------------
# API v1 URL patterns
# ---------------------------------------------------------------------------
api_v1_patterns = [
    path("auth/", include("apps.accounts.urls")),
    path("menu/", include("apps.menu.urls")),
    path("tables/", include("apps.tables.urls")),
    path("orders/", include("apps.orders.urls")),
    path("kitchen/", include("apps.kitchen.urls")),
    path("billing/", include("apps.billing.urls")),
    path("inventory/", include("apps.inventory.urls")),
    path("printers/", include("apps.printing.urls")),
    path("reports/", include("apps.reports.urls")),
]

urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),
    # API
    path("api/v1/", include(api_v1_patterns)),
    # OpenAPI Schema & Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    # Django Debug Toolbar
    try:
        import debug_toolbar

        urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    except ImportError:
        pass

# Admin site customization
admin.site.site_header = "Restaurant Management System"
admin.site.site_title = "RMS Admin"
admin.site.index_title = "Administration"
