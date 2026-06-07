"""
Development settings for Restaurant POS System.
"""
from .base import *  # noqa: F401, F403

# ──────────────────────────────────────────────
# Debug
# ──────────────────────────────────────────────
DEBUG = True

ALLOWED_HOSTS = ["*"]

# ──────────────────────────────────────────────
# CORS — allow everything in development
# ──────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True

# ──────────────────────────────────────────────
# Django Debug Toolbar
# ──────────────────────────────────────────────
try:
    import debug_toolbar  # noqa: F401  # pyrefly: ignore

    INSTALLED_APPS += ["debug_toolbar"]  # noqa: F405
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")  # noqa: F405
    INTERNAL_IPS = ["127.0.0.1"]
except ImportError:
    pass

# ──────────────────────────────────────────────
# Email — console backend for local dev
# ──────────────────────────────────────────────
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
