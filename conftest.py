from typing import TYPE_CHECKING, cast

import pytest
from rest_framework.test import APIClient

if TYPE_CHECKING:
    from apps.users.models.models import UserModel


@pytest.fixture
def api_client():
    """Unauthenticated DRF API client."""
    return APIClient()


@pytest.fixture
def admin_user(db):
    """Active staff/superuser (the 'admin' role)."""
    from django.contrib.auth import get_user_model

    User = cast("type[UserModel]", get_user_model())
    return User.objects.create_superuser(
        email="admin@test.com", password="adminpass", name="Admin", surname="Boss"
    )


@pytest.fixture
def manager_user(db):
    """Active, non-staff manager."""
    from django.contrib.auth import get_user_model

    User = cast("type[UserModel]", get_user_model())
    return User.objects.create_user(
        email="manager@test.com",
        password="managerpass",
        name="Man",
        surname="Ager",
        is_active=True,
    )


@pytest.fixture
def admin_client(api_client, admin_user):
    """API client authenticated as an admin (bypasses JWT via force_authenticate)."""
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def manager_client(api_client, manager_user):
    """API client authenticated as a manager."""
    api_client.force_authenticate(user=manager_user)
    return api_client
