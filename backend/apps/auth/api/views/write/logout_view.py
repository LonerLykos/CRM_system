from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.auth.services.auth_service import AuthService


class LogoutView(APIView):

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='LogoutResponse',
                fields={
                    'message': serializers.CharField(),
                },
            ),
        },
        summary='Logout current user',
        description=(
            'Blacklists the refresh token stored in the `refresh_token` cookie '
            'and deletes both `access_token` and `refresh_token` cookies.'
        ),
    )
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        AuthService.blacklist_token(refresh_token)

        response = Response({"message": "Logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response
