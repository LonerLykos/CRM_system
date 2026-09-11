from core.exceptions.orders_exceptions import OrderNotFound
from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.crm.selectors.order_selectors import OrderSelector
from apps.crm.serializers.orders_serializers import OrderDetailSerializer, OrderUpdateSerializer
from apps.crm.services.order_services import OrderService


class OrderUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser, IsUnbannedUser]
    serializer_class = OrderDetailSerializer

    @extend_schema(
        request=OrderUpdateSerializer,
        responses={
            200: OrderDetailSerializer,
            400: OpenApiResponse(description='Validation error, keyed by field name.'),
        },
        summary='Update an order (partial)',
        description=(
            'Partially updates the order given by the path `pk`. Only the provided '
            'writable fields are changed (PATCH semantics). Validates age (1-100), '
            'sum / already_paid (>= 0, already_paid <= sum, the missing half taken '
            'from the stored order) and phone (E.164). Returns the full updated order.'
        ),
    )
    def patch(self, request, pk):
        order = OrderSelector().get_by_id(pk=pk)
        if not order:
            raise OrderNotFound()

        serializer = OrderUpdateSerializer(instance=order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        service = OrderService(user=request.user)

        order = service.update(
            order_id=pk,
            data=serializer.validated_data
        )

        return Response(self.serializer_class(order).data, status=status.HTTP_200_OK)
