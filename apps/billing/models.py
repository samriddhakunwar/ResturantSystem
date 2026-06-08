"""
Models for the Billing System module.

Entities:
    - Bill: generated from an order with tax, discount, and service charge calculations.
    - Payment: a manual payment record against a bill (cash, eSewa, Khalti, card, bank transfer).
"""
from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from utils.models import TimeStampedModel


class Bill(TimeStampedModel):
    """A bill generated from a completed or active order."""

    bill_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text="Auto-generated bill number (e.g. BILL-000001).",
    )
    order = models.OneToOneField(
        "orders.Order",
        on_delete=models.PROTECT,
        related_name="bill",
        help_text="The order this bill is generated from.",
    )
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        editable=False,
        help_text="Snapshotted from the order subtotal.",
    )

    # ── Tax ───────────────────────────────────────
    tax_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("13.00"),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Tax percentage (default: 13% Nepal VAT).",
    )
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        editable=False,
        help_text="Calculated tax amount.",
    )

    # ── Discount ──────────────────────────────────
    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Discount percentage.",
    )
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        editable=False,
        help_text="Calculated discount amount.",
    )

    # ── Service charge ────────────────────────────
    service_charge_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("10.00"),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Service charge percentage (default: 10%).",
    )
    service_charge_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        editable=False,
        help_text="Calculated service charge amount.",
    )

    # ── Totals ────────────────────────────────────
    grand_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        editable=False,
        help_text="Final amount after tax, discount, and service charge.",
    )

    notes = models.TextField(
        blank=True,
        default="",
        help_text="Optional bill notes.",
    )
    is_paid = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether this bill has been fully paid.",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self) -> str:
        paid_status = "Paid" if self.is_paid else "Unpaid"
        return f"{self.bill_number} — Rs.{self.grand_total} ({paid_status})"

    def save(self, *args, **kwargs):
        """Auto-generate bill number on first save and calculate totals."""
        if not self.bill_number:
            self.bill_number = self._generate_bill_number()
        self.calculate_totals()
        super().save(*args, **kwargs)

    def calculate_totals(self) -> None:
        """
        Calculate all derived amounts.

        Formula:
            discount_amount = subtotal × discount_percent / 100
            after_discount  = subtotal - discount_amount
            service_charge  = after_discount × service_charge_percent / 100
            taxable_amount  = after_discount + service_charge
            tax_amount      = taxable_amount × tax_percent / 100
            grand_total     = taxable_amount + tax_amount
        """
        self.discount_amount = (
            self.subtotal * self.discount_percent / Decimal("100")
        ).quantize(Decimal("0.01"))

        after_discount = self.subtotal - self.discount_amount

        self.service_charge_amount = (
            after_discount * self.service_charge_percent / Decimal("100")
        ).quantize(Decimal("0.01"))

        taxable_amount = after_discount + self.service_charge_amount

        self.tax_amount = (
            taxable_amount * self.tax_percent / Decimal("100")
        ).quantize(Decimal("0.01"))

        self.grand_total = taxable_amount + self.tax_amount

    def check_payment_status(self) -> None:
        """Update is_paid based on total payments received."""
        from django.db.models import Sum

        total_paid = self.payments.aggregate(total=Sum("amount"))["total"] or Decimal("0")
        self.is_paid = total_paid >= self.grand_total
        self.save(update_fields=["is_paid", "updated_at"])

    @staticmethod
    def _generate_bill_number() -> str:
        """Generate a sequential bill number like BILL-000001."""
        last_bill = (
            Bill.objects.filter(bill_number__startswith="BILL-")
            .order_by("-bill_number")
            .values_list("bill_number", flat=True)
            .first()
        )
        if last_bill:
            last_num = int(last_bill.split("-")[1])
            return f"BILL-{last_num + 1:06d}"
        return "BILL-000001"


class Payment(TimeStampedModel):
    """A payment record against a bill."""

    class PaymentMethod(models.TextChoices):
        CASH = "cash", "Cash"
        ESEWA = "esewa", "eSewa"
        KHALTI = "khalti", "Khalti"
        CARD = "card", "Card"
        BANK_TRANSFER = "bank_transfer", "Bank Transfer"

    bill = models.ForeignKey(
        Bill,
        on_delete=models.CASCADE,
        related_name="payments",
        help_text="The bill this payment is applied to.",
    )
    method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH,
        help_text="Payment method used.",
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Amount paid.",
    )
    reference = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Optional transaction reference (e.g. eSewa ID).",
    )
    notes = models.TextField(
        blank=True,
        default="",
        help_text="Optional payment notes.",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return (
            f"Rs.{self.amount} via {self.get_method_display()} "
            f"→ {self.bill.bill_number}"
        )
