from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.auth.services.auth_service import AuthService
from apps.users.serializers.serializers import SetPasswordSerializer
from apps.users.services.user_service import UserService


class UserSetPasswordView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=SetPasswordSerializer,
        responses={
            400: OpenApiResponse(
                description='Password rejected (shorter than 8 characters or entirely numeric). '
                            'The token is not consumed, so the same link can be retried.',
            ),
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
        serializer = SetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = UserService.user_set_password(serializer.validated_data['password'], token)
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
