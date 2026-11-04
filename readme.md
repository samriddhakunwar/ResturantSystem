# Restaurant POS Backend (Django)

A production-ready **Restaurant Point-of-Sale backend system** built with:

* Django 5+
* Django REST Framework
* PostgreSQL (SQLite for local dev)
* Docker + Docker Compose
* Celery + Redis (background jobs)
* ESC/POS thermal printer support
* Swagger / OpenAPI documentation

This is a **single-owner café system**: one set of staff accounts, no roles, no branches.

### Authentication

Guests reach the server from their phones over the café Wi-Fi (via table QR codes), so **every staff endpoint requires a login**.

* Staff accounts are created with `python manage.py createsuperuser` or in the Django admin. There is no role system.
* `POST /api/v1/auth/login/` with `{"username", "password"}` returns `{"token", "user"}`. Send it as `Authorization: Token <token>`.
* `POST /api/v1/auth/logout/` revokes the token; `GET /api/v1/auth/me/` returns the signed-in user.
* Only `/api/v1/public/*` (the guest QR menu, cats and bookings) is open, and it is rate-limited per IP.

---

## System Context

* Single restaurant owner uses the system
* Runs on a local network or single machine
* Staff log in with a token; no roles
* Fully manual operations (menu, orders, payments)
* Cash and online payments are manually recorded
* Thermal printer used for kitchen tickets and customer bills

---

## Core Modules

### 1. Menu Management

**Models:** `Category`, `MenuItem`

* Add / edit / delete menu items and categories
* Change price, enable/disable items
* Assign items to categories

---

### 2. Order Management

**Models:** `Order`, `OrderItem`

* Create, edit, and cancel orders
* Auto-calculate order totals
* Track order status: `Pending → Preparing → Completed / Cancelled`
* Automatically sends kitchen ticket to thermal printer on order creation

---

### 3. Billing System

**Models:** `Bill`, `Payment`

* Generate a bill from a completed order
* Apply tax (13% Nepal VAT default), discount, and service charge (10% default)
* Print customer bill via thermal printer
* Manually record payments:
  * Cash
  * eSewa
  * Khalti
  * Card
  * Bank Transfer
* Auto-marks bill as paid once total payments ≥ grand total

---

### 4. Reporting System

**Models:** `DailySalesReport`

* **Daily sales reports** — auto-generated via Celery Beat (nightly)
* **Monthly summary** — aggregated view of daily reports per month
* **Manual generation** via API or management command

Celery Beat schedules nightly report generation automatically.

**Management command:**
```bash
python manage.py generate_daily_report               # yesterday
python manage.py generate_daily_report --date 2026-06-01
python manage.py generate_daily_report --range 2026-06-01 2026-06-30
```

---

### 5. Thermal Printer System (ESC/POS)

**Models:** `Printer`, `PrintJob`

Supports:
* USB printers
* LAN (network) printers

Prints:
* **Kitchen Ticket** — order number, items, quantities
* **Customer Bill** — order breakdown, tax, discount, total, payment method

Print jobs are processed asynchronously with automatic retry on failure.

---

## Payment Flow

```
Order Created
  → Kitchen ticket printed automatically
  → Bill generated from order
  → Payments recorded manually
  → Bill auto-marked paid when payments cover grand total
  → Customer bill printed
```

---

## Database Entities

### Core
| Entity | App | Description |
|---|---|---|
| `Category` | menu | Menu item groupings |
| `MenuItem` | menu | Individual dishes / products |
| `Order` | orders | Customer orders |
| `OrderItem` | orders | Line items within an order |
| `Bill` | billing | Generated bill from an order |
| `Payment` | billing | Payment records against a bill |

### Reporting
| Entity | App | Description |
|---|---|---|
| `DailySalesReport` | reports | Pre-computed daily sales snapshot |

### Printers
| Entity | App | Description |
|---|---|---|
| `Printer` | printers | Registered printer devices |
| `PrintJob` | printers | Print job records with status and retries |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/v1/menu/categories/` | List / create categories |
| `GET/PUT/DELETE` | `/api/v1/menu/categories/{id}/` | Retrieve / update / delete category |
| `GET/POST` | `/api/v1/menu/items/` | List / create menu items |
| `GET/PUT/DELETE` | `/api/v1/menu/items/{id}/` | Retrieve / update / delete menu item |
| `GET/POST` | `/api/v1/orders/orders/` | List / create orders |
| `GET/PUT/DELETE` | `/api/v1/orders/orders/{id}/` | Retrieve / update / delete order |
| `GET/POST` | `/api/v1/billing/bills/` | List / create bills |
| `GET/PUT/DELETE` | `/api/v1/billing/bills/{id}/` | Retrieve / update / delete bill |
| `PATCH` | `/api/v1/billing/bills/{id}/mark-paid/` | Manually mark bill as paid |
| `GET/POST` | `/api/v1/billing/payments/` | List / create payments |
| `GET/DELETE` | `/api/v1/billing/payments/{id}/` | Retrieve / delete payment |
| `GET` | `/api/v1/reports/daily/` | List daily sales reports |
| `GET` | `/api/v1/reports/daily/{id}/` | Single daily report |
| `GET` | `/api/v1/reports/daily/monthly-summary/` | Aggregated monthly view |
| `POST` | `/api/v1/reports/daily/generate/` | Manually trigger report generation |
| `GET/POST` | `/api/v1/printers/printers/` | List / create printers |
| `GET/POST` | `/api/v1/printers/jobs/` | List / create print jobs |

**API Documentation:** `GET /api/docs/` (Swagger UI)

---

## Project Structure

```
apps/
├── menu/        — Category, MenuItem
├── orders/      — Order, OrderItem
├── billing/     — Bill, Payment
├── reports/     — DailySalesReport
└── printers/    — Printer, PrintJob

config/
├── settings/
│   ├── base.py
│   ├── development.py
│   └── production.py
├── urls.py
├── celery.py
├── asgi.py
└── wsgi.py

utils/
├── models.py    — TimeStampedModel base
└── pagination.py
```

---

## Setup

### Local development

```bash
pip install -r requirements/development.txt
python manage.py migrate
python manage.py runserver
```

### Docker

```bash
docker-compose up --build
```

### Environment variables

Copy `.env.example` to `.env` and set:

```
DJANGO_SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/restaurant_pos
REDIS_URL=redis://localhost:6379/0
```

---

## Quality Standards

* Clean modular Django app architecture
* RESTful API design with DRF
* OpenAPI / Swagger documentation auto-generated
* Optimised queryset usage (`select_related`, `prefetch_related`)
* Background task processing via Celery
* Idempotent daily report generation
* Production-ready Docker + PostgreSQL setup
