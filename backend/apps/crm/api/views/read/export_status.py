from typing import Any, cast

from config.celery import app as celery_app
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from core.negotiation import IgnoreClientContentNegotiation


class ExportStatusView(APIView):
    """
    GET /orders/export/{task_id}
    Returns the state and row-level progress of an export task so the client
    can poll until the file is ready, then hit the download endpoint.
    """

    content_negotiation_class = IgnoreClientContentNegotiation

    @extend_schema(
        operation_id='orders_export_status',
        responses={
            200: inline_serializer(
                name='ExportStatusResponse',
                fields={
                    'task_id': serializers.CharField(),
                    'state': serializers.ChoiceField(
                        choices=['PENDING', 'PROGRESS', 'SUCCESS', 'FAILURE'],
                        help_text='Celery task state.',
                    ),
                    'ready': serializers.BooleanField(help_text='True once the task has finished (success or failure).'),
                    'progress': inline_serializer(
                        name='ExportProgress',
                        fields={
                            'processed': serializers.IntegerField(),
                            'total': serializers.IntegerField(),
                        },
                        required=False,
                    ),
                    'download_name': serializers.CharField(
                        required=False,
                        help_text='Filename to pass to the download endpoint. Present when state=SUCCESS.',
                    ),
                    'error': serializers.CharField(
                        required=False,
                        help_text='Error message. Present when state=FAILURE.',
                    ),
                },
            ),
        },
        summary='Get orders export task status/progress',
        description=(
            'Poll the state of an export task. Possible states: PENDING, '
            'PROGRESS (with processed/total), SUCCESS (ready=true, download_name '
            'set), FAILURE (error set).'
        ),
    )
    def get(self, request, task_id, *args, **kwargs):
        result = celery_app.AsyncResult(task_id)
        data = {
            'task_id': task_id,
            'state': result.state,
            'ready': result.ready(),
        }

        if result.state == 'PROGRESS':
            data['progress'] = result.info  # {'processed': int, 'total': int}
        elif result.state == 'SUCCESS':
            info = cast("dict[str, Any]", result.result or {})
            total = info.get('total')
            data['progress'] = {'processed': total, 'total': total}
            data['download_name'] = info.get('download_name')
        elif result.state == 'FAILURE':
            data['error'] = str(result.info)

        return Response(data)
