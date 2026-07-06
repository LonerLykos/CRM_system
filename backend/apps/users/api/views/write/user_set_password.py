from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.auth.services.auth_service import AuthService
from apps.users.services.user_service import UserService


class UserSetPasswordView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=inline_serializer(
            name='SetPasswordRequest',
            fields={
                'password': serializers.CharField(
                    help_text='New password to set for the user account'
                ),
            },
        ),
        responses={
            200: inline_serializer(
                name='SetPasswordResponse',
                fields={
                    'message': serializers.CharField(
                        help_text='Confirmation message, e.g. "Successful"'
                    ),
                    'access_token': serializers.CharField(
                        help_text='JWT access token (RS256). Also set as httpOnly cookie `access_token`.'
                    ),
                    'refresh_token': serializers.CharField(
                        help_text='JWT refresh token (RS256). Also set as httpOnly cookie `refresh_token`.'
                    ),
                },
            ),
        },
        summary='Set password via one-time token',
        description=(
            'Verifies the one-time `PasswordToken` from the URL path, sets the '
            'provided password on the user account (and marks the account as active), '
            'then issues a new JWT pair returned both in the response body and as '
            'httpOnly cookies (`access_token`, `refresh_token`). '
            'The token is single-use and is blacklisted after verification. '
            'No authentication required.'
        ),
    )
    def post(self, request, token, *args, **kwargs):
        user = UserService.user_set_password(request.data.get('password'), token)
        auth_data = AuthService.get_auth_data(user)

        response = Response({
                "message": "Successful",
                **auth_data,
            }, status=status.HTTP_200_OK)

        response.set_cookie(
            "access_token",
            auth_data['access_token'],
            **AuthService.set_cookie_settings()
        )

        response.set_cookie(
            "refresh_token",
            auth_data['refresh_token'],
            **AuthService.set_cookie_settings()
        )

        return response
