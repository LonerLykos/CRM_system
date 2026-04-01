from rest_framework.generics import ListAPIView
from apps.crm.filters.crm_filter import OrderFilter
from apps.crm.selectors.order_selectors import OrderSelector
from apps.crm.serializers.orders_serializers import OrderListSerializer


class OrdersListView(ListAPIView):
    serializer_class = OrderListSerializer
    filterset_class = OrderFilter
    selector = OrderSelector()

    def get_queryset(self):
        return self.selector.get_queryset()
