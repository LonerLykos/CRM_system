from django.db import connections
from django.db.utils import OperationalError
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='HealthCheckOk',
                fields={
                    'status': serializers.CharField(help_text='"ok" when the process and database are healthy'),
                },
            ),
            503: inline_serializer(
                name='HealthCheckError',
                fields={
                    'status': serializers.CharField(help_text='"error" when a dependency is unavailable'),
                    'database': serializers.CharField(help_text='Failing dependency detail, e.g. "unavailable"'),
                },
            ),
        },
        summary='Liveness/readiness health probe',
        description=(
            'Unauthenticated probe for orchestrators (Docker healthcheck, k8s). '
            'Returns 200 {"status": "ok"} when the process is up and the default '
            'database answers SELECT 1; returns 503 if the database is unreachable.'
        ),
    )
    def get(self, request, *args, **kwargs):
        try:
            connections['default'].cursor().execute('SELECT 1')
        except OperationalError:
            return Response(
                {'status': 'error', 'database': 'unavailable'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({'status': 'ok'}, status=status.HTTP_200_OK)
