"""
Tests for OrderService.update() business logic.

Covers:
- Manager assignment on first update of ownerless order
- OrderPermissionDenied when updating order owned by another manager
- Status None/'new' → 'in_work' on first update
- status='new' in payload removes manager
- Editable fields are updated
- Non-editable fields are ignored
- course normalisation: lowercase input → stored UPPER
"""
import pytest
from core.exceptions.orders_exceptions import OrderNotFound, OrderPermissionDenied

from apps.crm.services.order_services import OrderService


@pytest.mark.django_db
def test_update_assigns_manager_to_ownerless_order(order_no_manager, manager_user):
    """
    When an order has no manager, the first update assigns the current user
    as manager.
    """
    service = OrderService(user=manager_user)
    updated = service.update(order_id=order_no_manager.pk, data={"name": "Updated"})

    updated.refresh_from_db()
    assert updated.manager == manager_user


@pytest.mark.django_db
def test_update_raises_permission_denied_for_other_manager(order_owned_by_other, manager_user):
    """
    Updating an order owned by a different manager raises OrderPermissionDenied.
    """
    service = OrderService(user=manager_user)
    with pytest.raises(OrderPermissionDenied):
        service.update(order_id=order_owned_by_other.pk, data={"name": "Hacked"})


@pytest.mark.django_db
def test_update_sets_status_in_work_when_status_is_none(order_no_manager, manager_user):
    """
    When order.status is None and no status supplied in data,
    update() sets status to 'in_work'.
    """
    service = OrderService(user=manager_user)
    updated = service.update(order_id=order_no_manager.pk, data={"name": "Changed"})

    updated.refresh_from_db()
    assert updated.status == "in_work"


@pytest.mark.django_db
def test_update_sets_status_in_work_when_status_is_new(order_new_status, manager_user):
    """
    When order.status is 'new' and no status supplied in data,
    update() sets status to 'in_work'.
    """
    service = OrderService(user=manager_user)
    updated = service.update(order_id=order_new_status.pk, data={"age": 25})

    updated.refresh_from_db()
    assert updated.status == "in_work"


@pytest.mark.django_db
def test_update_status_new_removes_manager(order_with_manager, manager_user):
    """
    Passing status='new' in data clears the manager (sets to None).
    """
    service = OrderService(user=manager_user)
    updated = service.update(order_id=order_with_manager.pk, data={"status": "new"})

    updated.refresh_from_db()
    assert updated.manager is None
    assert updated.status == "new"


@pytest.mark.django_db
def test_update_editable_fields_are_saved(order_no_manager, manager_user):
    """
    All editable fields supplied in data are persisted.
    """
    service = OrderService(user=manager_user)
    updated = service.update(
        order_id=order_no_manager.pk,
        data={
            "name": "Jane",
            "surname": "Doe",
            "email": "jane@example.com",
            "phone": "380991234567",
            "age": 30,
            "sum": 1500.0,
            "already_paid": 500.0,
        },
    )

    updated.refresh_from_db()
    assert updated.name == "Jane"
    assert updated.surname == "Doe"
    assert updated.email == "jane@example.com"
    assert updated.phone == "380991234567"
    assert updated.age == 30
    assert updated.sum == 1500.0
    assert updated.already_paid == 500.0


@pytest.mark.django_db
def test_update_non_editable_fields_are_ignored(order_no_manager, manager_user):
    """
    Fields not in editable_fields (e.g. 'utm', 'msg') are silently ignored.
    The order's utm/msg remain unchanged.
    """
    original_utm = order_no_manager.utm

    service = OrderService(user=manager_user)
    service.update(
        order_id=order_no_manager.pk,
        data={"utm": "should_be_ignored", "msg": "also_ignored", "name": "Valid"},
    )

    order_no_manager.refresh_from_db()
    assert order_no_manager.utm == original_utm


@pytest.mark.django_db
def test_update_course_normalised_to_upper(order_no_manager, manager_user):
    """
    normalize_order_choices converts 'course' to uppercase.
    Passing 'fs' (lowercase) should store 'FS'.
    """
    service = OrderService(user=manager_user)
    updated = service.update(order_id=order_no_manager.pk, data={"course": "fs"})

    updated.refresh_from_db()
    assert updated.course == "FS"


@pytest.mark.django_db
def test_update_not_found_raises_order_not_found(manager_user):
    """
    Updating a non-existent order raises OrderNotFound.
    """
    service = OrderService(user=manager_user)
    with pytest.raises(OrderNotFound):
        service.update(order_id=999999, data={"name": "Ghost"})


@pytest.mark.django_db
def test_update_status_new_does_not_assign_manager_to_ownerless(order_no_manager, manager_user):
    """
    When order has no manager and status='new' is explicitly set,
    the manager should NOT be assigned (stays None).
    """
    service = OrderService(user=manager_user)
    updated = service.update(order_id=order_no_manager.pk, data={"status": "new"})

    updated.refresh_from_db()
    assert updated.manager is None
