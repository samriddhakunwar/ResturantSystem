"""
URL patterns for accounts app.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

app_name = "accounts"

urlpatterns = [
    # JWT Authentication
    path("login/", TokenObtainPairView.as_view(), name="token-obtain"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    # Registration & Profile
    path("register/", views.RegisterView.as_view(), name="register"),
    path("me/", views.ProfileView.as_view(), name="profile"),
    path("change-password/", views.ChangePasswordView.as_view(), name="change-password"),
    # Staff Management
    path("staff/", views.StaffListView.as_view(), name="staff-list"),
    path("staff/<int:pk>/", views.StaffDetailView.as_view(), name="staff-detail"),
]
