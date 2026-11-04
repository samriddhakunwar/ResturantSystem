"""
Tests for tables, QR codes and service requests.
"""
from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from . import qr
from .models import ServiceRequest, Table


@override_settings(PUBLIC_BASE_URL="http://192.168.1.20:5173")
class TableTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(User.objects.create_user("owner"))
        self.table = Table.objects.create(number=4)

    def test_qr_encodes_public_table_url(self):
        self.assertEqual(
            qr.table_url(self.table), f"http://192.168.1.20:5173/t/{self.table.qr_token}"
        )
        png = self.client.get(f"/api/v1/tables/{self.table.id}/qr.png")
        svg = self.client.get(f"/api/v1/tables/{self.table.id}/qr.svg?download=1")
        self.assertEqual(png["Content-Type"], "image/png")
        self.assertTrue(png.content.startswith(b"\x89PNG"))
        self.assertEqual(svg["Content-Type"], "image/svg+xml")
        self.assertIn(b'<path fill="#444034"', svg.content)
        self.assertIn("attachment", svg["Content-Disposition"])

    def test_qr_needs_auth(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(f"/api/v1/tables/{self.table.id}/qr.png").status_code, 401)

    def test_regenerate_token(self):
        old = self.table.qr_token
        res = self.client.post(f"/api/v1/tables/{self.table.id}/regenerate-token/")
        self.assertEqual(res.status_code, 200)
        self.assertNotEqual(res.data["qr_token"], str(old))

    def test_resolve_service_request(self):
        req = ServiceRequest.objects.create(table=self.table, type="water")
        self.assertEqual(self.client.get("/api/v1/tables/service-requests/?status=open").data["count"], 1)
        self.client.post(f"/api/v1/tables/service-requests/{req.id}/resolve/")
        self.assertEqual(self.client.get("/api/v1/tables/service-requests/?status=open").data["count"], 0)
