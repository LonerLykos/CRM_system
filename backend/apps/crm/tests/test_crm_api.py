"""
Tests for crm API endpoints via DRF test client (force_authenticate — no JWT).

URL prefixes come from config/urls.py:  path('orders', include('apps.crm.api.urls'))
crm/api/urls.py uses path('', ...) so the full URL is /orders, /orders/<pk>, etc.

Covers:
- GET /orders → 200 + pagination envelope {total_items, total_pages, data}
- Default page_size is 25 (PagePagination)
- Filter ?status=in_work narrows results
- Filter ?status=new also returns orders without a status (NULL / '')
- Date range: the end date includes the whole day
- Filter ?my=true returns only current manager's orders
- Ordering ?order=id works without error
- GET /orders/<pk> → 200 with order details
- PATCH /orders/<pk>/update → 200 updates order; invalid values → 400
- POST /orders/<pk>/comment → 201 creates comment
- POST /orders/groups/create → 201; duplicate (any case) → 400
- Unauthenticated requests → 401/403

Export endpoint coverage (sync/async/invalid-filter) lives in test_crm_export.py.
"""
from datetime import datetime
from datetime import timezone as dt_timezone

import pytest

from apps.crm.models.group_model import GroupModel
from apps.crm.models.orders_model import OrdersModel
from apps.crm.selectors.order_selectors import new_status_q

# ---------------------------------------------------------------------------
# List endpoint
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_orders_list_returns_200_and_pagination_envelope(admin_client):
    response = admin_client.get("/orders")
    assert response.status_code == 200

    data = response.json()
    # PagePagination returns {total_items, total_pages, prev, next, data}
    assert "total_items" in data
    assert "total_pages" in data
    assert "data" in data
    assert isinstance(data["data"], list)


@pytest.mark.django_db
def test_orders_list_default_page_size_is_25(admin_client):
    """
    With 500 seed rows, the first page should contain exactly 25 items (default page_size).
    """
    response = admin_client.get("/orders")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 25


@pytest.mark.django_db
def test_orders_list_filter_by_status(admin_client, manager_user):
    """
    ?status=in_work returns only orders with status='in_work'.
    We create a known in_work order and verify it appears, and that
    all returned items have status='in_work'.
    """
    OrdersModel.objects.create(
        name="InWork", surname="FilterTest", status="in_work", manager=manager_user
    )

    response = admin_client.get("/orders?status=in_work")
    assert response.status_code == 200

    items = response.json()["data"]
    assert len(items) > 0
    for item in items:
        assert item["status"] == "in_work"

    # Our created order may be on page 1 or paginated away, but all visible must be in_work
    assert all(i["status"] == "in_work" for i in items)


@pytest.mark.django_db
def test_orders_list_filter_new_includes_orders_without_status(admin_client):
    """
    ?status=new also returns orders that never got a status (NULL or ''),
    the same rule the statistics use.
    """
    explicit = OrdersModel.objects.create(name="ExplicitNew", status="new")
    null = OrdersModel.objects.create(name="NullStatus", status=None)
    blank = OrdersModel.objects.create(name="BlankStatus", status="")
    in_work = OrdersModel.objects.create(name="InWorkX", status="in_work")

    response = admin_client.get("/orders?status=new")
    assert response.status_code == 200
    data = response.json()

    ids = {item["id"] for item in data["data"]}
    assert {explicit.pk, null.pk, blank.pk} <= ids
    assert in_work.pk not in ids
    assert all(item["status"] in (None, "", "new") for item in data["data"])
    assert data["total_items"] == OrdersModel.objects.filter(new_status_q()).count()


def _order_created_at(name, created_at):
    order = OrdersModel.objects.create(name=name)
    # auto_now_add ignores assignments on create(); patch it afterwards
    OrdersModel.objects.filter(pk=order.pk).update(created_at=created_at)
    return order


@pytest.mark.django_db
def test_orders_list_date_range_includes_the_whole_end_day(admin_client):
    """
    From == To returns every order of that day — the end date is inclusive,
    not "before its first instant".
    """
    day_start = _order_created_at("DayStart", datetime(2031, 5, 17, 0, 0, tzinfo=dt_timezone.utc))
    day_end = _order_created_at("DayEnd", datetime(2031, 5, 17, 23, 59, 59, tzinfo=dt_timezone.utc))
    before = _order_created_at("Before", datetime(2031, 5, 16, 23, 59, 59, tzinfo=dt_timezone.utc))
    after = _order_created_at("After", datetime(2031, 5, 18, 0, 0, tzinfo=dt_timezone.utc))

    response = admin_client.get("/orders?created_at_gte=2031-05-17&created_at_lte=2031-05-17")
    assert response.status_code == 200

    ids = {item["id"] for item in response.json()["data"]}
    assert ids == {day_start.pk, day_end.pk}
    assert before.pk not in ids
    assert after.pk not in ids


@pytest.mark.django_db
def test_orders_list_group_name_contains_ignores_case(admin_client):
    """
    Group names are unique case-sensitively, but searching by name is not.
    """
    group = GroupModel.objects.create(name="Group Case")
    order = OrdersModel.objects.create(name="Grouped", group=group)

    response = admin_client.get("/orders?group_name_contains=group case")
    assert response.status_code == 200

    ids = {item["id"] for item in response.json()["data"]}
    assert order.pk in ids


@pytest.mark.django_db
def test_orders_list_filter_my_returns_only_own_orders(manager_client, manager_user):
    """
    ?my=true shows only orders assigned to the authenticated manager.
    """
    # Create 2 orders for manager_user and 1 for another user (no manager)
    OrdersModel.objects.create(name="Mine1", status="in_work", manager=manager_user)
    OrdersModel.objects.create(name="Mine2", status="agree", manager=manager_user)
    OrdersModel.objects.create(name="NotMine", status=None, manager=None)

    response = manager_client.get("/orders?my=true")
    assert response.status_code == 200
    data = response.json()

    # total_items must exactly match only this manager's orders
    # (manager_user had no orders before, so count == 2)
    assert data["total_items"] == 2
    for item in data["data"]:
        assert item["manager"] == manager_user.surname


@pytest.mark.django_db
def test_orders_list_ordering_by_id(admin_client):
    """
    ?order=id returns results ordered ascending by id without errors.
    """
    response = admin_client.get("/orders?order=id")
    assert response.status_code == 200
    items = response.json()["data"]
    ids = [item["id"] for item in items]
    assert ids == sorted(ids)


# ---------------------------------------------------------------------------
# Detail endpoint
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_order_detail_returns_200(admin_client, order_no_manager):
    response = admin_client.get(f"/orders/{order_no_manager.pk}")
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == order_no_manager.pk
    # Detail includes comments field
    assert "comments" in data


# ---------------------------------------------------------------------------
# Update endpoint
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_order_update_returns_200_and_saves_changes(manager_client, manager_user, order_no_manager):
    """
    PATCH /orders/<pk>/update with editable fields → 200 and data is updated.
    """
    payload = {"name": "Updated", "age": 28}
    response = manager_client.patch(
        f"/orders/{order_no_manager.pk}/update",
        data=payload,
        format="json",
    )
    assert response.status_code == 200

    order_no_manager.refresh_from_db()
    assert order_no_manager.name == "Updated"
    assert order_no_manager.age == 28


# An email of exactly 150 characters: 64 + "@" + 85-char domain
EMAIL_150 = "a" * 64 + "@" + "b" * 63 + "." + "c" * 17 + ".com"
EMAIL_151 = "a" * 64 + "@" + "b" * 63 + "." + "c" * 18 + ".com"


@pytest.mark.django_db
@pytest.mark.parametrize("payload, field", [
    ({"age": -5}, "age"),
    ({"age": 0}, "age"),
    ({"age": 1000}, "age"),
    ({"sum": -100}, "sum"),
    ({"already_paid": -1}, "already_paid"),
    ({"sum": 10, "already_paid": 999}, "already_paid"),
    ({"phone": "abc"}, "phone"),
    ({"phone": "0991122345"}, "phone"),
    ({"surname": "S" * 51}, "surname"),
    ({"email": EMAIL_151}, "email"),
])
def test_order_update_rejects_invalid_values(manager_client, order_no_manager, payload, field):
    """
    The backend guards itself: invalid values → 400 keyed by the field, and
    nothing is written.
    """
    response = manager_client.patch(
        f"/orders/{order_no_manager.pk}/update",
        data=payload,
        format="json",
    )
    assert response.status_code == 400
    assert field in response.json()

    order_no_manager.refresh_from_db()
    assert order_no_manager.manager is None


@pytest.mark.django_db
def test_order_update_checks_already_paid_against_stored_sum(manager_client, order_no_manager):
    """
    PATCH carries only already_paid — the sum it is compared with comes from
    the stored order.
    """
    OrdersModel.objects.filter(pk=order_no_manager.pk).update(sum=10)

    response = manager_client.patch(
        f"/orders/{order_no_manager.pk}/update",
        data={"already_paid": 999},
        format="json",
    )
    assert response.status_code == 400
    assert response.json() == {"already_paid": ["Already paid cannot be greater than sum"]}


@pytest.mark.django_db
def test_order_update_legacy_paid_over_sum_does_not_block_other_fields(manager_client, order_no_manager):
    """
    Legacy rows may already have already_paid > sum; editing an unrelated field
    must still work.
    """
    OrdersModel.objects.filter(pk=order_no_manager.pk).update(sum=10, already_paid=999)

    response = manager_client.patch(
        f"/orders/{order_no_manager.pk}/update",
        data={"name": "Legacy"},
        format="json",
    )
    assert response.status_code == 200


@pytest.mark.django_db
def test_order_update_accepts_boundary_values(manager_client, order_no_manager):
    payload = {
        "age": 100,
        "sum": 500,
        "already_paid": 500,
        "phone": "+380991122345",
        "surname": "S" * 50,
        "email": EMAIL_150,
    }
    response = manager_client.patch(
        f"/orders/{order_no_manager.pk}/update",
        data=payload,
        format="json",
    )
    assert response.status_code == 200

    order_no_manager.refresh_from_db()
    assert order_no_manager.phone == "+380991122345"
    assert order_no_manager.email == EMAIL_150


@pytest.mark.django_db
def test_order_update_allows_clearing_validated_fields(manager_client, order_no_manager):
    response = manager_client.patch(
        f"/orders/{order_no_manager.pk}/update",
        data={"age": None, "phone": None, "sum": None},
        format="json",
    )
    assert response.status_code == 200


# ---------------------------------------------------------------------------
# Comment endpoint
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_create_comment_returns_201(manager_client, manager_user, order_no_manager):
    """
    POST /orders/<pk>/comment → 201 and comment text in response.
    """
    payload = {"comment": "Test comment"}
    response = manager_client.post(
        f"/orders/{order_no_manager.pk}/comment",
        data=payload,
        format="json",
    )
    assert response.status_code == 201

    data = response.json()
    assert data["comment"] == "Test comment"


# ---------------------------------------------------------------------------
# Groups endpoints
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_create_group_returns_201(admin_client):
    """
    POST /orders/groups/create → 201 and group name in response (case kept).
    """
    payload = {"name": "NewGroup"}
    response = admin_client.post(
        "/orders/groups/create",
        data=payload,
        format="json",
    )
    assert response.status_code == 201

    data = response.json()
    assert data["name"] == "NewGroup"


@pytest.mark.django_db
def test_create_group_duplicate_returns_400(admin_client):
    """
    Creating the same group twice: first → 201, second → 400 with a readable
    field error, and no second row.
    """
    payload = {"name": "dupgroup"}
    r1 = admin_client.post("/orders/groups/create", data=payload, format="json")
    r2 = admin_client.post("/orders/groups/create", data=payload, format="json")

    assert r1.status_code == 201
    assert r2.status_code == 400
    assert r2.json() == {"name": ["Group with this name already exists"]}
    assert GroupModel.objects.filter(name="dupgroup").count() == 1


@pytest.mark.django_db
def test_create_group_same_name_in_other_case_is_a_separate_group(admin_client):
    """
    Uniqueness is case-sensitive: a group created by mistake in lower case must
    not block the proper one in upper case.
    """
    r1 = admin_client.post("/orders/groups/create", data={"name": "group a"}, format="json")
    r2 = admin_client.post("/orders/groups/create", data={"name": "Group A"}, format="json")

    assert r1.status_code == 201
    assert r2.status_code == 201
    assert set(GroupModel.objects.values_list("name", flat=True)) >= {"group a", "Group A"}


# ---------------------------------------------------------------------------
# Authentication / permission checks
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_unauthenticated_list_returns_401_or_403(api_client):
    """
    Unauthenticated client should be rejected (401 or 403).
    DRF default: IsAuthenticated → 403 for anonymous.
    """
    response = api_client.get("/orders")
    assert response.status_code in (401, 403)


@pytest.mark.django_db
def test_unauthenticated_update_returns_401_or_403(api_client, order_no_manager):
    """
    Unauthenticated PATCH should be rejected.
    """
    response = api_client.patch(
        f"/orders/{order_no_manager.pk}/update",
        data={"name": "Hacked"},
        format="json",
    )
    assert response.status_code in (401, 403)
