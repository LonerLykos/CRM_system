"""
Tests for permission enforcement on Users API endpoints.

Covers:
- IsAdminUser: only superusers can reach admin-only endpoints
- IsActiveUser: inactive users are blocked (403)
- IsUnbannedUser: banned users are blocked (403)

Note on banned-admin test:
  All admin-user endpoints (list, create, toggles, etc.) require
  [IsAdminUser, IsActiveUser, IsUnbannedUser].  A banned admin IS
  blocked by IsUnbannedUser.  We verify this on PATCH /users/<pk>/active_toggle
  which is representative of all admin-only write endpoints.
"""
import pytest

from apps.users.models import UserModel as User

USERS_LIST_URL = "/users"
USERS_CREATE_URL = "/users/create_user"


def active_toggle_url(pk): return f"/users/{pk}/active_toggle"
def ban_toggle_url(pk):    return f"/users/{pk}/ban_toggle"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def target_user(db):
    return User.objects.create_user(
        email="perm_target@test.com", name="Perm", surname="Target", is_active=False
    )


@pytest.fixture
def inactive_admin(db):
    """Admin (is_staff, is_superuser) but NOT is_active — should be blocked by IsActiveUser."""
    u = User.objects.create_superuser(
        email="inactive_admin@test.com", password="pass", name="IAdmin", surname="Boss"
    )
    u.is_active = False
    u.save()
    return u


@pytest.fixture
def banned_admin(db):
    """Active superuser but is_banned=True — should be blocked by IsUnbannedUser."""
    u = User.objects.create_superuser(
        email="banned_admin@test.com", password="pass", name="BAdmin", surname="Boss"
    )
    u.is_banned = True
    u.save()
    return u


# ---------------------------------------------------------------------------
# IsAdminUser
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_non_admin_cannot_list_users(manager_client):
    resp = manager_client.get(USERS_LIST_URL)
    assert resp.status_code == 403


@pytest.mark.django_db
def test_unauthenticated_cannot_list_users(api_client):
    resp = api_client.get(USERS_LIST_URL)
    assert resp.status_code in (401, 403)


@pytest.mark.django_db
def test_non_admin_cannot_create_user(manager_client):
    resp = manager_client.post(
        USERS_CREATE_URL,
        {"email": "x@x.com", "name": "X", "surname": "Y"},
        format="json",
    )
    assert resp.status_code == 403


@pytest.mark.django_db
def test_non_admin_cannot_toggle_active(manager_client, target_user):
    resp = manager_client.patch(active_toggle_url(target_user.pk))
    assert resp.status_code == 403


@pytest.mark.django_db
def test_non_admin_cannot_toggle_ban(manager_client, target_user):
    resp = manager_client.patch(ban_toggle_url(target_user.pk))
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# IsActiveUser — inactive admin cannot reach endpoints
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_inactive_admin_blocked_on_list(inactive_admin, api_client):
    api_client.force_authenticate(user=inactive_admin)
    resp = api_client.get(USERS_LIST_URL)
    assert resp.status_code == 403


@pytest.mark.django_db
def test_inactive_admin_blocked_on_active_toggle(inactive_admin, api_client, target_user):
    api_client.force_authenticate(user=inactive_admin)
    resp = api_client.patch(active_toggle_url(target_user.pk))
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# IsUnbannedUser — banned admin cannot reach endpoints
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_banned_admin_blocked_on_list(banned_admin, api_client):
    api_client.force_authenticate(user=banned_admin)
    resp = api_client.get(USERS_LIST_URL)
    assert resp.status_code == 403


@pytest.mark.django_db
def test_banned_admin_blocked_on_active_toggle(banned_admin, api_client, target_user):
    api_client.force_authenticate(user=banned_admin)
    resp = api_client.patch(active_toggle_url(target_user.pk))
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Active admin passes all permission checks
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_active_admin_can_list_users(admin_client):
    resp = admin_client.get(USERS_LIST_URL)
    assert resp.status_code == 200
