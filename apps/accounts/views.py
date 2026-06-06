"""
Views for accounts app — registration, profile, staff management.
"""
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from utils.permissions import IsAdmin, IsManager

from .serializers import (
    ChangePasswordSerializer,
    UserListSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Register a new staff member (admin only)."""

    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsAdmin]


class ProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the current user's profile."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change the current user's password."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response(
            {"detail": "Password updated successfully."},
            status=status.HTTP_200_OK,
        )


class StaffListView(generics.ListAPIView):
    """List all staff members (admin/manager only)."""

    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsManager]
    filterset_fields = ["role", "is_active"]
    search_fields = ["full_name", "email", "phone"]
    ordering_fields = ["full_name", "created_at", "role"]


class StaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or deactivate a staff member (admin only)."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def perform_destroy(self, instance):
        """Soft-delete: deactivate instead of removing from DB."""
        instance.is_active = False
        instance.save(update_fields=["is_active"])
