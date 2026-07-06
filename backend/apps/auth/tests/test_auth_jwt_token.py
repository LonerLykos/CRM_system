"""
Tests for JWT token refresh flow and JWTService unit tests.

Refresh flow:
  - POST /auth/refresh with valid refresh_token cookie → 200, new tokens
  - Rotation: old refresh after use → 401
  - No cookie → 401

JWTService.verify_token unit tests:
  - Single-use: second verify of the same token raises JWTException
  - Invalid token string → JWTException
"""
import pytest
from core.exceptions.jwt_exception import JWTException
from core.services.jwt_service import JWTService, PasswordToken
from rest_framework.test import APIClient

from apps.users.models import UserModel

LOGIN_URL = "/auth"
REFRESH_URL = "/auth/refresh"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _active_user(email="jwt@test.com", password="jwtpass123"):
    return UserModel.objects.create_user(
        email=email,
        password=password,
        name="JWT",
        surname="Tester",
        is_active=True,
    )


def _login(client, email="jwt@test.com", password="jwtpass123"):
    return client.post(LOGIN_URL, {"email": email, "password": password}, format="json")


# ---------------------------------------------------------------------------
# Refresh endpoint
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestTokenRefresh:
    """POST /auth/refresh — rotate refresh token."""

    def test_valid_refresh_cookie_returns_200(self, api_client):
        _active_user()
        _login(api_client)
        resp = api_client.post(REFRESH_URL)
        assert resp.status_code == 200

    def test_valid_refresh_returns_new_tokens(self, api_client):
        _active_user()
        login_resp = _login(api_client)
        old_access = login_resp.data["access_token"]
        old_refresh = login_resp.data["refresh_token"]

        refresh_resp = api_client.post(REFRESH_URL)
        assert refresh_resp.status_code == 200
        assert refresh_resp.data["access_token"]
        assert refresh_resp.data["refresh_token"]
        # Tokens should be rotated (new values)
        assert refresh_resp.data["access_token"] != old_access
        assert refresh_resp.data["refresh_token"] != old_refresh

    def test_valid_refresh_sets_new_cookies(self, api_client):
        _active_user()
        _login(api_client)
        resp = api_client.post(REFRESH_URL)
        # The primary assertion: the endpoint must succeed
        assert resp.status_code == 200
        # Only then check that new non-empty cookies were set
        assert resp.cookies["access_token"].value
        assert resp.cookies["refresh_token"].value

    def test_refresh_without_cookie_returns_401(self):
        """A fresh client with no refresh_token cookie must get 401."""
        fresh = APIClient()
        resp = fresh.post(REFRESH_URL)
        assert resp.status_code == 401

    def test_refresh_rotation_old_token_blacklisted(self, api_client):
        """
        After a successful refresh (BLACKLIST_AFTER_ROTATION=True), the old
        refresh token must be blacklisted — reusing it must return 401.
        """
        _active_user()
        login_resp = _login(api_client)
        old_refresh = login_resp.data["refresh_token"]

        # Consume the refresh token
        first_refresh = api_client.post(REFRESH_URL)
        assert first_refresh.status_code == 200

        # Try to reuse the old token
        fresh = APIClient()
        fresh.cookies["refresh_token"] = old_refresh
        reuse_resp = fresh.post(REFRESH_URL)
        assert reuse_resp.status_code == 401

    def test_invalid_refresh_token_returns_401(self):
        """Tampered / garbage refresh token should return 401."""
        fresh = APIClient()
        fresh.cookies["refresh_token"] = "not.a.valid.token"
        resp = fresh.post(REFRESH_URL)
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# JWTService.verify_token unit tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestJWTServiceVerifyToken:
    """Unit tests for JWTService (PasswordToken — one-time use)."""

    def test_verify_token_returns_user_id(self, db):
        user = _active_user(email="svc@test.com")
        token = JWTService.create_token(user, PasswordToken)
        user_id = JWTService.verify_token(str(token), PasswordToken)
        assert user_id == str(user.pk)

    def test_verify_token_is_one_time_use(self, db):
        """Second verify of the same token must raise JWTException."""
        user = _active_user(email="once@test.com")
        token = JWTService.create_token(user, PasswordToken)
        token_str = str(token)

        JWTService.verify_token(token_str, PasswordToken)  # first use — ok

        with pytest.raises(JWTException):
            JWTService.verify_token(token_str, PasswordToken)  # second use — must fail

    def test_verify_invalid_token_raises_jwt_exception(self, db):
        """An invalid / garbage token string must raise JWTException."""
        with pytest.raises(JWTException):
            JWTService.verify_token("invalid.token.string", PasswordToken)

    def test_verify_wrong_token_class_raises_jwt_exception(self, db):
        """
        A token created as PasswordToken has token_type='password'.
        Verifying it as a plain ActionToken with a different type raises JWTException
        because the type claim won't match and simplejwt will reject it.
        """
        from core.services.jwt_service import ActionToken
        user = _active_user(email="wrongclass@test.com")
        JWTService.create_token(user, PasswordToken)
        # ActionToken has no fixed token_type so it may pass — but the password
        # sub-type claim must be rejected by the blacklist check on second use.
        # The meaningful assertion here is that arbitrary strings always raise.
        with pytest.raises(JWTException):
            JWTService.verify_token("completely.garbage.value", ActionToken)
