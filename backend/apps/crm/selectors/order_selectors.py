from core.exceptions.orders_exceptions import OrderNotFound
from core.selectors import BaseSelector
from apps.crm.models.orders_model import OrdersModel


class OrderSelector(BaseSelector):
    model = OrdersModel

    def get_queryset(self):
        return self.model.objects.for_list()

    def get_by_id(self, pk: int):
        try:
            return self.model.objects.for_detail().get(pk=pk)
        except self.model.DoesNotExist:
            raise OrderNotFound
