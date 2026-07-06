"""
Tests for the hybrid Excel export of the orders endpoint.

URL prefixes come from config/urls.py: path('orders', include('apps.crm.api.urls')).
Export route names (apps/crm/api/urls.py):
- crm_orders_export           GET /orders/export
- crm_orders_export_status    GET /orders/export/<task_id>
- crm_orders_export_download  GET /orders/export/<task_id>/download

The view picks sync vs async by filtered row count:
- count <= settings.EXPORT_SYNC_MAX_ROWS  → build the workbook in-process and
  return the .xlsx inline (200).
- count >  settings.EXPORT_SYNC_MAX_ROWS  → dispatch a Celery task and return
  202 {task_id}; poll the status route, then hit the download route.

settings_test.py runs Celery eagerly (ALWAYS_EAGER / EAGER_PROPAGATES /
STORE_EAGER_RESULT + an in-memory result backend) and points EXPORTS_DIR at a
temp dir, so the whole async path (task → status → download) runs in-process
with NO Redis/worker.

Migration 0002 seeds ~500 orders that have neither a group nor a manager. Every
test therefore isolates its own rows by assigning them a unique group and
filtering on `group_name_contains` (seed rows have group=None and never match),
or — for the my=true case — by relying on the fact that the manager fixture
owns none of the seed rows.

Covers:
- SYNC small path → 200 xlsx; header row + one row per order; ID/Name/Group/Manager correct.
- Filtering (course filter and my=true) → exported rows match the filtered subset exactly.
- Invalid filter (bad course choice) → 400.
- ASYNC large path (EXPORT_SYNC_MAX_ROWS=0) → 202 + task_id → status SUCCESS → download xlsx.
- Sync and async produce the same header + same row count for the same data (identical builder).
"""
import io

import openpyxl
import pytest
from django.test import override_settings
from django.urls import reverse

from apps.crm.models.group_model import GroupModel
from apps.crm.models.orders_model import OrdersModel
from apps.crm.services.export_service import EXPORT_COLUMNS

XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

# Expected header is derived from the single source of truth (the builder), so
# the tests stay in lock-step with EXPORT_COLUMNS.
EXPECTED_HEADER = [col[0] for col in EXPORT_COLUMNS]

# Map a column header label → its 0-based index, for value assertions.
COL = {col[0]: idx for idx, col in enumerate(EXPORT_COLUMNS)}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _read_bytes(response):
    """Raw body bytes for both regular (sync, HttpResponse) and streaming
    (download, FileResponse) responses."""
    if getattr(response, "streaming", False):
        return b"".join(response.streaming_content)
    return response.content


def _load_rows(response):
    """Parse an .xlsx response body with openpyxl into (header, data_rows)."""
    workbook = openpyxl.load_workbook(io.BytesIO(_read_bytes(response)))
    worksheet = workbook.active
    rows = [list(r) for r in worksheet.iter_rows(values_only=True)]
    return rows[0], rows[1:]


def _make_orders(group, count, **kwargs):
    """Create `count` orders attached to `group`, returning the instances."""
    return [
        OrdersModel.objects.create(
            name=f"{group.name}{i}",
            surname=f"User{i}",
            group=group,
            **kwargs,
        )
        for i in range(count)
    ]


# ---------------------------------------------------------------------------
# SYNC small path
# ---------------------------------------------------------------------------

@override_settings(EXPORT_SYNC_MAX_ROWS=1000)
@pytest.mark.django_db
def test_export_sync_returns_xlsx_with_header_and_one_row_per_order(admin_client, manager_user):
    """
    A small filtered result set (<= EXPORT_SYNC_MAX_ROWS) is built synchronously
    and returned inline: 200, spreadsheet content-type, attachment .xlsx, and a
    workbook with the header row + exactly one row per order. Key columns
    (ID/Name/Group/Manager) carry the right values.
    """
    group = GroupModel.objects.create(name="syncgrp")
    orders = _make_orders(
        group, 5, course="FS", status="in_work", manager=manager_user, age=21
    )

    response = admin_client.get(
        reverse("crm_orders_export"), {"group_name_contains": "syncgrp"}
    )

    assert response.status_code == 200
    assert XLSX_CONTENT_TYPE in response["Content-Type"]
    assert "attachment" in response["Content-Disposition"]
    assert ".xlsx" in response["Content-Disposition"]

    header, data_rows = _load_rows(response)
    assert header == EXPECTED_HEADER
    assert len(data_rows) == len(orders)

    by_id = {row[COL["ID"]]: row for row in data_rows}
    assert set(by_id) == {o.id for o in orders}
    for order in orders:
        row = by_id[order.id]
        assert row[COL["Name"]] == order.name
        assert row[COL["Group"]] == group.name
        assert row[COL["Manager"]] == manager_user.surname


@override_settings(EXPORT_SYNC_MAX_ROWS=1000)
@pytest.mark.django_db
def test_export_honours_xlsx_accept_header(admin_client):
    """
    Regression: the frontend proxy requests the export with
    `Accept: application/vnd...spreadsheetml.sheet`. With only a JSON renderer
    configured, DRF content negotiation used to raise 406 in initial() before
    the view ran (the browser then downloaded the JSON error body as
    `export.json`). IgnoreClientContentNegotiation must let the request through
    so the sync path still returns the .xlsx file (200), not 406.
    """
    group = GroupModel.objects.create(name="accgrp")
    _make_orders(group, 3, course="FS")

    response = admin_client.get(
        reverse("crm_orders_export"),
        {"group_name_contains": "accgrp"},
        HTTP_ACCEPT=XLSX_CONTENT_TYPE,
    )

    assert response.status_code == 200
    assert XLSX_CONTENT_TYPE in response["Content-Type"]
    assert ".xlsx" in response["Content-Disposition"]


# ---------------------------------------------------------------------------
# Filtering is honoured by the export
# ---------------------------------------------------------------------------

@override_settings(EXPORT_SYNC_MAX_ROWS=1000)
@pytest.mark.django_db
def test_export_applies_course_filter(admin_client):
    """
    Exporting with ?course=FS returns exactly the FS rows of the (group-isolated)
    set — the QACX rows are excluded.
    """
    group = GroupModel.objects.create(name="coursegrp")
    fs_orders = _make_orders(group, 3, course="FS", status="in_work")
    _make_orders(group, 2, course="QACX", status="in_work")  # must NOT appear

    response = admin_client.get(
        reverse("crm_orders_export"),
        {"group_name_contains": "coursegrp", "course": "FS"},
    )

    assert response.status_code == 200
    header, data_rows = _load_rows(response)
    assert header == EXPECTED_HEADER

    exported_ids = {row[COL["ID"]] for row in data_rows}
    assert exported_ids == {o.id for o in fs_orders}
    assert all(row[COL["Course"]] == "FS" for row in data_rows)


@override_settings(EXPORT_SYNC_MAX_ROWS=1000)
@pytest.mark.django_db
def test_export_applies_my_filter(manager_client, manager_user, another_manager):
    """
    ?my=true exports only orders assigned to the requesting manager. The manager
    fixture owns none of the seed rows, so the exported set equals exactly the
    rows we assign to them (orders owned by another manager / nobody are excluded).
    """
    group = GroupModel.objects.create(name="mygrp")
    mine = _make_orders(group, 3, status="in_work", manager=manager_user)
    OrdersModel.objects.create(name="Other", group=group, status="in_work", manager=another_manager)
    OrdersModel.objects.create(name="Nobody", group=group, status=None, manager=None)

    response = manager_client.get(reverse("crm_orders_export"), {"my": "true"})

    assert response.status_code == 200
    _, data_rows = _load_rows(response)

    exported_ids = {row[COL["ID"]] for row in data_rows}
    assert exported_ids == {o.id for o in mine}
    assert all(row[COL["Manager"]] == manager_user.surname for row in data_rows)


# ---------------------------------------------------------------------------
# Invalid filter
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_export_invalid_course_filter_returns_400(admin_client):
    """An invalid choice for a ChoiceFilter (course) fails validation → 400."""
    response = admin_client.get(
        reverse("crm_orders_export"), {"course": "not_a_real_course"}
    )
    assert response.status_code == 400


# ---------------------------------------------------------------------------
# ASYNC large path (Celery eager)
# ---------------------------------------------------------------------------

@override_settings(EXPORT_SYNC_MAX_ROWS=0)
@pytest.mark.django_db
def test_export_async_dispatch_status_and_download(admin_client, manager_user):
    """
    With the threshold forced to 0 any non-empty filtered set goes async: the
    dispatch returns 202 + task_id; because Celery runs eagerly the task has
    already finished, so status is SUCCESS/ready and download streams the .xlsx.
    The downloaded workbook has the same header and one row per order.
    """
    group = GroupModel.objects.create(name="asyncgrp")
    orders = _make_orders(group, 4, course="FS", status="in_work", manager=manager_user)

    dispatch = admin_client.get(
        reverse("crm_orders_export"), {"group_name_contains": "asyncgrp"}
    )
    assert dispatch.status_code == 202
    task_id = dispatch.json()["task_id"]
    assert task_id

    status = admin_client.get(reverse("crm_orders_export_status", args=[task_id]))
    assert status.status_code == 200
    body = status.json()
    assert body["state"] == "SUCCESS"
    assert body["ready"] is True

    download = admin_client.get(reverse("crm_orders_export_download", args=[task_id]))
    assert download.status_code == 200
    assert XLSX_CONTENT_TYPE in download["Content-Type"]

    header, data_rows = _load_rows(download)
    assert header == EXPECTED_HEADER
    assert len(data_rows) == len(orders)
    assert {row[COL["ID"]] for row in data_rows} == {o.id for o in orders}


@pytest.mark.django_db
def test_sync_and_async_produce_identical_workbook_shape(admin_client, manager_user):
    """
    For the very same data and filter, the synchronous file and the
    asynchronously generated file share the same header and the same row count
    (and the same row order) — they come from the identical builder
    (OrderExportService.build_workbook).
    """
    group = GroupModel.objects.create(name="identgrp")
    orders = _make_orders(
        group, 6, course="FS", status="in_work", manager=manager_user, age=20
    )
    params = {"group_name_contains": "identgrp", "order": "id"}
    url = reverse("crm_orders_export")

    # Sync path (threshold high enough that the set is returned inline).
    with override_settings(EXPORT_SYNC_MAX_ROWS=1000):
        sync_resp = admin_client.get(url, params)
    assert sync_resp.status_code == 200
    sync_header, sync_rows = _load_rows(sync_resp)

    # Async path (threshold forced to 0).
    with override_settings(EXPORT_SYNC_MAX_ROWS=0):
        dispatch = admin_client.get(url, params)
        assert dispatch.status_code == 202
        task_id = dispatch.json()["task_id"]
    download = admin_client.get(reverse("crm_orders_export_download", args=[task_id]))
    assert download.status_code == 200
    async_header, async_rows = _load_rows(download)

    assert sync_header == async_header == EXPECTED_HEADER
    assert len(sync_rows) == len(async_rows) == len(orders)
    # Same builder + same explicit ordering → identical ID column.
    assert [r[COL["ID"]] for r in sync_rows] == [r[COL["ID"]] for r in async_rows]
