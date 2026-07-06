"""
Tests for Users API endpoints (HTTP-level, force_authenticate).

Endpoints covered:
- GET  /users                   (list, admin-only)
- POST /users/create_user       (admin-only)
- GET  /users/<pk>              (admin-only)
- PATCH /users/<pk>/active_toggle
- PATCH /users/<pk>/ban_toggle
- PATCH /users/<pk>/restore_password
- POST /users/set_password/<token>   (AllowAny)
"""
import pytest
from rest_framework.test import APIClient

from apps.users.models import UserModel as User
from apps.users.services.user_service import UserService

# ---------------------------------------------------------------------------
# URL helpers  (APPEND_SLASH=False → no trailing slash)
# ---------------------------------------------------------------------------

USERS_LIST_URL       = "/users"
USERS_CREATE_URL     = "/users/create_user"


def user_detail_url(pk):     return f"/users/{pk}"
def active_toggle_url(pk):   return f"/users/{pk}/active_toggle"
def ban_toggle_url(pk):      return f"/users/{pk}/ban_toggle"
def restore_pwd_url(pk):     return f"/users/{pk}/restore_password"
def set_pwd_url(token):      return f"/users/set_password/{token}"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def target_user(db):
    """A fresh, inactive user to be operated on."""
    return User.objects.create_user(
        email="target@test.com", name="Target", surname="User", is_active=False
    )


@pytest.fixture
def active_target_user(db):
    return User.objects.create_user(
        email="atarget@test.com", name="ATarget", surname="User", is_active=True
    )


# ---------------------------------------------------------------------------
# GET /users  — list
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_user_list_admin_returns_200(admin_client):
    resp = admin_client.get(USERS_LIST_URL)
    assert resp.status_code == 200


@pytest.mark.django_db
def test_user_list_admin_returns_paginated_envelope(admin_client):
    resp = admin_client.get(USERS_LIST_URL)
    data = resp.json()
    # PagePagination returns total_items / total_pages / data keys
    assert "data" in data
    assert "total_items" in data


@pytest.mark.django_db
def test_user_list_manager_returns_403(manager_client):
    resp = manager_client.get(USERS_LIST_URL)
    assert resp.status_code == 403


@pytest.mark.django_db
def test_user_list_unauthenticated_returns_401_or_403(api_client):
    resp = api_client.get(USERS_LIST_URL)
    assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# POST /users/create_user
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_create_user_admin_201(admin_client):
    payload = {"email": "brand@new.com", "name": "Brand", "surname": "New"}
    resp = admin_client.post(USERS_CREATE_URL, payload, format="json")
    assert resp.status_code == 201


@pytest.mark.django_db
def test_create_user_response_contains_token_and_link(admin_client):
    payload = {"email": "linktest@new.com", "name": "Link", "surname": "Test"}
    resp = admin_client.post(USERS_CREATE_URL, payload, format="json")
    body = resp.json()
    assert "verify_token" in body
    assert "link" in body


@pytest.mark.django_db
def test_create_user_new_user_in_db_inactive(db, admin_client):
    payload = {"email": "dbcheck@new.com", "name": "Db", "surname": "Check"}
    admin_client.post(USERS_CREATE_URL, payload, format="json")
    created = User.objects.filter(email="dbcheck@new.com").first()
    assert created is not None
    assert created.is_active is False


@pytest.mark.django_db
def test_create_user_manager_forbidden(manager_client):
    payload = {"email": "nope@new.com", "name": "Nope", "surname": "Nope"}
    resp = manager_client.post(USERS_CREATE_URL, payload, format="json")
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# GET /users/<pk> — detail
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_user_detail_admin_200(admin_client, target_user):
    resp = admin_client.get(user_detail_url(target_user.pk))
    assert resp.status_code == 200
    assert resp.json()["id"] == target_user.pk


@pytest.mark.django_db
def test_user_detail_manager_403(manager_client, target_user):
    resp = manager_client.get(user_detail_url(target_user.pk))
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# PATCH /users/<pk>/active_toggle
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_active_toggle_inverts_state(admin_client, target_user):
    assert target_user.is_active is False
    resp = admin_client.patch(active_toggle_url(target_user.pk))
    assert resp.status_code == 200
    target_user.refresh_from_db()
    assert target_user.is_active is True


@pytest.mark.django_db
def test_active_toggle_second_call_reverts(admin_client, target_user):
    admin_client.patch(active_toggle_url(target_user.pk))
    admin_client.patch(active_toggle_url(target_user.pk))
    target_user.refresh_from_db()
    assert target_user.is_active is False


# ---------------------------------------------------------------------------
# PATCH /users/<pk>/ban_toggle
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_ban_toggle_inverts_state(admin_client, target_user):
    assert target_user.is_banned is False
    resp = admin_client.patch(ban_toggle_url(target_user.pk))
    assert resp.status_code == 200
    target_user.refresh_from_db()
    assert target_user.is_banned is True


@pytest.mark.django_db
def test_admin_cannot_ban_self_returns_403():
    """An admin may not ban their own account (SelfActionDenied → 403); the
    is_banned flag stays untouched so they can't lock themselves out."""
    admin = User.objects.create_superuser(
        email="selfban@test.com", password="pass", name="Self", surname="Ban"
    )
    client = APIClient()
    client.force_authenticate(user=admin)

    resp = client.patch(ban_toggle_url(admin.pk))

    assert resp.status_code == 403
    admin.refresh_from_db()
    assert admin.is_banned is False


@pytest.mark.django_db
def test_admin_cannot_deactivate_self_returns_403():
    """Same guard for active_toggle — an admin can't deactivate themselves."""
    admin = User.objects.create_superuser(
        email="selfdeact@test.com", password="pass", name="Self", surname="Deact"
    )
    client = APIClient()
    client.force_authenticate(user=admin)

    resp = client.patch(active_toggle_url(admin.pk))

    assert resp.status_code == 403
    admin.refresh_from_db()
    assert admin.is_active is True


# ---------------------------------------------------------------------------
# PATCH /users/<pk>/restore_password
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_restore_password_returns_200_and_link(admin_client, target_user):
    resp = admin_client.patch(restore_pwd_url(target_user.pk))
    assert resp.status_code == 200
    body = resp.json()
    assert "link" in body
    assert "verify_token" in body


# ---------------------------------------------------------------------------
# POST /users/set_password/<token>  — AllowAny
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_set_password_with_valid_token_returns_200(db, target_user):
    """
    Generate a token via UserService, then call the endpoint.
    Uses a plain api_client (no auth) to verify AllowAny.
    """
    token, _ = UserService.user_restore_password(target_user.pk)
    client = APIClient()
    resp = client.post(set_pwd_url(str(token)), {"password": "Str0ngPass!"}, format="json")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_set_password_activates_user_and_sets_password(db, target_user):
    token, _ = UserService.user_restore_password(target_user.pk)
    client = APIClient()
    client.post(set_pwd_url(str(token)), {"password": "Str0ngPass!"}, format="json")
    target_user.refresh_from_db()
    assert target_user.is_active is True
    assert target_user.check_password("Str0ngPass!")


@pytest.mark.django_db
def test_set_password_response_contains_tokens_and_cookie(db, target_user):
    token, _ = UserService.user_restore_password(target_user.pk)
    client = APIClient()
    resp = client.post(set_pwd_url(str(token)), {"password": "Str0ngPass!"}, format="json")
    body = resp.json()
    assert "access_token" in body
    assert "refresh_token" in body
    # Cookies should be set
    assert "access_token" in resp.cookies or "refresh_token" in resp.cookies


@pytest.mark.django_db
def test_set_password_invalid_token_returns_401(db, target_user):
    """Expired / invalid token → JWTException → 401."""
    client = APIClient()
    resp = client.post(set_pwd_url("invalid.token.here"), {"password": "X"}, format="json")
    assert resp.status_code == 401


@pytest.mark.django_db
def test_set_password_token_single_use(db, target_user):
    """Second call with the same token should be rejected."""
    token, _ = UserService.user_restore_password(target_user.pk)
    token_str = str(token)
    client = APIClient()
    client.post(set_pwd_url(token_str), {"password": "FirstPass1!"}, format="json")
    resp2 = client.post(set_pwd_url(token_str), {"password": "SecondPass2!"}, format="json")
    assert resp2.status_code in (401, 403)
