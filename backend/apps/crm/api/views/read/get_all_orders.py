from rest_framework.generics import ListAPIView
from apps.crm.filters.crm_filter import OrderFilter
from apps.crm.selectors.order_selectors import OrderSelector
from apps.crm.serializers.orders_serializers import OrdersSerializer


class OrdersListAPIView(ListAPIView):
    serializer_class = OrdersSerializer
    filterset_class = OrderFilter

    def get_queryset(self):
        return OrderSelector().list()
