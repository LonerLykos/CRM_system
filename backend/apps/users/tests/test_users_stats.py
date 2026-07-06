"""
Tests for Statistics endpoints.

GET /users/statistic        — global stats (admin only)
GET /users/<pk>/statistic   — per-manager stats (admin only)

Key constraint from task brief:
  Each test DB already has 500 seed orders from migration crm/0002.
  We MUST work with deltas — i.e. only assert on the counts that WE
  create, not on absolute numbers from zero.
"""
import pytest

from apps.crm.models.choices_models import StatusChoices
from apps.crm.models.orders_model import OrdersModel
from apps.users.models import UserModel as User

GLOBAL_STATS_URL   = "/users/statistic"


def manager_stats_url(pk): return f"/users/{pk}/statistic"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _create_order(manager=None, status=None):
    return OrdersModel.objects.create(
        name="Test", surname="Order",
        manager=manager,
        status=status,
    )


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def stats_manager(db):
    """Fresh manager user for per-manager stats isolation."""
    return User.objects.create_user(
        email="statsmanager@test.com",
        name="Stats",
        surname="Manager",
        is_active=True,
    )


# ---------------------------------------------------------------------------
# GET /users/statistic  — global
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_global_statistic_admin_returns_200(admin_client):
    resp = admin_client.get(GLOBAL_STATS_URL)
    assert resp.status_code == 200


@pytest.mark.django_db
def test_global_statistic_returns_expected_keys(admin_client):
    resp = admin_client.get(GLOBAL_STATS_URL)
    data = resp.json()
    for key in ("total", "new", "in_work", "agree", "disagree", "dubbing"):
        assert key in data, f"Missing key: {key}"


@pytest.mark.django_db
def test_global_statistic_total_includes_seed_and_created(admin_client):
    """
    Seed data = 500 orders.  We add 3 more and check total increased by 3.
    """
    baseline = admin_client.get(GLOBAL_STATS_URL).json()["total"]
    _create_order(status=StatusChoices.AGREE)
    _create_order(status=StatusChoices.IN_WORK)
    _create_order(status=None)
    resp = admin_client.get(GLOBAL_STATS_URL)
    assert resp.json()["total"] == baseline + 3


@pytest.mark.django_db
def test_global_statistic_status_counts_delta(admin_client):
    """
    Create known-status orders, verify the per-status delta is exact.
    """
    baseline = admin_client.get(GLOBAL_STATS_URL).json()
    _create_order(status=StatusChoices.AGREE)
    _create_order(status=StatusChoices.AGREE)
    _create_order(status=StatusChoices.DISAGREE)
    _create_order(status=StatusChoices.DUBBING)
    _create_order(status=StatusChoices.IN_WORK)
    # null status → counted as 'new'
    _create_order(status=None)

    after = admin_client.get(GLOBAL_STATS_URL).json()
    assert after["agree"]    == baseline["agree"]    + 2
    assert after["disagree"] == baseline["disagree"] + 1
    assert after["dubbing"]  == baseline["dubbing"]  + 1
    assert after["in_work"]  == baseline["in_work"]  + 1
    assert after["new"]      >= baseline["new"]      + 1  # null row


@pytest.mark.django_db
def test_global_statistic_manager_forbidden(manager_client):
    resp = manager_client.get(GLOBAL_STATS_URL)
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# GET /users/<pk>/statistic  — per-manager
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_manager_statistic_returns_200(admin_client, stats_manager):
    resp = admin_client.get(manager_stats_url(stats_manager.pk))
    assert resp.status_code == 200


@pytest.mark.django_db
def test_manager_statistic_only_own_orders(admin_client, stats_manager):
    """
    Create 3 orders for stats_manager and 2 for nobody.
    The manager stats must contain exactly the 3 manager orders (delta).
    """
    before = admin_client.get(manager_stats_url(stats_manager.pk)).json()
    assert before["total"] == 0  # fresh manager, no prior orders

    _create_order(manager=stats_manager, status=StatusChoices.IN_WORK)
    _create_order(manager=stats_manager, status=StatusChoices.AGREE)
    _create_order(manager=stats_manager, status=None)
    # Orders without this manager — must NOT affect manager's stats
    _create_order(manager=None, status=StatusChoices.IN_WORK)
    _create_order(manager=None, status=StatusChoices.AGREE)

    after = admin_client.get(manager_stats_url(stats_manager.pk)).json()
    assert after["total"]   == 3
    assert after["in_work"] == 1
    assert after["agree"]   == 1
    assert after["new"]     >= 1  # null status row


@pytest.mark.django_db
def test_manager_statistic_returns_expected_keys(admin_client, stats_manager):
    resp = admin_client.get(manager_stats_url(stats_manager.pk))
    data = resp.json()
    for key in ("total", "new", "in_work", "agree", "disagree", "dubbing"):
        assert key in data


@pytest.mark.django_db
def test_manager_statistic_forbidden_for_non_admin(manager_client, stats_manager):
    resp = manager_client.get(manager_stats_url(stats_manager.pk))
    assert resp.status_code == 403
