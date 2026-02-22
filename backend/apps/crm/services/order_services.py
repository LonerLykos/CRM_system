from apps.crm.models.orders_model import OrdersModel
from django.db import transaction

class OrderService:
    def __init__(self, user=None):
        self.user = user

    @transaction.atomic
    def create(self, data: dict) -> OrdersModel:
        order = OrdersModel.objects.create(**data)

        return order

    @transaction.atomic
    def update(self, order_id: int, data: dict) -> OrdersModel:
        order = OrdersModel.objects.get(id=order_id)
        for key, value in data.items():
            setattr(order, key, value)
        order.save()
        return order