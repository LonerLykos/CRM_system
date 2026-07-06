"""
Local fixtures for crm tests.
Creates known orders directly via ORM to keep tests independent
from the 500 seed rows loaded by migration 0002.
"""
import pytest

from apps.crm.models.group_model import GroupModel
from apps.crm.models.orders_model import OrdersModel


@pytest.fixture
def order_no_manager(db):
    """A fresh order with no manager and no status."""
    return OrdersModel.objects.create(
        name="Test",
        surname="Order",
        email="order@test.com",
        status=None,
        manager=None,
    )


@pytest.fixture
def order_new_status(db):
    """A fresh order with status='new' and no manager."""
    return OrdersModel.objects.create(
        name="New",
        surname="Order",
        status="new",
        manager=None,
    )


@pytest.fixture
def order_with_manager(db, manager_user):
    """An order owned by manager_user."""
    return OrdersModel.objects.create(
        name="Owned",
        surname="Order",
        status="in_work",
        manager=manager_user,
    )


@pytest.fixture
def another_manager(db):
    """A second manager user different from manager_user."""
    from apps.users.models import UserModel
    return UserModel.objects.create_user(
        email="other_manager@test.com",
        password="otherpass",
        name="Other",
        surname="Manager",
        is_active=True,
    )


@pytest.fixture
def order_owned_by_other(db, another_manager):
    """An order owned by another_manager (not manager_user)."""
    return OrdersModel.objects.create(
        name="Foreign",
        surname="Order",
        status="in_work",
        manager=another_manager,
    )


@pytest.fixture
def test_group(db):
    """A pre-existing group."""
    return GroupModel.objects.create(name="testgroup")
