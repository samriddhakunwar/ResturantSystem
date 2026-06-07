# Config package — Celery app is loaded here for autodiscovery.
try:
    from .celery import app as celery_app

    __all__ = ["celery_app"]
except ImportError:
    # Celery is not installed (e.g. local dev without Redis).
    # The app will still work, just without background task support.
    celery_app = None
    __all__ = []
