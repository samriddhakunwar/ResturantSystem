# Build a Production-Ready Restaurant POS Backend (Django)

You are a senior backend engineer.

Build a complete **restaurant POS backend system** using:

* Django 5+
* Django REST Framework
* PostgreSQL
* Docker + Docker Compose
* Celery + Redis (for background jobs)
* ESC/POS thermal printer support
* Swagger/OpenAPI documentation

This is a **single-owner, private restaurant system** (no authentication system, no multi-user support).

---

# 🚨 SYSTEM CONTEXT

* Only ONE restaurant owner uses the system
* Runs on local network or single machine
* No user accounts, no roles, no branches
* Fully manual operations (menu, orders, inventory, payments)
* Cash and online payments are manually recorded
* Thermal printer used for kitchen + billing

---

# 🧱 CORE MODULES

## 1. MENU MANAGEMENT

* Category
* MenuItem

Features:

* Add / edit / delete menu items
* Change price
* Enable/disable item
* Assign category

---

## 2. ORDER MANAGEMENT

* Order
* OrderItem

Features:

* Create order manually
* Edit order
* Delete order
* Calculate total automatically
* Track status:

  * Pending
  * Preparing
  * Completed
  * Cancelled

When order is created:

* Send to kitchen printer automatically

---

## 3. BILLING SYSTEM

* Bill
* Payment

Features:

* Generate bill from order
* Add tax, discount, service charge
* Print bill via thermal printer
* Mark payment manually:

  * Cash
  * eSewa
  * Khalti
  * Card
  * Bank transfer

---

## 4. INVENTORY MANAGEMENT

* InventoryItem
* StockMovement
* InventoryExpense

Features:

* Add stock manually
* Update stock quantity
* Track stock movements:

  * Purchase
  * Usage
  * Waste
  * Adjustment

### Inventory Expense Tracking (IMPORTANT)

Each inventory cost must be recorded:

* purchase cost
* waste cost
* adjustment cost

Fields:

* quantity
* unit_cost
* total_cost
* expense_type

---

## 5. REPORTING SYSTEM

### DAILY REPORTS (computed live)

* Total orders today
* Total revenue today (from bills)
* Total expenses today (from inventory expenses)
* Total profit today

### MONTHLY REPORTS (stored in DB)

Create a table:

#### MonthlyReport

* month (YYYY-MM)
* total_orders
* total_revenue
* total_expenses
* total_profit

A scheduled job (Celery beat) must:

* Generate monthly report automatically on 1st of each month
* Save it permanently in DB

---

## 6. THERMAL PRINTER SYSTEM (ESC/POS)

Implement printing service for:

### Kitchen Ticket

* Order number
* Items
* Quantity
* Status

### Customer Bill

* Order breakdown
* Tax / discount
* Total amount
* Payment method

Use ESC/POS compatible printer libraries.

Support:

* USB printer
* LAN printer

---

## 7. DATABASE ENTITIES

### Core

* Category
* MenuItem
* Order
* OrderItem
* Bill
* Payment

### Inventory

* InventoryItem
* StockMovement
* InventoryExpense

### Reporting

* MonthlyReport

---

## 8. BUSINESS LOGIC RULES

* Order creates OrderItems
* Order generates Bill
* Bill generates Payment record
* Inventory is NOT auto-deducted (manual only)
* Expenses are manually recorded
* Profit = Revenue - Expenses

---

## 9. REPORTING REQUIREMENTS

Implement APIs for:

### Daily

* /reports/daily-sales
* /reports/daily-orders
* /reports/daily-expenses
* /reports/daily-profit

### Monthly

* /reports/monthly
* /reports/monthly/{month}

---

## 10. PROJECT STRUCTURE

Use modular Django apps:

apps/

* menu/
* orders/
* billing/
* inventory/
* reports/
* printers/

---

## 11. DELIVERABLES

1. Full Django backend project
2. PostgreSQL schema + migrations
3. Docker setup
4. Celery + Redis setup
5. Swagger API documentation
6. Printer integration service (ESC/POS)
7. Seed data
8. Clean modular architecture
9. Production-ready code structure

---

## 12. QUALITY REQUIREMENTS

* Clean architecture
* SOLID principles
* RESTful API design
* Optimized queries
* Scalable structure
* No unnecessary complexity (single-owner system)

---

Build this as a **real-world restaurant POS backend system**, not a demo.
