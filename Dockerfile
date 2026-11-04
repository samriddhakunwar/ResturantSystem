# ─── Whisker & Brew backend (Django + gunicorn; also runs the Celery worker) ───
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.production

WORKDIR /app

COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/production.txt

COPY . .
RUN useradd --create-home app && mkdir -p /app/staticfiles /app/media && chown -R app /app
USER app

EXPOSE 8000
# Migrations and collectstatic run on start so the volumes are filled.
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3"]
