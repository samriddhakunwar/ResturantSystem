"""
Django base settings for the Whisker & Brew cat café system.
Shared across all environments (development, production).
"""
import os
from pathlib import Path

import dj_database_url

# ──────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent


def env_list(name: str, default: str = "") -> list[str]:
    """Read a comma-separated env var into a list, dropping blanks."""
    return [v.strip() for v in os.environ.get(name, default).split(",") if v.strip()]


def env_bool(name: str, default: bool = False) -> bool:
    """Read a boolean env var ("1", "true", "yes" are truthy)."""
    return os.environ.get(name, str(default)).strip().lower() in ("1", "true", "yes")

# ──────────────────────────────────────────────
# Security
# ──────────────────────────────────────────────
SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-change-me-in-production-!@#$%^&*()",
)

DEBUG = False

ALLOWED_HOSTS: list[str] = []

# ──────────────────────────────────────────────
# Application definition
# ──────────────────────────────────────────────
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework.authtoken",
    "drf_spectacular",
    "django_filters",
    "corsheaders",
]

# Optional: Celery Beat (only if installed)
try:
    import django_celery_beat  # noqa: F401  # pyrefly: ignore

    THIRD_PARTY_APPS.append("django_celery_beat")
except ImportError:
    pass

LOCAL_APPS = [
    "apps.menu",
    "apps.orders",
    "apps.billing",
    "apps.reports",
    "apps.printers",
    "apps.expenses",
    "apps.accounts",
    "apps.tables",
    "apps.cats",
    "apps.bookings",
    "apps.cafe",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ──────────────────────────────────────────────
# Middleware
# ──────────────────────────────────────────────
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ──────────────────────────────────────────────
# Database
# ──────────────────────────────────────────────
# Uses DATABASE_URL env var if set, otherwise falls back to SQLite for local dev.
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    ),
}

# ──────────────────────────────────────────────
# Password validation
# ──────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ──────────────────────────────────────────────
# Internationalization
# ──────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kathmandu"
USE_I18N = True
USE_TZ = True

# ──────────────────────────────────────────────
# Static & Media files
# ──────────────────────────────────────────────
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# ──────────────────────────────────────────────
# Default primary key field type
# ──────────────────────────────────────────────
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ──────────────────────────────────────────────
# Django REST Framework
# ──────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "utils.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    # Staff endpoints need a token (or an admin session for the browsable API).
    # Guest-facing views under /api/v1/public/ opt out with AllowAny.
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": os.environ.get("PUBLIC_THROTTLE_RATE", "120/min"),
        "login": os.environ.get("LOGIN_THROTTLE_RATE", "10/min"),
    },
}

# ──────────────────────────────────────────────
# DRF Spectacular (OpenAPI / Swagger)
# ──────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    "TITLE": "Whisker & Brew Cat Café API",
    "DESCRIPTION": "Staff POS and guest QR-menu API for a cat café",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api/v[0-9]",
}

# ──────────────────────────────────────────────
# Café branding & public config
# ──────────────────────────────────────────────
CAFE_NAME = os.environ.get("CAFE_NAME", "Whisker & Brew")
CAFE_TAGLINE = os.environ.get("CAFE_TAGLINE", "Coffee, cake and cats who choose you.")
CAFE_WIFI = os.environ.get("CAFE_WIFI", "WhiskerGuest")
# One line per day range, separated by ";" in the env var.
CAFE_OPENING_HOURS = [
    line.strip()
    for line in os.environ.get(
        "CAFE_OPENING_HOURS", "Mon–Fri 10:00–20:00;Sat–Sun 09:00–21:00"
    ).split(";")
    if line.strip()
]
CAFE_SOCIAL = {
    "facebook": os.environ.get("CAFE_FACEBOOK_URL", ""),
    "instagram": os.environ.get("CAFE_INSTAGRAM_URL", ""),
    "tiktok": os.environ.get("CAFE_TIKTOK_URL", ""),
}
CURRENCY = "NPR"
# Where guests' phones reach the frontend. Table QR codes encode
# {PUBLIC_BASE_URL}/t/{qr_token}, so this MUST be the café's LAN IP or domain
# (e.g. http://192.168.1.20:5173) — phones cannot open "localhost".
PUBLIC_BASE_URL = os.environ.get("PUBLIC_BASE_URL", "http://localhost:5173").rstrip("/")

# ──────────────────────────────────────────────
# Guest ordering, printing & bookings
# ──────────────────────────────────────────────
PUBLIC_ORDER_MAX_QTY = 20  # per line, matches the QuantityStepper cap
PUBLIC_ORDER_MAX_LINES = 30
# Print a kitchen ticket as soon as staff create an order at the POS.
# (QR orders always print when staff confirm them.)
KITCHEN_AUTO_PRINT_POS = env_bool("KITCHEN_AUTO_PRINT_POS", False)
# Hand print jobs to Celery. Off → print synchronously in the request.
CELERY_ENABLED = env_bool("CELERY_ENABLED", False)

BOOKING_SLOT_MINUTES = int(os.environ.get("BOOKING_SLOT_MINUTES", "60"))
BOOKING_MAX_GUESTS_PER_SLOT = int(os.environ.get("BOOKING_MAX_GUESTS_PER_SLOT", "12"))
BOOKING_DAY_START = os.environ.get("BOOKING_DAY_START", "10:00")  # first slot
BOOKING_DAY_END = os.environ.get("BOOKING_DAY_END", "20:00")  # closing time

# ──────────────────────────────────────────────
# CORS
# ──────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
if PUBLIC_BASE_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append(PUBLIC_BASE_URL)

# ──────────────────────────────────────────────
# Celery
# ──────────────────────────────────────────────
CELERY_BROKER_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"
