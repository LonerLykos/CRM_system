"""
Tests for UserService business-logic layer.

Coverage:
- create()         → returns (token, user); user.is_active=False; password unusable
- user_active_toggle() → inverts is_active
- user_ban_toggle()    → inverts is_banned
- user_restore_password() → returns new PasswordToken; password becomes unusable
- user_set_password()  → sets password + activates user
- token one-time use   → second call raises JWTException
"""
import pytest
from core.exceptions.jwt_exception import JWTException
from core.services.jwt_service import JWTService, PasswordToken

from apps.users.models import UserModel as User
from apps.users.services.user_service import UserService

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_user(db, *, email="svc@test.com", name="Svc", surname="User",
               is_active=False, is_banned=False, password=None):
    """Create a UserModel instance directly (not via UserService.create)."""
    u = User.objects.create_user(
        email=email, name=name, surname=surname,
        is_active=is_active, password=password,
    )
    if is_banned:
        u.is_banned = True
        u.save()
    return u


# ---------------------------------------------------------------------------
# create()
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestUserServiceCreate:
    def test_create_returns_token_and_user(self):
        data = {"email": "new@test.com", "name": "New", "surname": "Guy"}
        token, user = UserService.create(data)
        assert token is not None
        assert user is not None
        assert user.pk is not None

    def test_create_user_is_inactive_by_default(self):
        data = {"email": "inactive@test.com", "name": "In", "surname": "Active"}
        _, user = UserService.create(data)
        assert user.is_active is False

    def test_create_user_has_unusable_password(self):
        """
        UserService.create routes through objects.create_user(), which calls
        set_unusable_password() when no password is supplied. The new manager
        therefore has an unusable password until they set one via the
        activation link.
        """
        data = {"email": "nopwd@test.com", "name": "No", "surname": "Pwd"}
        _, user = UserService.create(data)
        assert not user.has_usable_password()
        assert not user.check_password("any_password")

    def test_create_token_is_password_token(self):
        data = {"email": "tok@test.com", "name": "Tok", "surname": "User"}
        token, user = UserService.create(data)
        # verify_token must succeed and return user_id
        user_id = JWTService.verify_token(str(token), PasswordToken)
        assert str(user.pk) == user_id


# ---------------------------------------------------------------------------
# user_active_toggle()
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestUserActiveToggle:
    def test_toggle_false_to_true(self):
        u = _make_user(pytest.importorskip("django.db"), is_active=False)
        # Workaround: use db directly via the fixture trick (call via method)
        result = UserService.user_active_toggle(u.pk)
        assert result.is_active is True

    def test_toggle_true_to_false(self):
        u = _make_user(pytest.importorskip("django.db"), is_active=True)
        result = UserService.user_active_toggle(u.pk)
        assert result.is_active is False

    def test_toggle_persisted_in_db(self):
        u = _make_user(pytest.importorskip("django.db"), is_active=False)
        UserService.user_active_toggle(u.pk)
        u.refresh_from_db()
        assert u.is_active is True


# ---------------------------------------------------------------------------
# Re-write helpers using proper pytest fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def plain_user(db):
    return User.objects.create_user(
        email="plain@test.com", name="Plain", surname="User", is_active=False
    )


@pytest.fixture
def active_user(db):
    return User.objects.create_user(
        email="active@test.com", name="Active", surname="User", is_active=True
    )


@pytest.fixture
def banned_user(db):
    u = User.objects.create_user(
        email="banned@test.com", name="Banned", surname="User", is_active=True
    )
    u.is_banned = True
    u.save()
    return u


# ---------------------------------------------------------------------------
# active_toggle (proper fixtures)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_active_toggle_inactive_to_active(plain_user):
    result = UserService.user_active_toggle(plain_user.pk)
    assert result.is_active is True
    plain_user.refresh_from_db()
    assert plain_user.is_active is True


@pytest.mark.django_db
def test_active_toggle_active_to_inactive(active_user):
    result = UserService.user_active_toggle(active_user.pk)
    assert result.is_active is False
    active_user.refresh_from_db()
    assert active_user.is_active is False


# ---------------------------------------------------------------------------
# ban_toggle
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_ban_toggle_unbanned_to_banned(active_user):
    assert active_user.is_banned is False
    result = UserService.user_ban_toggle(active_user.pk)
    assert result.is_banned is True
    active_user.refresh_from_db()
    assert active_user.is_banned is True


@pytest.mark.django_db
def test_ban_toggle_banned_to_unbanned(banned_user):
    result = UserService.user_ban_toggle(banned_user.pk)
    assert result.is_banned is False
    banned_user.refresh_from_db()
    assert banned_user.is_banned is False


# ---------------------------------------------------------------------------
# user_restore_password()
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_restore_password_returns_token_and_user(active_user):
    token, user = UserService.user_restore_password(active_user.pk)
    assert token is not None
    assert user.pk == active_user.pk


@pytest.mark.django_db
def test_restore_password_sets_unusable_password(active_user):
    # First set a real password so we have something to destroy
    active_user.set_password("realpassword")
    active_user.save()

    UserService.user_restore_password(active_user.pk)
    active_user.refresh_from_db()
    assert not active_user.has_usable_password()


@pytest.mark.django_db
def test_restore_password_token_is_valid(active_user):
    token, _ = UserService.user_restore_password(active_user.pk)
    user_id = JWTService.verify_token(str(token), PasswordToken)
    assert str(active_user.pk) == user_id


# ---------------------------------------------------------------------------
# user_set_password()
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_set_password_activates_user(plain_user):
    token, _ = UserService.user_restore_password(plain_user.pk)
    UserService.user_set_password("newpass123", str(token))
    plain_user.refresh_from_db()
    assert plain_user.is_active is True


@pytest.mark.django_db
def test_set_password_sets_usable_password(plain_user):
    token, _ = UserService.user_restore_password(plain_user.pk)
    UserService.user_set_password("newpass123", str(token))
    plain_user.refresh_from_db()
    assert plain_user.check_password("newpass123")


# ---------------------------------------------------------------------------
# Token one-time use (blacklist)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_password_token_is_single_use(active_user):
    """PasswordToken must be invalidated after first verify_token call."""
    token, _ = UserService.user_restore_password(active_user.pk)
    token_str = str(token)

    # First use — must succeed
    UserService.user_set_password("firstuse!", token_str)

    # Second use — must raise JWTException (token is blacklisted)
    with pytest.raises(JWTException):
        JWTService.verify_token(token_str, PasswordToken)
