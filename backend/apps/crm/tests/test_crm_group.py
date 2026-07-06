"""
Tests for GroupsService.create_group() business logic.

Covers:
- Name is normalised: stripped and lowercased (' Sep ' → 'sep')
- get_or_create: repeated call with the same name returns existing object (no duplicate)
- get_or_create: repeated call with different casing returns existing object
"""
import pytest

from apps.crm.models.group_model import GroupModel
from apps.crm.services.group_service import GroupsService


@pytest.mark.django_db
def test_create_group_normalises_name():
    """
    ' Sep ' should be normalised to 'sep' and stored with that key.
    """
    service = GroupsService()
    group, created = service.create_group(" Sep ")

    assert created is True
    assert group.name == "sep"
    assert GroupModel.objects.filter(name="sep").exists()


@pytest.mark.django_db
def test_create_group_no_duplicate_on_repeat_call():
    """
    Calling create_group twice with the same (normalised) name
    returns (existing_group, False) and does not create a second row.
    """
    service = GroupsService()
    group1, created1 = service.create_group("alpha")
    group2, created2 = service.create_group("alpha")

    assert created1 is True
    assert created2 is False
    assert group1.pk == group2.pk
    assert GroupModel.objects.filter(name="alpha").count() == 1


@pytest.mark.django_db
def test_create_group_case_insensitive_deduplication():
    """
    'BETA' and 'beta' both normalise to 'beta'; second call must not create a duplicate.
    """
    service = GroupsService()
    g1, c1 = service.create_group("BETA")
    g2, c2 = service.create_group("beta")

    assert c1 is True
    assert c2 is False
    assert g1.pk == g2.pk
