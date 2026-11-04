"""
Tests for staff authentication.
"""
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

STAFF_ENDPOINTS = [
    "/api/v1/menu/menu-items/",
    "/api/v1/orders/orders/",
    "/api/v1/billing/bills/",
    "/api/v1/printers/printers/",
    "/api/v1/reports/",
    "/api/v1/expenses/",
    "/api/v1/tables/",
    "/api/v1/tables/service-requests/",
    "/api/v1/cats/",
    "/api/v1/cats/enquiries/",
    "/api/v1/bookings/",
    "/api/v1/auth/me/",
]


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User.objects.create_user("owner", password="s3cret-cat")

    def test_staff_endpoints_need_auth(self):
        for url in STAFF_ENDPOINTS:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 401)

    def test_login_me_logout(self):
        bad = self.client.post("/api/v1/auth/login/", {"username": "owner", "password": "nope"})
        self.assertEqual(bad.status_code, 400)

        res = self.client.post("/api/v1/auth/login/", {"username": "owner", "password": "s3cret-cat"})
        self.assertEqual(res.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {res.data['token']}")
        self.assertEqual(self.client.get("/api/v1/auth/me/").data["username"], "owner")
        self.assertEqual(self.client.get("/api/v1/orders/orders/").status_code, 200)

        self.assertEqual(self.client.post("/api/v1/auth/logout/").status_code, 204)
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, 401)
