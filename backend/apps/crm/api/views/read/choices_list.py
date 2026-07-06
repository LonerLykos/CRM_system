from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.crm.selectors.choices_selectors import ChoicesProvider


class ChoicesView(APIView):
    provider_class = ChoicesProvider
    permission_classes = [AllowAny]

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='ChoicesResponse',
                fields={
                    'course': serializers.DictField(
                        child=serializers.CharField(),
                        help_text='Map of course value → label, e.g. {"FS": "Fullstack", ...}',
                    ),
                    'course_type': serializers.DictField(
                        child=serializers.CharField(),
                        help_text='Map of course_type value → label, e.g. {"pro": "Pro", ...}',
                    ),
                    'course_format': serializers.DictField(
                        child=serializers.CharField(),
                        help_text='Map of course_format value → label, e.g. {"static": "Static", ...}',
                    ),
                    'status': serializers.DictField(
                        child=serializers.CharField(),
                        help_text='Map of status value → label, e.g. {"new": "New", ...}',
                    ),
                },
            ),
        },
        summary='Get available choices for order fields',
        description=(
            'Returns dictionaries of allowed values for `course`, `course_type`, '
            '`course_format`, and `status` fields. Each dict maps the stored value '
            'to its human-readable label. No authentication required.'
        ),
    )
    def get(self, request):
        data = self.provider_class.get_all()

        return Response(data)
