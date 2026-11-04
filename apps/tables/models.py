"""
Models for the Tables & QR module.

Entities:
    - Table: a physical café table with a secret QR token guests scan.
    - ServiceRequest: a guest asking for staff, the bill or water from their table.
"""
import uuid

from django.core.validators import MinValueValidator
from django.db import models

from utils.models import TimeStampedModel


class Table(TimeStampedModel):
    """A café table. Its QR code encodes ``{PUBLIC_BASE_URL}/t/{qr_token}``."""

    number = models.PositiveIntegerField(
        unique=True,
        validators=[MinValueValidator(1)],
        help_text="Table number printed on the table tent.",
    )
    label = models.CharField(
        max_length=50,
        blank=True,
        default="",
        help_text="Optional display name (e.g. 'Window nook'). Defaults to 'Table N'.",
    )
    seats = models.PositiveSmallIntegerField(
        default=4,
        help_text="Number of seats.",
    )
    qr_token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        help_text="Secret token in the table's QR code. Regenerate it if a code leaks.",
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Inactive tables reject QR orders.",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["number"]

    def __str__(self) -> str:
        return self.display_label

    @property
    def display_label(self) -> str:
        return self.label or f"Table {self.number}"

    def regenerate_token(self) -> None:
        """Issue a new QR token; every printed code for this table stops working."""
        self.qr_token = uuid.uuid4()
        self.save(update_fields=["qr_token", "updated_at"])


class ServiceRequest(TimeStampedModel):
    """A guest at a table asking staff for something."""

    class Type(models.TextChoices):
        CALL_STAFF = "call_staff", "Call staff"
        REQUEST_BILL = "request_bill", "Request bill"
        WATER = "water", "Water please"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        RESOLVED = "resolved", "Resolved"

    table = models.ForeignKey(
        Table,
        on_delete=models.CASCADE,
        related_name="service_requests",
        help_text="The table asking.",
    )
    type = models.CharField(
        max_length=20,
        choices=Type.choices,
        help_text="What the guest wants.",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.OPEN,
        db_index=True,
        help_text="Open until a staff member resolves it.",
    )
    resolved_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When staff resolved the request.",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.table} — {self.get_type_display()} ({self.get_status_display()})"
