from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.crm.serializers.orders_serializers import OrderDetailSerializer
from apps.crm.services.order_services import OrderService


class OrderUpdateView(APIView):
    serializer_class = OrderDetailSerializer

    def patch(self, request, pk):
        serializer = self.serializer_class(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        service = OrderService(user=request.user)

        order = service.update(
            order_id=pk,
            data=serializer.validated_data
        )

        return Response(self.serializer_class(order).data, status=status.HTTP_200_OK)
