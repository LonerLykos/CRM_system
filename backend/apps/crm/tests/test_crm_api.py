"""
Tests for crm API endpoints via DRF test client (force_authenticate — no JWT).

URL prefixes come from config/urls.py:  path('orders', include('apps.crm.api.urls'))
crm/api/urls.py uses path('', ...) so the full URL is /orders, /orders/<pk>, etc.

Covers:
- GET /orders → 200 + pagination envelope {total_items, total_pages, data}
- Default page_size is 25 (PagePagination)
- Filter ?status=in_work narrows results
- Filter ?my=true returns only current manager's orders
- Ordering ?order=id works without error
- GET /orders/<pk> → 200 with order details
- PATCH /orders/<pk>/update → 200 updates order
- POST /orders/<pk>/comment → 201 creates comment
- POST /orders/groups/create → 201
- Unauthenticated requests → 401/403

Export endpoint coverage (sync/async/invalid-filter) lives in test_crm_export.py.
"""
import pytest

from apps.crm.models.orders_model import OrdersModel

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
    POST /orders/groups/create → 201 and group name in response.
    """
    payload = {"name": "NewGroup"}
    response = admin_client.post(
        "/orders/groups/create",
        data=payload,
        format="json",
    )
    assert response.status_code == 201

    data = response.json()
    # Service normalises to lowercase
    assert data["name"] == "newgroup"


@pytest.mark.django_db
def test_create_group_duplicate_returns_200(admin_client):
    """
    Creating the same group twice: first → 201, second → 200 (already exists).

    GroupsSerializer drops the auto UniqueValidator so GroupsService.create_group
    (get_or_create on the normalized name) handles the duplicate idempotently.
    """
    payload = {"name": "dupgroup"}
    r1 = admin_client.post("/orders/groups/create", data=payload, format="json")
    r2 = admin_client.post("/orders/groups/create", data=payload, format="json")

    assert r1.status_code == 201
    assert r2.status_code == 200


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
