from apps.crm.models.choices_models import StatusChoices
from apps.crm.models.orders_model import OrdersModel
from django.db import transaction
from apps.crm.selectors.order_selectors import OrderSelector
from core.exceptions.orders_exceptions import OrderNotFound, OrderPermissionDenied


class OrderService:
    def __init__(self, user=None):
        self.user = user
        self.order_selector = OrderSelector()

    # maybe later
    # @transaction.atomic
    # def create(self, data: dict) -> OrdersModel:
    #     order = OrdersModel.objects.create(**data)
    #     return order

    @transaction.atomic
    def update(self, order_id: int, data: dict) -> OrdersModel:
        order = self.order_selector.get_by_id(pk=order_id)

        if not order:
            raise OrderNotFound()

        if order.manager and self.user != order.manager:
            raise OrderPermissionDenied()

        updated_fields = set()

        if order.manager is None:
            if not data.get("status") or (data.get("status") and data["status"] != StatusChoices.NEW):
                order.manager = self.user
                updated_fields.add('manager')
            if not data.get("status") and order.status in [None, 'new']:
                order.status = 'in_work'
                updated_fields.add('status')

        editable_fields = [
            'name', 'surname', 'email', 'phone', 'age',
            'course', 'course_format', 'course_type',
            'status', 'sum', 'already_paid', 'group'
        ]

        for key, value in data.items():
            if key not in editable_fields:
                continue

            if key == "status":
                if not value:
                    continue
                if value == StatusChoices.NEW:
                    order.manager = None
                    updated_fields.add('manager')

            setattr(order, key, value)
            updated_fields.add(key)

        if updated_fields:
            order.save(update_fields=list(updated_fields))

        return order
