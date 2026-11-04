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
# DJANGO_HTTPS=false for a plain-HTTP café LAN (phones on the Wi-Fi hitting
# http://192.168.x.x). Keep it on (the default) anywhere reachable from outside.
HTTPS = env_bool("DJANGO_HTTPS", True)  # noqa: F405

SECURE_SSL_REDIRECT = HTTPS
SESSION_COOKIE_SECURE = HTTPS
CSRF_COOKIE_SECURE = HTTPS
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31_536_000 if HTTPS else 0  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = HTTPS
SECURE_HSTS_PRELOAD = HTTPS
# Behind the nginx container, which sets X-Forwarded-Proto.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", PUBLIC_BASE_URL)  # noqa: F405

# ──────────────────────────────────────────────
# Disable Browsable API in production
# ──────────────────────────────────────────────
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [  # noqa: F405
    "rest_framework.renderers.JSONRenderer",
]
