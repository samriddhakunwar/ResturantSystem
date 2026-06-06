"""
Shared permission classes for role-based access control.
"""
from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to users with the ADMIN role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class IsManager(BasePermission):
    """Allow access to ADMIN or MANAGER roles."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("ADMIN", "MANAGER")
        )


class IsWaiter(BasePermission):
    """Allow access to ADMIN, MANAGER, or WAITER roles."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("ADMIN", "MANAGER", "WAITER")
        )


class IsChef(BasePermission):
    """Allow access to ADMIN, MANAGER, or CHEF roles."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("ADMIN", "MANAGER", "CHEF")
        )


class IsAdminOrReadOnly(BasePermission):
    """Full access for ADMIN; read-only for everyone else."""

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class IsManagerOrReadOnly(BasePermission):
    """Full access for ADMIN/MANAGER; read-only for everyone else."""

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("ADMIN", "MANAGER")
        )
