from django.db import transaction
from apps.crm.models.comments_model import CommentsModel
from core.exceptions.orders_exceptions import OrderPermissionDenied, OrderNotFound
from apps.crm.selectors.order_selectors import OrderSelector


class CommentService:
    def __init__(self, user):
        self.user = user
        self.order_selector = OrderSelector()

    @transaction.atomic
    def add_comment(self, order_id: int, text: str):
        order = self.order_selector.get_by_id(pk=order_id)
        if not order:
            raise OrderNotFound()

        if order.manager is None:
            order.manager = self.user
            order.save(update_fields=['manager'])
        elif order.manager != self.user:
            raise OrderPermissionDenied()

        comment = CommentsModel.objects.create(
            order=order,
            user=self.user,
            comment=text
        )

        return comment
