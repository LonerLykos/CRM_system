"""
Tests for JWTAuthCookieMiddleware:
  Ensures that a request carrying only the access_token cookie (no explicit
  Authorization header) is authenticated correctly by the middleware, which
  injects "Authorization: Bearer <token>" before DRF's JWTAuthentication runs.
"""
import pytest
from rest_framework.test import APIClient

from apps.users.models import UserModel

LOGIN_URL = "/auth"
ME_URL = "/auth/me"


def _active_user(email="mw@test.com", password="mwpass123"):
    return UserModel.objects.create_user(
        email=email,
        password=password,
        name="Middle",
        surname="Ware",
        is_active=True,
    )


@pytest.mark.django_db
class TestJWTAuthCookieMiddleware:
    """Cookie-only authentication via JWTAuthCookieMiddleware."""

    def test_cookie_only_request_is_authenticated(self, api_client):
        """
        After login the APIClient stores cookies. Sending GET /auth/me with those
        cookies (and no explicit Authorization header) must return 200 — the middleware
        picks up access_token from the cookie and injects the Bearer header.
        """
        _active_user()
        login_resp = api_client.post(LOGIN_URL, {"email": "mw@test.com", "password": "mwpass123"}, format="json")
        assert login_resp.status_code == 200

        # Confirm we actually have the access_token cookie stored
        assert "access_token" in api_client.cookies

        # Make sure no Authorization header is set on the client
        api_client.credentials()  # clear any forced credentials

        resp = api_client.get(ME_URL)
        assert resp.status_code == 200

    def test_explicit_auth_header_without_cookie_is_authenticated(self, api_client):
        """
        The middleware only injects if no Authorization header is present.
        A request with an explicit Bearer token must also work (standard DRF path).
        """
        user = _active_user(email="hdr@test.com")
        from rest_framework_simplejwt.tokens import RefreshToken
        access = str(RefreshToken.for_user(user).access_token)

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        resp = api_client.get(ME_URL)
        assert resp.status_code == 200

    def test_no_cookie_no_header_returns_401(self):
        """Without both cookie and header the request is unauthenticated."""
        fresh = APIClient()
        resp = fresh.get(ME_URL)
        assert resp.status_code == 401

    def test_middleware_does_not_override_existing_auth_header(self, api_client):
        """
        If the client already sends an Authorization header, the middleware must
        NOT overwrite it.  We verify this by sending an invalid cookie alongside a
        valid Bearer token — authentication must succeed (valid header wins).
        """
        user = _active_user(email="nooverride@test.com")
        from rest_framework_simplejwt.tokens import RefreshToken
        access = str(RefreshToken.for_user(user).access_token)

        # Set a garbage cookie that would fail if the middleware used it
        api_client.cookies["access_token"] = "garbage.cookie.value"

        # But provide a valid Authorization header
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        resp = api_client.get(ME_URL)
        # Should succeed because middleware left the valid header untouched
        assert resp.status_code == 200

    def test_invalid_access_token_cookie_returns_401(self):
        """A tampered/expired access_token cookie must result in 401."""
        fresh = APIClient()
        fresh.cookies["access_token"] = "bad.jwt.token"
        resp = fresh.get(ME_URL)
        assert resp.status_code == 401
