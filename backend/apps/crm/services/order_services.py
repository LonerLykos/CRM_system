from apps.crm.models.orders_model import OrdersModel
from django.db import transaction

from apps.crm.selectors.order_selectors import OrderSelector
from core.exceptions.orders_exceptions import OrderNotFound, OrderPermissionDenied


class OrderService:
    def __init__(self, user=None):
        self.user = user
        self.order_selector = OrderSelector()

    @transaction.atomic
    def create(self, data: dict) -> OrdersModel:
        order = OrdersModel.objects.create(**data)
        return order

    @transaction.atomic
    def update(self, order_id: int, data: dict) -> OrdersModel:
        order = self.order_selector.get_by_id(pk=order_id)

        if not order:
            raise OrderNotFound()

        if order.manager and self.user != order.manager:
            raise OrderPermissionDenied()

        if order.manager is None:
            order.manager = self.user
            if not data.get("status") and order.status in [None, 'new']:
                order.status = 'in_work'

        for key, value in data.items():
            if key == "status" and not value:
                continue
            setattr(order, key, value)

        order.save()

        return order
