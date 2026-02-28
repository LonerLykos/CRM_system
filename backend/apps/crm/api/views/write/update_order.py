from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.crm.serializers.orders_serializers import OrdersSerializer
from apps.crm.services.order_services import OrderService


class OrderUpdateView(APIView):
    def patch(self, request, pk):
        serializer = OrdersSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        service = OrderService(user=request.user)

        order = service.update(
            order_id=pk,
            data=serializer.validated_data
        )

        return Response(OrdersSerializer(order).data, status=status.HTTP_200_OK)
