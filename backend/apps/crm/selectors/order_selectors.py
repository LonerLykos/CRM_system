from core.selectors import BaseSelector
from apps.crm.models.orders_model import OrdersModel


class OrderSelector(BaseSelector):
    model = OrdersModel

    def get_queryset(self):
        return self.model.objects.with_prefetches()

    def get_by_id(self, pk: int):
        return self.get_queryset().filter(pk=pk).first()
