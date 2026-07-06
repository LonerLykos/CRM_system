from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework.generics import ListAPIView

from apps.crm.filters.crm_filter import OrderFilter
from apps.crm.selectors.order_selectors import OrderSelector
from apps.crm.serializers.orders_serializers import OrderListSerializer


@extend_schema_view(
    get=extend_schema(
        operation_id='orders_list',
        summary='List the filtered, paginated orders',
        parameters=[
            OpenApiParameter('name_contains', OpenApiTypes.STR, description='Filter by name (case-insensitive contains)'),
            OpenApiParameter('surname_contains', OpenApiTypes.STR, description='Filter by surname (case-insensitive contains)'),
            OpenApiParameter('email_contains', OpenApiTypes.STR, description='Filter by email (case-insensitive contains)'),
            OpenApiParameter('phone_contains', OpenApiTypes.STR, description='Filter by phone (case-insensitive contains)'),
            OpenApiParameter('age_eq', OpenApiTypes.INT, description='Filter by exact age'),
            OpenApiParameter('course', OpenApiTypes.STR, description='Filter by course (FS, QACX, JCX, JSCX, FE, PCX)'),
            OpenApiParameter('course_type', OpenApiTypes.STR, description='Filter by course type (pro, minimal, premium, incubator, vip)'),
            OpenApiParameter('course_format', OpenApiTypes.STR, description='Filter by course format (static, online)'),
            OpenApiParameter('status', OpenApiTypes.STR, description='Filter by status (new, in_work, agree, disagree, dubbing)'),
            OpenApiParameter('sum_eq', OpenApiTypes.FLOAT, description='Filter by exact sum'),
            OpenApiParameter('already_paid_eq', OpenApiTypes.FLOAT, description='Filter by exact already_paid'),
            OpenApiParameter('group', OpenApiTypes.INT, description='Filter by exact group id'),
            OpenApiParameter('group_name_contains', OpenApiTypes.STR, description='Filter by group name (case-insensitive contains)'),
            OpenApiParameter('created_at_lte', OpenApiTypes.DATETIME, description='Filter by created_at <= value'),
            OpenApiParameter('created_at_gte', OpenApiTypes.DATETIME, description='Filter by created_at >= value'),
            OpenApiParameter('my', OpenApiTypes.BOOL, description='If true, return only orders assigned to the current manager'),
            OpenApiParameter('order', OpenApiTypes.STR, description='Ordering field (prefix with - for descending). Allowed: id, name, surname, email, phone, age, course, course_format, course_type, sum, already_paid, created_at, status, group, manager'),
        ],
    )
)
class OrdersListView(ListAPIView):
    serializer_class = OrderListSerializer
    filterset_class = OrderFilter
    selector = OrderSelector()

    def get_queryset(self):
        return self.selector.get_queryset()
