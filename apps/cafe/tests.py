"""
Tests for the guest-facing café API.
"""
from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from apps.menu.models import Category, MenuItem
from apps.orders.models import Order
from apps.tables.models import ServiceRequest, Table


class GuestOrderTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.table = Table.objects.create(number=4)
        cat = Category.objects.create(name="Purr-over Coffee")
        self.coffee = MenuItem.objects.create(category=cat, name="Catpuccino", price=Decimal("280"))
        self.sold_out = MenuItem.objects.create(
            category=cat, name="Carrot Cake", price=Decimal("320"), is_available=False
        )

    def url(self, token=None):
        return f"/api/v1/public/tables/{token or self.table.qr_token}/orders/"

    def test_creates_qr_order_with_server_side_prices(self):
        res = self.client.post(
            self.url(),
            {
                "items": [
                    {"menu_item": self.coffee.id, "quantity": 2, "notes": "less sugar",
                     "unit_price": "1.00", "price": "1.00"},
                ],
                "total": "2.00",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201, res.data)
        order = Order.objects.get(public_id=res.data["public_id"])
        self.assertEqual(order.source, Order.Source.QR)
        self.assertEqual(order.table, self.table)
        self.assertEqual(order.table_number, 4)
        self.assertIsNone(order.confirmed_at)
        self.assertEqual(order.subtotal, Decimal("560.00"))
        self.assertEqual(order.items.get().unit_price, Decimal("280.00"))
        self.assertEqual(res.data["step"], "received")
        # 560 + 10% service = 616, + 13% VAT = 696.08
        self.assertEqual(res.data["charges"]["total"], Decimal("696.08"))
        self.assertNotIn("order_number", res.data)

    def test_rejects_unavailable_item(self):
        res = self.client.post(
            self.url(), {"items": [{"menu_item": self.sold_out.id, "quantity": 1}]}, format="json"
        )
        self.assertEqual(res.status_code, 400)
        self.assertFalse(Order.objects.exists())

    def test_caps_quantity_and_requires_items(self):
        too_many = self.client.post(
            self.url(), {"items": [{"menu_item": self.coffee.id, "quantity": 21}]}, format="json"
        )
        empty = self.client.post(self.url(), {"items": []}, format="json")
        self.assertEqual(too_many.status_code, 400)
        self.assertEqual(empty.status_code, 400)
        self.assertFalse(Order.objects.exists())

    def test_inactive_table_is_rejected(self):
        self.table.is_active = False
        self.table.save()
        self.assertEqual(self.client.get(f"/api/v1/public/tables/{self.table.qr_token}/").status_code, 404)
        res = self.client.post(
            self.url(), {"items": [{"menu_item": self.coffee.id, "quantity": 1}]}, format="json"
        )
        self.assertEqual(res.status_code, 404)

    def test_regenerated_token_rejects_old_qr(self):
        old_token = self.table.qr_token
        self.table.regenerate_token()
        res = self.client.post(
            self.url(old_token), {"items": [{"menu_item": self.coffee.id, "quantity": 1}]}, format="json"
        )
        self.assertEqual(res.status_code, 404)
        ok = self.client.get(f"/api/v1/public/tables/{self.table.qr_token}/")
        self.assertEqual(ok.data, {"number": 4, "label": "Table 4"})

    def test_order_status_by_public_id(self):
        created = self.client.post(
            self.url(), {"items": [{"menu_item": self.coffee.id, "quantity": 1}]}, format="json"
        )
        res = self.client.get(f"/api/v1/public/orders/{created.data['public_id']}/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["items"][0]["name"], "Catpuccino")
        self.assertEqual(res.data["table_label"], "Table 4")

    def test_service_request_is_deduplicated_while_open(self):
        url = f"/api/v1/public/tables/{self.table.qr_token}/service-requests/"
        first = self.client.post(url, {"type": "request_bill"}, format="json")
        again = self.client.post(url, {"type": "request_bill"}, format="json")
        bad = self.client.post(url, {"type": "free_cake"}, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(again.status_code, 200)
        self.assertEqual(bad.status_code, 400)
        self.assertEqual(ServiceRequest.objects.count(), 1)

    def test_menu_lists_sold_out_items_flagged(self):
        res = self.client.get("/api/v1/public/menu/")
        self.assertEqual(res.status_code, 200)
        items = {i["name"]: i["is_available"] for i in res.data[0]["items"]}
        self.assertEqual(items, {"Catpuccino": True, "Carrot Cake": False})

    def test_public_endpoints_ignore_bad_tokens(self):
        """A stale staff token in the browser mustn't 401 the guest menu."""
        self.client.credentials(HTTP_AUTHORIZATION="Token not-a-real-token")
        self.assertEqual(self.client.get("/api/v1/public/config/").status_code, 200)
