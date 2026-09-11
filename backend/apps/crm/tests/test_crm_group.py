"""
Tests for GroupsService.create_group() business logic.

Covers:
- Surrounding whitespace is trimmed, the case is kept as typed (' Sep A ' → 'Sep A')
- The same name in another case is a separate group ('alpha' and 'Alpha')
- A unique-index collision (e.g. two managers creating the same name at once)
  surfaces as a ValidationError on `name` (→ 400), not as an IntegrityError (→ 500)

The duplicate check itself lives in GroupsSerializer and is covered at the API
level in test_crm_api.py; the MySQL collation migration in test_crm_migrations.py.
"""
import pytest
from rest_framework.exceptions import ValidationError

from apps.crm.models.group_model import GroupModel
from apps.crm.services.group_service import GroupsService


@pytest.mark.django_db
def test_create_group_trims_and_keeps_case():
    group = GroupsService().create_group(" Sep A ")

    assert group.name == "Sep A"
    assert GroupModel.objects.filter(name="Sep A").exists()


@pytest.mark.django_db
def test_create_group_returns_the_new_row():
    group = GroupsService().create_group("alpha")

    assert group.pk is not None
    assert GroupModel.objects.filter(name="alpha").count() == 1


@pytest.mark.django_db
def test_create_group_other_case_is_a_separate_group():
    GroupModel.objects.create(name="alpha")

    group = GroupsService().create_group("Alpha")

    assert group.name == "Alpha"
    assert GroupModel.objects.filter(name__in=["alpha", "Alpha"]).count() == 2


@pytest.mark.django_db
def test_create_group_unique_collision_raises_validation_error():
    """
    The serializer check is bypassed here on purpose — this is the race window
    where the row appears between validation and insert.
    """
    GroupModel.objects.create(name="alpha")

    with pytest.raises(ValidationError) as exc:
        GroupsService().create_group("alpha")

    assert exc.value.detail == {"name": ["Group with this name already exists"]}
    assert GroupModel.objects.filter(name="alpha").count() == 1
