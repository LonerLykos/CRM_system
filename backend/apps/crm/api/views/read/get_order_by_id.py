from rest_framework.generics import RetrieveAPIView
from apps.crm.selectors.order_selectors import OrderSelector
from apps.crm.serializers.orders_serializers import OrderDetailSerializer


class GetOrderById(RetrieveAPIView):
    serializer_class = OrderDetailSerializer

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.selector = OrderSelector()

    def get_object(self):
        return self.selector.get_by_id(self.kwargs['pk'])
