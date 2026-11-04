# Whisker & Brew — Cat Café System

A cat café's whole counter on one machine: a **staff POS and dashboard** and a **guest QR menu** that people open from the code on their table.

* Django 5+ and Django REST Framework (backend)
* React 19, Vite and Tailwind, styled with the Whisker & Brew UI kit in `frontend/src/ui-kit/` (frontend)
* PostgreSQL (SQLite for local dev)
* Celery + Redis (background printing and nightly reports)
* ESC/POS thermal printer support
* Docker + Docker Compose
* Swagger / OpenAPI documentation

This is a **single-owner café system**: one set of staff accounts, no roles, no branches. Prices are in NPR (Rs.), with Nepal's 10% service charge and 13% VAT.

| Guest QR menu | Cart | Order status | Book a visit |
|---|---|---|---|
| ![QR menu](docs/screenshots/guest-qr-menu.png) | ![Cart](docs/screenshots/guest-cart.png) | ![Order status](docs/screenshots/guest-order-status.png) | ![Booking](docs/screenshots/guest-book.png) |

| Kitchen board | Tables & QR | Table cards |
|---|---|---|
| ![Kitchen](docs/screenshots/staff-kitchen.png) | ![Tables](docs/screenshots/staff-tables.png) | ![Table cards](docs/screenshots/staff-table-cards.png) |

---

## How it fits together

```
 Guest's phone ──┐                         ┌── Staff browser (/staff)
 (café Wi-Fi)    │   one origin, e.g.      │   login → token
                 ▼   http://192.168.1.20   ▼
              ┌────────────────────────────────┐
              │ Vite dev server (dev)          │   /api, /media → Django
              │ or nginx container (Docker)    │   everything else → React app
              └───────────────┬────────────────┘
                              ▼
              Django + DRF  ──  Postgres / SQLite
                    │
                    └── Celery worker ──► thermal printers (kitchen tickets, bills)
```

* **Guest pages** (`/`, `/menu`, `/cats`, `/book`, `/t/<table token>`) need no login. They only call `/api/v1/public/*`, which is rate-limited per IP.
* **Staff pages** live under `/staff` and call every other endpoint with `Authorization: Token <token>`.
* The frontend and the API share **one origin**, so a phone on the café Wi-Fi only needs the café machine's address. In development the Vite proxy does this; in Docker, nginx does.

---

## Getting started (local development)

You need Python 3.12+ and Node 20+.

```bash
# Backend
python -m venv .venv
.venv/Scripts/activate            # Windows; on macOS/Linux: source .venv/bin/activate
pip install -r requirements/development.txt
python manage.py migrate
python manage.py createsuperuser  # your staff login
python manage.py seed_cat_cafe    # demo menu, 6 cats, 8 tables, a few bookings
python manage.py runserver 0.0.0.0:8000

# Frontend (second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                       # http://localhost:5173, also on your LAN IP
```

* **Guest site:** http://localhost:5173
* **Staff:** http://localhost:5173/staff (sign in with the superuser)
* **API docs:** http://localhost:8000/api/docs/
* **Django admin:** http://localhost:8000/admin/

`seed_cat_cafe` is idempotent, so you can run it again safely. It updates the demo rows in place and leaves your own data alone.

### Trying it on a phone

1. Find your machine's LAN IP, for example `192.168.1.20`.
2. Set `PUBLIC_BASE_URL=http://192.168.1.20:5173` for Django and restart `runserver`. Table QR codes encode `{PUBLIC_BASE_URL}/t/{token}`; if it says `localhost`, the phone will try to open itself. The `tables.W001` system check warns while it is still `localhost`.
3. Open **Staff → Tables & QR** and scan a table's code with the phone.

> **Note:** Django does not read `.env` files. Export the variables in your shell (or your process manager) before `runserver`. Docker Compose does read `.env` (see below).

---

## Running with Docker

```bash
cp .env.example .env        # then edit it (see below)
docker compose up --build
docker compose exec web python manage.py createsuperuser
docker compose exec web python manage.py seed_cat_cafe   # optional demo data
```

Open `http://<this machine's LAN IP>:8080`.

Compose runs these services:
* `db`: Postgres 16
* `redis`
* `web`: Django + gunicorn; runs migrations and `collectstatic` on start
* `worker`: Celery, prints tickets
* `beat`: Celery Beat, nightly reports
* `frontend`: nginx with the built React app; proxies `/api` and `/admin`, and serves `/media` and `/static`

For Docker, set at least these in `.env`:

```
DJANGO_SECRET_KEY=<a long random string>
PUBLIC_BASE_URL=http://192.168.1.20:8080
ALLOWED_HOSTS=192.168.1.20,localhost
DJANGO_HTTPS=false          # plain HTTP on the café LAN
POSTGRES_PASSWORD=<something>
```

* **USB printers** need the device passed through to the `worker` container (`devices:` in compose). LAN printers work as they are.
* The Docker files are new in this release and haven't been run on a machine with Docker yet. If something is off, `docker compose logs web` is the first place to look.

---

## Environment variables

All backend variables are listed with comments in `.env.example`. The ones you'll actually change:

| Variable | Default | What it does |
|---|---|---|
| `DJANGO_SECRET_KEY` | dev key | Required in production. |
| `DATABASE_URL` | SQLite | `postgres://user:pass@host:5432/db` |
| `PUBLIC_BASE_URL` | `http://localhost:5173` | The address guests' phones use. Encoded in every table QR code. **Use the LAN IP or domain.** Also added to CORS. |
| `CAFE_NAME`, `CAFE_TAGLINE`, `CAFE_WIFI` | Whisker & Brew… | Shown on the guest pages and printed table cards. |
| `CAFE_OPENING_HOURS` | `Mon–Fri 10:00–20:00;Sat–Sun 09:00–21:00` | Lines separated by `;`. |
| `CAFE_FACEBOOK_URL`, `CAFE_INSTAGRAM_URL`, `CAFE_TIKTOK_URL` | empty | Footer links; empty ones are hidden. |
| `BOOKING_SLOT_MINUTES`, `BOOKING_MAX_GUESTS_PER_SLOT`, `BOOKING_DAY_START`, `BOOKING_DAY_END` | 60, 12, 10:00, 20:00 | Booking slots and capacity. |
| `KITCHEN_AUTO_PRINT_POS` | false | Also print a kitchen ticket for staff-entered POS orders. QR orders print when staff confirm them. |
| `CELERY_ENABLED` | false | Send printing to the Celery worker. Off (or broker down) → prints in the request. |
| `PUBLIC_THROTTLE_RATE` | 120/min | Per-IP limit for guest endpoints. **If the server is hosted outside the café**, every guest on the café Wi-Fi shares one public IP and each order page polls 12 times a minute, so raise this (for example `1200/min`). On the café LAN, each phone has its own IP. |
| `LOGIN_THROTTLE_RATE` | 10/min | Staff login attempts per IP. |
| `DJANGO_HTTPS` | true | Production only: HTTPS redirect, secure cookies, HSTS. Set `false` for a plain-HTTP LAN. |

Frontend variables (`frontend/.env.example`):
* `VITE_API_URL`: normally `/api/v1`. **Leave it empty** to run the staff dashboard as an offline demo on bundled mock data. The guest pages need the API.
* `VITE_BACKEND_URL`: where the dev proxy forwards to. Default `http://127.0.0.1:8000`; use the IP, not `localhost`, because Node may resolve `localhost` to IPv6.

---

## The guest flow

1. The guest scans the QR card on their table and lands on `/t/<token>`, which shows "Table 4 · Whisker & Brew". Cats in the room today appear across the top.
2. They search, filter (veg, vegan, gluten-free, no nuts, no dairy) and jump between categories. Sold-out items stay visible as "Napping · sold out".
3. "+" adds to the cart. The cart is a bottom sheet with quantities, a note per item, a note for the kitchen, and the total including service charge and VAT. It survives a refresh; it's saved on the phone per table.
4. **Send to kitchen** creates a QR order. Prices always come from the server; the phone only sends item ids and quantities.
5. The order page shows Received → Confirmed → Brewing → Ready → Served and refreshes every 5 s. It has **Call staff**, **Request bill** and **Water please** buttons, plus **Order more**.

Elsewhere: `/cats` lists the cats, and each cat page has an adoption enquiry form for cats looking for a home. `/book` books a visit with live spots per slot. The server re-checks capacity under a lock, so two guests can't take the last places.

## The staff flow

* **Kitchen:** new QR orders chime (you can mute it) and show a notice. **Confirm & print** accepts the order and prints the kitchen ticket. Then **Start brewing → Ready → Served**. QR orders can't start until confirmed.
* **Service Requests:** guests' calls. The sidebar badge shows how many are open.
* **Tables & QR:** add tables, switch one off, or make a **New QR** (the old printed card stops working). Download PNG/SVG, or **Print table cards** for A6 cards, four per A4 sheet.
* **Cats:** profiles with a photo, the "in the room today" toggle (set it each morning), and the adoption enquiries inbox.
* **Bookings:** one day at a time, with each slot's capacity and Confirm / Arrived / No-show / Cancel.
* **Menu:** as before, plus dietary tags, "featured" and the cat that recommends an item.
* **New Order (POS), Orders, Billing, Expenses, Settings:** the existing POS flows. Staff POS orders are confirmed immediately.

### Printing table QR cards

1. Set `PUBLIC_BASE_URL` to the address phones will use.
2. Go to **Staff → Tables & QR → Print table cards**, then **Print**. Use A4 at 100% scale and cut along the dashed lines.
3. If you change `PUBLIC_BASE_URL` later, reprint. If you press **New QR** on a table, reprint that card.

---

## Core Modules

### 1. Menu Management

**Models:** `Category`, `MenuItem`

* Add / edit / delete menu items and categories
* Change price, enable/disable items (disabled items show as sold out to guests)
* Dietary tags (`veg`, `vegan`, `gluten_free`, `contains_nuts`, `contains_dairy`), `is_featured`, and `recommended_by` (a cat)

### 2. Order Management

**Models:** `Order`, `OrderItem`

* Create, edit, and cancel orders; totals are calculated automatically
* Status: `Pending → Preparing → Ready → Served → Completed`, or `Cancelled`
* `source` is `pos` (staff) or `qr` (guest). QR orders wait in Pending until staff **confirm** them, which prints the kitchen ticket.
* Each order has a `public_id` (UUID) for the guest's status page

### 3. Billing System

**Models:** `Bill`, `Payment`

* Generate a bill from a completed order
* Apply tax (13% Nepal VAT default), discount, and service charge (10% default)
* Print customer bill via thermal printer
* Manually record payments: Cash, eSewa, Khalti, Card, Bank Transfer
* Auto-marks bill as paid once total payments ≥ grand total

### 4. Reporting System

**Models:** `DailySalesReport`

* **Daily sales reports**: generated nightly by Celery Beat
* **Monthly summary**: aggregated view of daily reports per month
* **Manual generation** via API or management command

```bash
python manage.py generate_daily_report               # yesterday
python manage.py generate_daily_report --date 2026-06-01
python manage.py generate_daily_report --range 2026-06-01 2026-06-30
```

### 5. Thermal Printer System (ESC/POS)

**Models:** `Printer`, `PrintJob`

* USB and LAN (network) printers
* **Kitchen Ticket**: order number, items, quantities
* **Customer Bill**: order breakdown, tax, discount, total, payment method
* Print jobs run after the database commit, on the Celery worker when `CELERY_ENABLED` is on (otherwise in the request), with retry on failure

### 6. Expenses

**Models:** `Expense` (ingredients, labor, utilities, rent, other). Feeds the dashboard's expenses chart.

### 7. Tables & service requests

**Models:** `Table` (number, label, seats, `qr_token`, active), `ServiceRequest` (call staff / request bill / water; open → resolved)

### 8. Cats

**Models:** `Cat` (profile, photo, up to three personality tags, adoption status, `is_present_today`), `AdoptionEnquiry` (new → contacted → closed)

### 9. Bookings

**Models:** `Booking` (party size incl. children, rules accepted, status), `BookingSlot` (a lock row per date and slot, used to stop overbooking)

---

## Payment Flow

```
Order created (POS) or confirmed (QR)
  → Kitchen ticket printed
  → Bill generated from order
  → Payments recorded manually
  → Bill auto-marked paid when payments cover grand total
  → Customer bill printed
```

---

## API Endpoints

All endpoints are under `/api/v1/`. Staff endpoints need `Authorization: Token <token>`. Full schema: `GET /api/docs/` (Swagger UI).

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `auth/login/` | `{username, password}` → `{token, user}` (rate-limited) |
| `POST` | `auth/logout/` | Revoke the token |
| `GET` | `auth/me/` | The signed-in user |

Staff accounts are made with `createsuperuser` or in the Django admin. There are no roles.

### Guest (no login, rate-limited)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `public/config/` | Café name, hours, Wi-Fi, socials, booking settings |
| `GET` | `public/menu/` | Active categories and items (sold-out items flagged) |
| `GET` | `public/tables/{token}/` | Table label for a QR token (404 if unknown or off) |
| `POST` | `public/tables/{token}/orders/` | Place an order `{items: [{menu_item, quantity, notes}], notes}` |
| `POST` | `public/tables/{token}/service-requests/` | `{type: call_staff \| request_bill \| water}` |
| `GET` | `public/orders/{public_id}/` | Order status, items and charges |
| `GET` | `public/cats/` | Cats (not adopted); `?available=1`, `?present=1` |
| `GET` | `public/cats/{slug}/` | One cat |
| `POST` | `public/cats/{slug}/enquiries/` | Adoption enquiry |
| `GET` | `public/bookings/available-slots/?date=` | Slots with booked / capacity / remaining |
| `POST` | `public/bookings/` | Book a visit |

### Staff
| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `menu/categories/` | List / create categories |
| `GET/PUT/PATCH/DELETE` | `menu/categories/{id}/` | Category detail |
| `GET/POST` | `menu/menu-items/` | List / create menu items |
| `GET/PUT/PATCH/DELETE` | `menu/menu-items/{id}/` | Menu item detail |
| `GET/POST` | `orders/orders/` | List / create orders (filters: `status__in`, `source`, `table`, `created_at__date`…) |
| `GET/PUT/PATCH/DELETE` | `orders/orders/{id}/` | Order detail |
| `PATCH` | `orders/orders/{id}/update-status/` | Change status (transitions validated) |
| `POST` | `orders/orders/{id}/confirm/` | Accept a QR order and print its ticket |
| `GET` | `orders/orders/kitchen/` | Active orders with items, for the kitchen board |
| `GET/POST` | `billing/bills/` | List / create bills |
| `PATCH` | `billing/bills/{id}/mark-paid/` | Manually mark bill as paid |
| `GET/POST` | `billing/payments/` | List / create payments |
| `GET` | `reports/daily/` | Daily sales reports (`monthly-summary/`, `generate/`) |
| `GET/POST` | `printers/printers/` | Printers |
| `GET/POST` | `printers/print-jobs/` | Print jobs |
| `GET/POST` | `expenses/expenses/` | Expenses (`monthly-breakdown/?year=`) |
| `GET/POST` | `tables/` | Tables |
| `GET/PATCH/DELETE` | `tables/{id}/` | Table detail |
| `POST` | `tables/{id}/regenerate-token/` | New QR token (old cards stop working) |
| `GET` | `tables/{id}/qr.png`, `tables/{id}/qr.svg` | QR image (`?download=1` to save) |
| `GET` | `tables/service-requests/` | Service requests (`?status=open`) |
| `POST` | `tables/service-requests/{id}/resolve/` | Mark handled |
| `GET/POST` | `cats/` | Cats (multipart for photos) |
| `GET/PATCH/DELETE` | `cats/{id}/` | Cat detail |
| `GET/PATCH/DELETE` | `cats/enquiries/`, `cats/enquiries/{id}/` | Adoption enquiries |
| `GET/PATCH/DELETE` | `bookings/`, `bookings/{id}/` | Bookings (filters: `date`, `status`) |

---

## Project Structure

```
apps/
├── menu/        — Category, MenuItem
├── orders/      — Order, OrderItem
├── billing/     — Bill, Payment
├── reports/     — DailySalesReport
├── printers/    — Printer, PrintJob
├── expenses/    — Expense
├── accounts/    — staff token login / logout / me
├── tables/      — Table, ServiceRequest, QR rendering
├── cats/        — Cat, AdoptionEnquiry
├── bookings/    — Booking, BookingSlot, capacity rules
└── cafe/        — the public guest API and `seed_cat_cafe`

config/          — settings (base / development / production), urls, celery
utils/           — TimeStampedModel base, pagination

frontend/src/
├── ui-kit/      — the Whisker & Brew UI kit (tokens, CSS, artwork, specs)
├── components/  — ui/ (kit components), decor/ (cats, doodles, paws), staff components
├── pages/       — staff pages; public/ for the guest pages
├── layouts/     — MainLayout (staff), PublicLayout (guests)
├── context/     — PosContext, StaffContext, CafeConfigContext
└── api/         — client (token, errors), index (POS), staff, public
```

In development, `/styleguide` shows every kit component; it isn't included in production builds.

---

## Tests and checks

```bash
python manage.py test        # backend
cd frontend && npm run lint && npm run build
```

The concurrent-booking test needs Postgres (`select_for_update`). It is skipped on SQLite.

---

## Known gaps / TODO

* **Dark mode:** the kit is light-only; there was no theme toggle to carry over. A dark palette would need new kit tokens.
* **Docker** setup hasn't been run on a machine with Docker yet (see above).
* **Static files:** in production, nginx serves them from a shared volume; WhiteNoise is installed but not wired in.
* **Sound alerts:** browsers only play sound after someone has clicked the page once. Keep the Kitchen tab open after signing in.
