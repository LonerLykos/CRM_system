import os
from typing import Any, cast

from config.celery import app as celery_app
from core.negotiation import IgnoreClientContentNegotiation
from django.conf import settings
from django.http import FileResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class ExportDownloadView(APIView):
    """
    GET /orders/export/{task_id}/download
    Streams the generated .xlsx file from the shared media volume once the
    task has finished successfully.
    """

    content_negotiation_class = IgnoreClientContentNegotiation

    @extend_schema(
        operation_id='orders_export_download',
        summary='Download a finished orders export',
        description=(
            'Streams the .xlsx file produced by the export task. '
            'Returns 409 if the task is not finished yet, 404 if the file has '
            'expired (purged after TTL) or the task failed.'
        ),
        responses={
            (200, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'): None,
        },
    )
    def get(self, request, task_id, *args, **kwargs):
        result = celery_app.AsyncResult(task_id)

        if not result.ready():
            return Response(
                {'detail': 'Export is not ready yet'},
                status=status.HTTP_409_CONFLICT,
            )

        if not result.successful():
            return Response(
                {'detail': 'Export failed'},
                status=status.HTTP_404_NOT_FOUND,
            )

        info = cast("dict[str, Any]", result.result or {})
        filename = info.get('filename')
        filepath = os.path.join(settings.EXPORTS_DIR, filename) if filename else None

        if not filepath or not os.path.exists(filepath):
            return Response(
                {'detail': 'Export file expired or not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        download_name = cast(str, info.get('download_name') or filename)
        return FileResponse(
            open(filepath, 'rb'),
            as_attachment=True,
            filename=download_name,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
