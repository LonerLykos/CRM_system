from core.exceptions.orders_exceptions import OrderNotFound, OrderPermissionDenied
from django.db import transaction

from apps.crm.models.choices_models import StatusChoices
from apps.crm.models.comments_model import CommentsModel
from apps.crm.models.orders_model import OrdersModel
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
            claim = {}
            if not order.status or order.status == StatusChoices.NEW:
                claim['manager'] = self.user
                claim['status'] = StatusChoices.IN_WORK

            if claim:
                taken = OrdersModel.objects.filter(pk=order_id, manager__isnull=True).update(**claim)
                if not taken:
                    raise OrderPermissionDenied()
                
        elif order.manager != self.user:
            raise OrderPermissionDenied()

        comment = CommentsModel.objects.create(
            order=order,
            user=self.user,
            comment=text
        )

        return comment
