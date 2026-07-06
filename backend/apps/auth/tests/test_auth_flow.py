"""
Tests for the authentication flow:
  - POST /auth  (login)
  - GET  /auth/me
  - POST /auth/logout
"""
import pytest
from rest_framework.test import APIClient

from apps.users.models import UserModel

LOGIN_URL = "/auth"
ME_URL = "/auth/me"
LOGOUT_URL = "/auth/logout"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_active_user(email="flow@test.com", password="flowpass123"):
    """Create an active user suitable for real JWT login."""
    return UserModel.objects.create_user(
        email=email,
        password=password,
        name="Flow",
        surname="User",
        is_active=True,
    )


# ---------------------------------------------------------------------------
# Login tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestLogin:
    """POST /auth — cookie-based JWT login."""

    def test_valid_credentials_returns_200(self, api_client):
        _make_active_user()
        resp = api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        assert resp.status_code == 200

    def test_valid_credentials_response_body_contains_tokens(self, api_client):
        _make_active_user()
        resp = api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        assert "access_token" in resp.data
        assert "refresh_token" in resp.data
        assert resp.data["access_token"]
        assert resp.data["refresh_token"]

    def test_valid_credentials_sets_access_cookie(self, api_client):
        _make_active_user()
        resp = api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        assert "access_token" in resp.cookies
        assert resp.cookies["access_token"].value  # non-empty

    def test_valid_credentials_sets_refresh_cookie(self, api_client):
        _make_active_user()
        resp = api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        assert "refresh_token" in resp.cookies
        assert resp.cookies["refresh_token"].value  # non-empty

    def test_valid_credentials_cookies_are_httponly(self, api_client):
        _make_active_user()
        resp = api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        assert resp.cookies["access_token"]["httponly"]
        assert resp.cookies["refresh_token"]["httponly"]

    def test_invalid_password_returns_401(self, api_client):
        _make_active_user()
        resp = api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "wrongpass"}, format="json")
        assert resp.status_code == 401

    def test_nonexistent_user_returns_401(self, api_client):
        resp = api_client.post(LOGIN_URL, {"email": "nobody@test.com", "password": "any"}, format="json")
        assert resp.status_code == 401

    def test_inactive_user_cannot_login(self, api_client):
        UserModel.objects.create_user(
            email="inactive@test.com",
            password="somepass",
            name="In",
            surname="Active",
            is_active=False,
        )
        resp = api_client.post(LOGIN_URL, {"email": "inactive@test.com", "password": "somepass"}, format="json")
        assert resp.status_code == 401

    def test_banned_user_cannot_login(self, api_client):
        user = UserModel.objects.create_user(
            email="banned@test.com",
            password="bannedpass",
            name="Ban",
            surname="Ned",
            is_active=True,
        )
        user.is_banned = True
        user.save()
        resp = api_client.post(LOGIN_URL, {"email": "banned@test.com", "password": "bannedpass"}, format="json")
        assert resp.status_code == 401

    def test_missing_fields_returns_400(self, api_client):
        resp = api_client.post(LOGIN_URL, {"email": "flow@test.com"}, format="json")
        assert resp.status_code == 400

    def test_response_body_has_message(self, api_client):
        _make_active_user()
        resp = api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        assert resp.data.get("message") == "Successful"


# ---------------------------------------------------------------------------
# /auth/me tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestAuthMe:
    """GET /auth/me — current-user endpoint."""

    def test_authenticated_via_cookie_returns_200(self, api_client):
        """Cookie persists in the same APIClient after login, so /me should succeed."""
        _make_active_user()
        api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        resp = api_client.get(ME_URL)
        assert resp.status_code == 200

    def test_authenticated_via_cookie_returns_user_data(self, api_client):
        _make_active_user()
        api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        resp = api_client.get(ME_URL)
        assert resp.data["name"] == "Flow"
        assert resp.data["surname"] == "User"

    def test_unauthenticated_returns_401(self):
        """Fresh client with no cookies must be rejected."""
        fresh = APIClient()
        resp = fresh.get(ME_URL)
        assert resp.status_code == 401

    def test_cleared_cookies_returns_401(self, api_client):
        """After manually removing cookie the request must fail."""
        _make_active_user()
        api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        # Clear stored cookies
        api_client.cookies.clear()
        resp = api_client.get(ME_URL)
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Logout tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestLogout:
    """POST /auth/logout — invalidate session."""

    def test_logout_returns_200(self, api_client):
        _make_active_user()
        api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        resp = api_client.post(LOGOUT_URL)
        assert resp.status_code == 200

    def test_logout_clears_access_cookie(self, api_client):
        """
        After logout the Set-Cookie header must delete access_token.
        DRF sets the cookie value to '' and max-age to 0.
        """
        _make_active_user()
        api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        resp = api_client.post(LOGOUT_URL)
        # delete_cookie sets the value to empty string and max-age 0
        assert resp.cookies.get("access_token") is not None
        assert resp.cookies["access_token"].value == ""

    def test_logout_clears_refresh_cookie(self, api_client):
        _make_active_user()
        api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        resp = api_client.post(LOGOUT_URL)
        assert resp.cookies.get("refresh_token") is not None
        assert resp.cookies["refresh_token"].value == ""

    def test_after_logout_refresh_token_is_blacklisted(self, api_client):
        """Reusing the refresh token after logout must return 401."""
        _make_active_user()
        login_resp = api_client.post(LOGIN_URL, {"email": "flow@test.com", "password": "flowpass123"}, format="json")
        old_refresh = login_resp.data["refresh_token"]

        api_client.post(LOGOUT_URL)

        # Fresh client with the old refresh cookie
        fresh = APIClient()
        fresh.cookies["refresh_token"] = old_refresh
        refresh_resp = fresh.post("/auth/refresh")
        assert refresh_resp.status_code == 401
