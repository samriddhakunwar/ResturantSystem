"""
ESC/POS printing service for the Thermal Printer System module.

Provides formatting and dispatching logic for:
    - Kitchen tickets (order items for the kitchen)
    - Customer bills  (full order breakdown with totals)
    - Test pages      (connectivity check)

This service builds plain-text representations and dispatches
them to the appropriate printer via USB or LAN.
"""
import logging
from datetime import datetime

from apps.orders.models import Order

from .models import Printer, PrintJob

logger = logging.getLogger(__name__)

# ── ESC/POS constants ────────────────────────────────────────
ESC = "\x1b"
GS = "\x1d"
CUT_PAPER = f"{GS}VA"  # Full cut
BOLD_ON = f"{ESC}E\x01"
BOLD_OFF = f"{ESC}E\x00"
ALIGN_CENTER = f"{ESC}a\x01"
ALIGN_LEFT = f"{ESC}a\x00"
DOUBLE_HEIGHT = f"{ESC}!\x10"
NORMAL_SIZE = f"{ESC}!\x00"
FEED_LINES = f"{ESC}d\x03"  # Feed 3 lines


# ── Text formatters ──────────────────────────────────────────

def _separator(width: int = 48) -> str:
    """Return a dashed separator line."""
    return "-" * width


def _pad_row(left: str, right: str, width: int = 48) -> str:
    """Left-align left text, right-align right text within given width."""
    space = width - len(left) - len(right)
    if space < 1:
        space = 1
    return f"{left}{' ' * space}{right}"


def format_kitchen_ticket(order: Order, width: int = 48) -> str:
    """
    Build a plain-text kitchen ticket for an order.

    Layout:
        *** KITCHEN ORDER ***
        Order: ORD-000001
        Table: 5
        Time: 2026-06-08 21:30
        ------------------------------------------------
        2x  Chicken Momo
            > no onions
        1x  Buff Chowmein
        ------------------------------------------------
        Status: Pending
    """
    lines = []

    # Header
    lines.append(ALIGN_CENTER)
    lines.append(DOUBLE_HEIGHT)
    lines.append("*** KITCHEN ORDER ***")
    lines.append(NORMAL_SIZE)
    lines.append("")
    lines.append(ALIGN_LEFT)

    # Order info
    lines.append(f"Order:  {order.order_number}")
    if order.table_number:
        lines.append(f"Table:  {order.table_number}")
    lines.append(f"Time:   {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(_separator(width))

    # Items
    for item in order.items.select_related("menu_item").all():
        lines.append(f"{item.quantity}x  {item.menu_item.name}")
        if item.notes:
            lines.append(f"    > {item.notes}")

    lines.append(_separator(width))

    # Footer
    lines.append(f"Status: {order.get_status_display()}")
    if order.notes:
        lines.append(f"Notes:  {order.notes}")

    lines.append("")
    lines.append(FEED_LINES)
    lines.append(CUT_PAPER)

    return "\n".join(lines)


def format_customer_bill(order: Order, width: int = 48) -> str:
    """
    Build a plain-text customer bill for an order.

    Layout:
        RESTAURANT POS
        ------------------------------------------------
        Bill
        Order: ORD-000001          Table: 5
        Date:  2026-06-08 21:30
        ------------------------------------------------
        Item                               Qty    Total
        ------------------------------------------------
        Chicken Momo                         2   400.00
        Buff Chowmein                        1   200.00
        ------------------------------------------------
                                  Subtotal: Rs.600.00
                                     Total: Rs.600.00
        ------------------------------------------------
        Thank you! Please visit again.
    """
    lines = []

    # Header
    lines.append(ALIGN_CENTER)
    lines.append(DOUBLE_HEIGHT)
    lines.append("RESTAURANT POS")
    lines.append(NORMAL_SIZE)
    lines.append(_separator(width))
    lines.append(ALIGN_LEFT)

    # Order info
    lines.append(BOLD_ON)
    lines.append("Bill")
    lines.append(BOLD_OFF)
    table_info = f"Table: {order.table_number}" if order.table_number else ""
    lines.append(_pad_row(f"Order: {order.order_number}", table_info, width))
    lines.append(f"Date:  {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(_separator(width))

    # Column header
    lines.append(BOLD_ON)
    item_col = "Item"
    qty_col = "Qty"
    total_col = "Total"
    lines.append(
        f"{item_col:<{width - 14}}{qty_col:>4}  {total_col:>8}"
    )
    lines.append(BOLD_OFF)
    lines.append(_separator(width))

    # Items
    for item in order.items.select_related("menu_item").all():
        name = item.menu_item.name
        if len(name) > (width - 14):
            name = name[: (width - 17)] + "..."
        lines.append(
            f"{name:<{width - 14}}{item.quantity:>4}  {item.item_total:>8.2f}"
        )

    lines.append(_separator(width))

    # Totals
    lines.append(_pad_row("", f"Subtotal: Rs.{order.subtotal:.2f}", width))
    lines.append(BOLD_ON)
    lines.append(_pad_row("", f"Total: Rs.{order.total:.2f}", width))
    lines.append(BOLD_OFF)
    lines.append(_separator(width))

    # Footer
    lines.append(ALIGN_CENTER)
    lines.append("Thank you! Please visit again.")
    lines.append(ALIGN_LEFT)
    lines.append("")
    lines.append(FEED_LINES)
    lines.append(CUT_PAPER)

    return "\n".join(lines)


def format_test_page(printer: Printer, width: int = 48) -> str:
    """Build a simple test page to verify printer connectivity."""
    lines = [
        ALIGN_CENTER,
        DOUBLE_HEIGHT,
        "PRINTER TEST",
        NORMAL_SIZE,
        _separator(width),
        ALIGN_LEFT,
        f"Printer: {printer.name}",
        f"Type:    {printer.get_connection_type_display()}",
        f"Role:    {printer.get_role_display()}",
        f"Paper:   {printer.paper_width}mm",
        f"Time:    {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        _separator(width),
        ALIGN_CENTER,
        "If you can read this, the printer is working!",
        ALIGN_LEFT,
        "",
        FEED_LINES,
        CUT_PAPER,
    ]
    return "\n".join(lines)


# ── Dispatch logic ───────────────────────────────────────────

def _send_to_printer(printer: Printer, content: str) -> None:
    """
    Send raw content to a printer.

    For USB printers: uses python-escpos USB interface.
    For LAN printers: opens a raw TCP socket to the printer.

    Raises RuntimeError on failure.
    """
    if printer.connection_type == Printer.ConnectionType.USB:
        _send_usb(printer, content)
    elif printer.connection_type == Printer.ConnectionType.LAN:
        _send_lan(printer, content)
    else:
        raise RuntimeError(f"Unknown connection type: {printer.connection_type}")


def _send_usb(printer: Printer, content: str) -> None:
    """Send content to a USB ESC/POS printer via python-escpos."""
    try:
        from escpos.printer import Usb  # pyrefly: ignore

        vendor_id = int(printer.usb_vendor_id, 16)
        product_id = int(printer.usb_product_id, 16)

        p = Usb(vendor_id, product_id)
        p.text(content)
        p.close()
    except ImportError:
        raise RuntimeError(
            "python-escpos is not installed. "
            "Install it with: pip install python-escpos"
        )
    except Exception as e:
        raise RuntimeError(f"USB print failed: {e}")


def _send_lan(printer: Printer, content: str) -> None:
    """Send content to a LAN ESC/POS printer via raw TCP socket."""
    import socket

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        sock.connect((str(printer.ip_address), printer.port))
        sock.sendall(content.encode("utf-8", errors="replace"))
        sock.close()
    except Exception as e:
        raise RuntimeError(f"LAN print failed ({printer.ip_address}:{printer.port}): {e}")


# ── Public API ───────────────────────────────────────────────

def print_kitchen_ticket(order: Order, printer: Printer | None = None) -> PrintJob | None:
    """
    Format and send a kitchen ticket to the appropriate printer.

    If no printer is specified, picks the first active kitchen/both printer.
    Returns the created PrintJob instance.
    """
    if printer is None:
        printer = (
            Printer.objects.filter(
                is_active=True,
                role__in=[Printer.PrinterRole.KITCHEN, Printer.PrinterRole.BOTH],
            )
            .first()
        )
    if printer is None:
        # PrintJob.printer is a required FK, so there is nothing to log a job against.
        logger.warning("No active kitchen printer found for order %s", order.order_number)
        return None

    content = format_kitchen_ticket(order, width=printer.paper_width)

    job = PrintJob.objects.create(
        printer=printer,
        job_type=PrintJob.JobType.KITCHEN_TICKET,
        order=order,
        status=PrintJob.Status.PRINTING,
        content=content,
    )

    try:
        _send_to_printer(printer, content)
        job.status = PrintJob.Status.COMPLETED
        job.save(update_fields=["status", "updated_at"])
    except RuntimeError as e:
        job.status = PrintJob.Status.FAILED
        job.error_message = str(e)
        job.retry_count += 1
        job.save(update_fields=["status", "error_message", "retry_count", "updated_at"])
        logger.error("Kitchen ticket print failed: %s", e)

    return job


def print_customer_bill(order: Order, printer: Printer | None = None) -> PrintJob:
    """
    Format and send a customer bill to the appropriate printer.

    If no printer is specified, picks the first active billing/both printer.
    Returns the created PrintJob instance.
    """
    if printer is None:
        printer = (
            Printer.objects.filter(
                is_active=True,
                role__in=[Printer.PrinterRole.BILLING, Printer.PrinterRole.BOTH],
            )
            .first()
        )
    if printer is None:
        logger.warning("No active billing printer found for order %s", order.order_number)
        return None

    content = format_customer_bill(order, width=printer.paper_width)

    job = PrintJob.objects.create(
        printer=printer,
        job_type=PrintJob.JobType.CUSTOMER_BILL,
        order=order,
        status=PrintJob.Status.PRINTING,
        content=content,
    )

    try:
        _send_to_printer(printer, content)
        job.status = PrintJob.Status.COMPLETED
        job.save(update_fields=["status", "updated_at"])
    except RuntimeError as e:
        job.status = PrintJob.Status.FAILED
        job.error_message = str(e)
        job.retry_count += 1
        job.save(update_fields=["status", "error_message", "retry_count", "updated_at"])
        logger.error("Customer bill print failed: %s", e)

    return job


def print_test_page(printer: Printer) -> PrintJob:
    """
    Print a test page to verify printer connectivity.

    Returns the created PrintJob instance.
    """
    content = format_test_page(printer, width=printer.paper_width)

    job = PrintJob.objects.create(
        printer=printer,
        job_type=PrintJob.JobType.TEST_PAGE,
        status=PrintJob.Status.PRINTING,
        content=content,
    )

    try:
        _send_to_printer(printer, content)
        job.status = PrintJob.Status.COMPLETED
        job.save(update_fields=["status", "updated_at"])
    except RuntimeError as e:
        job.status = PrintJob.Status.FAILED
        job.error_message = str(e)
        job.retry_count += 1
        job.save(update_fields=["status", "error_message", "retry_count", "updated_at"])
        logger.error("Test page print failed: %s", e)

    return job
