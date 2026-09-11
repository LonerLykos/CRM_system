"""
Tests for UserService business-logic layer.

Coverage:
- create()         → returns (token, user); user.is_active=False; password unusable
- set_active()     → writes the requested is_active; repeating it is a no-op
- set_banned()     → writes the requested is_banned; repeating it is a no-op
- self-action guard → an admin can't ban / deactivate themselves
- user_restore_password() → returns new PasswordToken; password becomes unusable
- user_set_password()  → sets password + activates user
- token one-time use   → second call raises JWTException
"""
import pytest
from core.exceptions.jwt_exception import JWTException
from core.exceptions.users_exceptions import SelfActionDenied
from core.services.jwt_service import JWTService, PasswordToken

from apps.users.models import UserModel as User
from apps.users.services.user_service import UserService

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
# Fixtures
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
# set_active()
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_set_active_true_activates(plain_user):
    result = UserService.set_active(plain_user.pk, True)
    assert result.is_active is True
    plain_user.refresh_from_db()
    assert plain_user.is_active is True


@pytest.mark.django_db
def test_set_active_false_deactivates(active_user):
    result = UserService.set_active(active_user.pk, False)
    assert result.is_active is False
    active_user.refresh_from_db()
    assert active_user.is_active is False


@pytest.mark.django_db
def test_set_active_repeated_is_noop(active_user):
    """Activating twice leaves the user active — no toggle back."""
    UserService.set_active(active_user.pk, True)
    UserService.set_active(active_user.pk, True)
    active_user.refresh_from_db()
    assert active_user.is_active is True


# ---------------------------------------------------------------------------
# set_banned()
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_set_banned_true_bans(active_user):
    assert active_user.is_banned is False
    result = UserService.set_banned(active_user.pk, True)
    assert result.is_banned is True
    active_user.refresh_from_db()
    assert active_user.is_banned is True


@pytest.mark.django_db
def test_set_banned_false_unbans(banned_user):
    result = UserService.set_banned(banned_user.pk, False)
    assert result.is_banned is False
    banned_user.refresh_from_db()
    assert banned_user.is_banned is False


@pytest.mark.django_db
def test_set_banned_repeated_keeps_user_banned(active_user):
    """
    The old toggle unbanned on a second "Ban" (stale tab, two admins at once);
    now the second request changes nothing.
    """
    UserService.set_banned(active_user.pk, True)
    UserService.set_banned(active_user.pk, True)
    active_user.refresh_from_db()
    assert active_user.is_banned is True


@pytest.mark.django_db
def test_set_banned_on_self_is_denied(active_user):
    with pytest.raises(SelfActionDenied):
        UserService.set_banned(active_user.pk, True, requester_id=active_user.pk)
    active_user.refresh_from_db()
    assert active_user.is_banned is False


@pytest.mark.django_db
def test_set_active_on_self_is_denied(active_user):
    with pytest.raises(SelfActionDenied):
        UserService.set_active(active_user.pk, False, requester_id=active_user.pk)
    active_user.refresh_from_db()
    assert active_user.is_active is True


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
