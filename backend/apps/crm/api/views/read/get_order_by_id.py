from rest_framework.generics import RetrieveAPIView
from apps.crm.models.orders_model import OrdersModel
from apps.crm.serializers.orders_serializers import OrdersSerializer


class GetOrderById(RetrieveAPIView):
    queryset = OrdersModel.objects.all()
    serializer_class = OrdersSerializer
