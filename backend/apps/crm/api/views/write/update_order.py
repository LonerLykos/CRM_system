from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.crm.serializers.orders_serializers import OrderDetailSerializer
from apps.crm.services.order_services import OrderService


class OrderUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser, IsUnbannedUser]
    serializer_class = OrderDetailSerializer

    @extend_schema(
        request=OrderDetailSerializer,
        responses={200: OrderDetailSerializer},
        summary='Update an order (partial)',
        description=(
            'Partially updates the order given by the path `pk`. Only the provided '
            'writable fields are changed (PATCH semantics). Returns the full updated '
            'order.'
        ),
    )
    def patch(self, request, pk):
        serializer = self.serializer_class(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        service = OrderService(user=request.user)

        order = service.update(
            order_id=pk,
            data=serializer.validated_data
        )

        return Response(self.serializer_class(order).data, status=status.HTTP_200_OK)
