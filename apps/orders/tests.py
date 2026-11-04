"""
Tests for order confirmation, kitchen printing and the new statuses.
"""
from decimal import Decimal
from unittest import mock

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.menu.models import Category, MenuItem
from apps.printers.models import Printer, PrintJob
from apps.tables.models import Table

from .models import Order, OrderItem


class OrderFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(User.objects.create_user("owner"))
        cat = Category.objects.create(name="Meals")
        self.item = MenuItem.objects.create(category=cat, name="Tuna Melt Paws", price=Decimal("450"))
        self.table = Table.objects.create(number=3)

    def qr_order(self):
        order = Order.objects.create(source=Order.Source.QR, table=self.table)
        OrderItem.objects.create(order=order, menu_item=self.item, quantity=1)
        return order

    @mock.patch("apps.printers.services._send_to_printer")
    def test_confirming_qr_order_prints_kitchen_ticket(self, send):
        Printer.objects.create(name="Kitchen", connection_type="lan", ip_address="10.0.0.9")
        order = self.qr_order()

        with self.captureOnCommitCallbacks(execute=True):
            res = self.client.post(f"/api/v1/orders/orders/{order.id}/confirm/")

        self.assertEqual(res.status_code, 200)
        send.assert_called_once()
        self.assertIn("Tuna Melt Paws", send.call_args.args[1])
        job = PrintJob.objects.get(order=order)
        self.assertEqual(job.status, PrintJob.Status.COMPLETED)
        order.refresh_from_db()
        self.assertIsNotNone(order.confirmed_at)

        again = self.client.post(f"/api/v1/orders/orders/{order.id}/confirm/")
        self.assertEqual(again.status_code, 400)

    def test_kitchen_board_lists_active_orders_with_items(self):
        waiting = self.qr_order()
        done = self.qr_order()
        Order.objects.filter(pk=done.pk).update(status=Order.Status.COMPLETED)

        res = self.client.get("/api/v1/orders/orders/kitchen/")

        self.assertEqual(res.status_code, 200)
        self.assertEqual([o["id"] for o in res.data], [waiting.id])
        self.assertEqual(res.data[0]["items"][0]["menu_item_detail"]["name"], "Tuna Melt Paws")

    def test_confirm_without_printer_does_not_fail(self):
        order = self.qr_order()
        with self.captureOnCommitCallbacks(execute=True):
            res = self.client.post(f"/api/v1/orders/orders/{order.id}/confirm/")
        self.assertEqual(res.status_code, 200)

    def test_unconfirmed_qr_order_cannot_start(self):
        order = self.qr_order()
        res = self.client.patch(
            f"/api/v1/orders/orders/{order.id}/update-status/", {"status": "preparing"}, format="json"
        )
        self.assertEqual(res.status_code, 400)

    def test_full_status_flow_and_guest_steps(self):
        order = self.qr_order()
        self.assertEqual(order.guest_step, "received")
        self.client.post(f"/api/v1/orders/orders/{order.id}/confirm/")
        expected = {"preparing": "brewing", "ready": "ready", "served": "served", "completed": "served"}
        for new_status, step in expected.items():
            res = self.client.patch(
                f"/api/v1/orders/orders/{order.id}/update-status/", {"status": new_status}, format="json"
            )
            self.assertEqual(res.status_code, 200, res.data)
            order.refresh_from_db()
            self.assertEqual(order.guest_step, step)

    @mock.patch("apps.printers.services._send_to_printer")
    def test_pos_order_is_confirmed_and_optionally_printed(self, send):
        Printer.objects.create(name="Kitchen", connection_type="lan", ip_address="10.0.0.9")
        payload = {"table_number": 2, "items": [{"menu_item": self.item.id, "quantity": 1}]}

        with self.captureOnCommitCallbacks(execute=True):
            res = self.client.post("/api/v1/orders/orders/", payload, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["source"], "pos")
        self.assertIsNotNone(res.data["confirmed_at"])
        send.assert_not_called()

        with override_settings(KITCHEN_AUTO_PRINT_POS=True):
            with self.captureOnCommitCallbacks(execute=True):
                self.client.post("/api/v1/orders/orders/", payload, format="json")
        send.assert_called_once()

    @override_settings(CELERY_ENABLED=True)
    @mock.patch("apps.printers.services._send_to_printer")
    def test_falls_back_to_sync_print_when_broker_is_down(self, send):
        Printer.objects.create(name="Kitchen", connection_type="lan", ip_address="10.0.0.9")
        order = self.qr_order()
        from apps.printers import tasks

        with mock.patch.object(
            tasks.send_kitchen_ticket_async, "delay", side_effect=ConnectionError, create=True
        ):
            with self.captureOnCommitCallbacks(execute=True):
                self.client.post(f"/api/v1/orders/orders/{order.id}/confirm/")
        send.assert_called_once()
