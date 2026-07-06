import io

from core.negotiation import IgnoreClientContentNegotiation
from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.crm.filters.crm_filter import OrderFilter
from apps.crm.selectors.order_selectors import OrderSelector
from apps.crm.services.export_service import OrderExportService
from apps.crm.tasks import generate_orders_export

XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


class OrdersExportView(APIView):
    """
    GET /orders/export
    Exports the filtered order list to Excel (no pagination — all matching
    records). Small result sets (count <= settings.EXPORT_SYNC_MAX_ROWS) are
    built synchronously and returned as the .xlsx file (200). Larger sets are
    dispatched to a Celery worker and a task id is returned (202); poll
    GET /orders/export/{task_id} for progress and download when ready.
    Applies the same OrderFilter as OrdersListView.
    """

    content_negotiation_class = IgnoreClientContentNegotiation

    @extend_schema(
        operation_id='orders_export',
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
            OpenApiParameter('my', OpenApiTypes.BOOL, description='If true, export only orders assigned to the current manager'),
            OpenApiParameter('order', OpenApiTypes.STR, description='Ordering field (prefix with - for descending). Allowed: id, name, surname, email, phone, age, course, course_format, course_type, sum, already_paid, created_at, status, group, manager'),
        ],
        responses={
            (200, XLSX_CONTENT_TYPE): OpenApiResponse(
                response=OpenApiTypes.BINARY,
                description='The generated .xlsx file (synchronous path, count <= EXPORT_SYNC_MAX_ROWS).',
            ),
            202: OpenApiResponse(
                response=inline_serializer(
                    name='ExportDispatchResponse',
                    fields={'task_id': serializers.CharField()},
                ),
                description='Export task accepted (count > EXPORT_SYNC_MAX_ROWS). Poll GET /orders/export/{task_id} for status.',
            ),
            400: OpenApiResponse(description='Invalid filter parameters.'),
        },
        summary='Export the filtered orders to Excel (sync or async)',
        description=(
            'Builds the filtered order list as an .xlsx file. Accepts the same '
            'query parameters as GET /orders (OrderFilter). No pagination — all '
            'matching records are exported. Result sets up to EXPORT_SYNC_MAX_ROWS '
            'are returned inline (200, binary xlsx); larger sets are queued to a '
            'background worker and a task_id is returned (202).'
        ),
    )
    def get(self, request, *args, **kwargs):
        queryset = OrderSelector().get_queryset()
        filterset = OrderFilter(request.GET, queryset=queryset, request=request)
        if not filterset.is_valid():
            return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

        filtered = filterset.qs
        count = filtered.count()

        if count <= settings.EXPORT_SYNC_MAX_ROWS:
            workbook = OrderExportService.build_workbook(filtered, count)
            buffer = io.BytesIO()
            workbook.save(buffer)

            filename = f"orders_{timezone.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            response = HttpResponse(buffer.getvalue(), content_type=XLSX_CONTENT_TYPE)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        task = generate_orders_export.delay(request.GET.urlencode(), request.user.id)
        return Response({'task_id': task.id}, status=status.HTTP_202_ACCEPTED)
