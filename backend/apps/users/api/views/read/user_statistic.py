from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.permissions import IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.crm.selectors.order_selectors import OrderSelector
from apps.users.serializers.serializers import OrderStatisticSerializer


class _BaseUserStatisticView(APIView):
    """
    Shared order-status statistics logic. Not routed directly; see the two
    concrete subclasses below (global vs per-manager), split so each URL gets a
    distinct operationId in the OpenAPI schema.
    """

    permission_classes = [IsAdminUser, IsActiveUser, IsUnbannedUser]
    selector = OrderSelector()

    def _stats_response(self, manager_id: int | None) -> Response:
        stats = self.selector.get_status_stats(manager_id=manager_id)
        return Response(OrderStatisticSerializer(stats).data)


class GlobalUserStatisticView(_BaseUserStatisticView):
    """GET /users/statistic — global order statistics across all orders."""

    @extend_schema(
        operation_id='users_statistic_global',
        responses={200: OrderStatisticSerializer},
        summary='Get global order status statistics',
        description=(
            'Returns counts of orders grouped by status (total, new, in_work, '
            'agree, disagree, dubbing) across ALL orders. Admin-only.'
        ),
    )
    def get(self, request: Request) -> Response:
        return self._stats_response(manager_id=None)


class ManagerUserStatisticView(_BaseUserStatisticView):
    """GET /users/<pk>/statistic — per-manager order statistics."""

    @extend_schema(
        operation_id='users_statistic_manager',
        parameters=[
            OpenApiParameter(
                name='pk',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                required=True,
                description='Manager (user) ID whose orders are counted.',
            ),
        ],
        responses={200: OrderStatisticSerializer},
        summary='Get per-manager order status statistics',
        description=(
            'Returns counts of orders grouped by status (total, new, in_work, '
            'agree, disagree, dubbing) for the given manager only. Admin-only.'
        ),
    )
    def get(self, request: Request, pk: int) -> Response:
        return self._stats_response(manager_id=pk)
