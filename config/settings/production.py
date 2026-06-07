"""
Production settings for Restaurant POS System.
"""
import os

from .base import *  # noqa: F401, F403

# ──────────────────────────────────────────────
# Security
# ──────────────────────────────────────────────
DEBUG = False

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")

SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

# ──────────────────────────────────────────────
# HTTPS / Security headers
# ──────────────────────────────────────────────
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31_536_000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# ──────────────────────────────────────────────
# CORS — restrict in production
# ──────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",")

# ──────────────────────────────────────────────
# Disable Browsable API in production
# ──────────────────────────────────────────────
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [  # noqa: F405
    "rest_framework.renderers.JSONRenderer",
]
