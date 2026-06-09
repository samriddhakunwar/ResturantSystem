"""
Models for the Thermal Printer System module.

Entities:
    - Printer: configuration for a physical thermal printer (USB or LAN).
    - PrintJob: a log entry for every print attempt with status tracking.
"""
from django.db import models

from utils.models import TimeStampedModel


class Printer(TimeStampedModel):
    """Configuration for a physical ESC/POS thermal printer."""

    class ConnectionType(models.TextChoices):
        USB = "usb", "USB"
        LAN = "lan", "LAN (Network)"

    class PrinterRole(models.TextChoices):
        KITCHEN = "kitchen", "Kitchen"
        BILLING = "billing", "Billing"
        BOTH = "both", "Kitchen & Billing"

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Human-readable printer name (e.g. 'Kitchen Printer').",
    )
    connection_type = models.CharField(
        max_length=5,
        choices=ConnectionType.choices,
        default=ConnectionType.USB,
        help_text="How this printer is connected.",
    )
    # USB settings
    usb_vendor_id = models.CharField(
        max_length=10,
        blank=True,
        default="",
        help_text="USB Vendor ID in hex (e.g. '0x04b8'). Required for USB printers.",
    )
    usb_product_id = models.CharField(
        max_length=10,
        blank=True,
        default="",
        help_text="USB Product ID in hex (e.g. '0x0202'). Required for USB printers.",
    )
    # LAN settings
    ip_address = models.GenericIPAddressField(
        blank=True,
        null=True,
        help_text="IP address for LAN printers (e.g. '192.168.1.100').",
    )
    port = models.PositiveIntegerField(
        default=9100,
        help_text="Network port for LAN printers (default: 9100).",
    )
    # Printer role & config
    role = models.CharField(
        max_length=10,
        choices=PrinterRole.choices,
        default=PrinterRole.BOTH,
        help_text="What this printer is used for.",
    )
    paper_width = models.PositiveIntegerField(
        default=80,
        help_text="Paper width in mm (typically 58 or 80).",
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Inactive printers are skipped during print jobs.",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.get_connection_type_display()})"


class PrintJob(TimeStampedModel):
    """A log entry for every print attempt."""

    class JobType(models.TextChoices):
        KITCHEN_TICKET = "kitchen_ticket", "Kitchen Ticket"
        CUSTOMER_BILL = "customer_bill", "Customer Bill"
        TEST_PAGE = "test_page", "Test Page"

    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        PRINTING = "printing", "Printing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    printer = models.ForeignKey(
        Printer,
        on_delete=models.CASCADE,
        related_name="jobs",
        help_text="The printer that handled (or will handle) this job.",
    )
    job_type = models.CharField(
        max_length=20,
        choices=JobType.choices,
        help_text="Type of document printed.",
    )
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="print_jobs",
        help_text="The order associated with this print job (if any).",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.QUEUED,
        db_index=True,
        help_text="Current status of this print job.",
    )
    content = models.TextField(
        blank=True,
        default="",
        help_text="Plain-text representation of what was printed.",
    )
    error_message = models.TextField(
        blank=True,
        default="",
        help_text="Error details if the job failed.",
    )
    retry_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of retry attempts.",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return (
            f"{self.get_job_type_display()} — "
            f"{self.printer.name} ({self.get_status_display()})"
        )
