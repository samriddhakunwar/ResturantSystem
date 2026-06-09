"""
Celery tasks for the Thermal Printer System module.

Background tasks for async print job processing and retries.
"""
import logging

from apps.orders.models import Order

from .models import PrintJob
from .services import print_kitchen_ticket, print_customer_bill

logger = logging.getLogger(__name__)


def send_kitchen_ticket_async(order_id: int) -> None:
    """
    Background task: print a kitchen ticket for the given order.

    Called automatically when a new order is created (via signal).
    Falls back to sync execution if Celery is not available.
    """
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        logger.error("Order %s not found for kitchen ticket printing.", order_id)
        return

    job = print_kitchen_ticket(order)
    if job:
        logger.info(
            "Kitchen ticket for %s: %s",
            order.order_number,
            job.get_status_display(),
        )
    else:
        logger.warning(
            "No printer available for kitchen ticket (order %s).",
            order.order_number,
        )


def send_customer_bill_async(order_id: int) -> None:
    """
    Background task: print a customer bill for the given order.

    Called from the billing module when a bill is generated.
    """
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        logger.error("Order %s not found for bill printing.", order_id)
        return

    job = print_customer_bill(order)
    if job:
        logger.info(
            "Customer bill for %s: %s",
            order.order_number,
            job.get_status_display(),
        )
    else:
        logger.warning(
            "No printer available for customer bill (order %s).",
            order.order_number,
        )


def retry_failed_jobs(max_retries: int = 3) -> int:
    """
    Retry all failed print jobs that haven't exceeded max retries.

    Returns the number of jobs retried.
    """
    failed_jobs = PrintJob.objects.filter(
        status=PrintJob.Status.FAILED,
        retry_count__lt=max_retries,
    ).select_related("printer", "order")

    retried = 0
    for job in failed_jobs:
        if not job.printer.is_active:
            continue

        if job.job_type == PrintJob.JobType.KITCHEN_TICKET and job.order:
            print_kitchen_ticket(job.order, printer=job.printer)
            retried += 1
        elif job.job_type == PrintJob.JobType.CUSTOMER_BILL and job.order:
            print_customer_bill(job.order, printer=job.printer)
            retried += 1

    logger.info("Retried %d failed print jobs.", retried)
    return retried
