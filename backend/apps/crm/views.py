from rest_framework.generics import ListAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from .filter import OrderFilter
from .models import OrdersModel
from .serializers import OrdersSerializer


class OrdersListAPIView(ListAPIView):
    queryset = OrdersModel.objects.all()
    serializer_class = OrdersSerializer
    filterset_class = OrderFilter
    permission_classes = (IsAuthenticated,)


class OrdersUpdateAPIView(UpdateAPIView):
    queryset = OrdersModel.objects.all()
    serializer_class = OrdersSerializer
    permission_classes = (IsAuthenticated,)

