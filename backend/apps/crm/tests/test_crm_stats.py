"""
Tests for OrderSelector.get_status_stats().

Strategy: record counts BEFORE creating test orders, create N orders with
known statuses, then assert DELTAS to avoid coupling to the 500 seed rows.

Covers:
- Global total increases by the number of orders created
- null status counted under 'new'
- manager_id filter restricts stats to that manager's orders
- Per-status counts match what was created
"""
import pytest

from apps.crm.models.orders_model import OrdersModel
from apps.crm.selectors.order_selectors import OrderSelector


@pytest.mark.django_db
def test_global_total_reflects_created_orders():
    """
    After creating 3 extra orders, global total should be exactly 3 more
    than before.
    """
    selector = OrderSelector()
    before = selector.get_status_stats()
    total_before = before["total"]

    OrdersModel.objects.bulk_create([
        OrdersModel(name=f"T{i}") for i in range(3)
    ])

    after = selector.get_status_stats()
    assert after["total"] == total_before + 3


@pytest.mark.django_db
def test_null_status_counted_in_new():
    """
    Orders with status=None are counted under 'new'.
    Creating 2 orders with status=None must increase 'new' by 2.
    """
    selector = OrderSelector()
    before = selector.get_status_stats()
    new_before = before["new"]

    OrdersModel.objects.bulk_create([
        OrdersModel(name="NullOrder", status=None),
        OrdersModel(name="NullOrder2", status=None),
    ])

    after = selector.get_status_stats()
    assert after["new"] == new_before + 2


@pytest.mark.django_db
def test_manager_filter_isolates_stats(manager_user):
    """
    get_status_stats(manager_id=X) returns counts only for orders
    belonging to manager X.
    """
    selector = OrderSelector()

    # Create 2 in_work and 1 agree for manager_user
    OrdersModel.objects.create(name="M1", status="in_work", manager=manager_user)
    OrdersModel.objects.create(name="M2", status="in_work", manager=manager_user)
    OrdersModel.objects.create(name="M3", status="agree", manager=manager_user)

    stats = selector.get_status_stats(manager_id=manager_user.pk)

    assert stats["total"] == 3
    assert stats["in_work"] == 2
    assert stats["agree"] == 1
    assert stats["new"] == 0
    assert stats["disagree"] == 0
    assert stats["dubbing"] == 0


@pytest.mark.django_db
def test_manager_filter_null_status_as_new(manager_user):
    """
    For a specific manager, orders with status=None count under 'new'.
    """
    selector = OrderSelector()

    OrdersModel.objects.create(name="NullForManager", status=None, manager=manager_user)
    OrdersModel.objects.create(name="NewForManager", status="new", manager=manager_user)

    stats = selector.get_status_stats(manager_id=manager_user.pk)

    assert stats["total"] == 2
    assert stats["new"] == 2
