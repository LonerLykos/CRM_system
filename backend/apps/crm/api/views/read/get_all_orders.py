from rest_framework.generics import ListAPIView
from apps.crm.filters.crm_filter import OrderFilter
from apps.crm.models.orders_model import OrdersModel
from apps.crm.serializers.orders_serializers import OrdersSerializer


class OrdersListAPIView(ListAPIView):
    queryset = OrdersModel.objects.all()
    serializer_class = OrdersSerializer
    filterset_class = OrderFilter