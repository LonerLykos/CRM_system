from django.http import Http404
from rest_framework.generics import RetrieveAPIView
from apps.crm.selectors.order_selectors import OrderSelector
from apps.crm.serializers.orders_serializers import OrderDetailSerializer
from core.exceptions.orders_exceptions import OrderNotFound


class OrderDetails(RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    selector = OrderSelector()

    def get_object(self):
        order = self.selector.get_by_id(self.kwargs['pk'])
        if not order:
            raise OrderNotFound
        return order
