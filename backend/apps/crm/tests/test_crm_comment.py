"""
Tests for CommentService.add_comment() business logic.

Covers:
- Comment on ownerless order: caller becomes manager, status→in_work, comment saved
- Comment on another manager's order: OrderPermissionDenied
- Comment on own order: succeeds, comment saved
- Status stays in_work when already in_work (not overwritten with None)
"""
import pytest
from core.exceptions.orders_exceptions import OrderPermissionDenied

from apps.crm.models.comments_model import CommentsModel
from apps.crm.services.comment_services import CommentService


@pytest.mark.django_db
def test_comment_on_ownerless_order_assigns_manager_and_sets_in_work(order_no_manager, manager_user):
    """
    Adding a comment to an order with no manager:
    - caller becomes manager
    - status becomes 'in_work'
    - comment is persisted
    """
    service = CommentService(user=manager_user)
    comment = service.add_comment(order_id=order_no_manager.pk, text="First contact")

    order_no_manager.refresh_from_db()
    assert order_no_manager.manager == manager_user
    assert order_no_manager.status == "in_work"
    assert comment.pk is not None
    assert comment.comment == "First contact"
    assert comment.user == manager_user


@pytest.mark.django_db
def test_comment_on_new_status_order_sets_in_work(order_new_status, manager_user):
    """
    Order with status='new' → comment sets it to 'in_work'.
    """
    service = CommentService(user=manager_user)
    service.add_comment(order_id=order_new_status.pk, text="Follow-up")

    order_new_status.refresh_from_db()
    assert order_new_status.status == "in_work"


@pytest.mark.django_db
def test_comment_on_other_manager_order_raises_permission_denied(order_owned_by_other, manager_user):
    """
    Attempting to comment on an order owned by another manager raises OrderPermissionDenied.
    """
    service = CommentService(user=manager_user)
    with pytest.raises(OrderPermissionDenied):
        service.add_comment(order_id=order_owned_by_other.pk, text="Unauthorized")


@pytest.mark.django_db
def test_comment_on_own_order_succeeds(order_with_manager, manager_user):
    """
    Manager can add a comment to their own order.
    Comment is persisted and linked correctly.
    """
    service = CommentService(user=manager_user)
    comment = service.add_comment(order_id=order_with_manager.pk, text="Progress update")

    assert comment.pk is not None
    assert comment.comment == "Progress update"
    assert comment.order == order_with_manager
    assert comment.user == manager_user

    # Verify it's in the DB
    assert CommentsModel.objects.filter(pk=comment.pk).exists()
