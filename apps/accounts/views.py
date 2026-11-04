"""
API views for staff authentication.

The café is single-owner: staff accounts are created with ``createsuperuser``
or in the Django admin. There is no role system — any active account can use
the whole dashboard.

Endpoints:
    POST /auth/login/   — exchange username + password for a token
    POST /auth/logout/  — revoke the caller's token
    GET  /auth/me/      — the signed-in user
"""
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView


def _user_payload(user) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_superuser": user.is_superuser,
    }


class LoginView(APIView):
    """Exchange credentials for an API token (throttled against guessing)."""

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"
    serializer_class = AuthTokenSerializer

    def post(self, request):
        serializer = AuthTokenSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": _user_payload(user)})


class LogoutView(APIView):
    """Delete the caller's token so it can't be reused."""

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """Return the signed-in user."""

    def get(self, request):
        return Response(_user_payload(request.user))
