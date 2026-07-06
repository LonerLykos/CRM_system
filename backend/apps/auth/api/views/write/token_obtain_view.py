from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.auth.serializers.token_serializer import CustomTokenObtainPairSerializer
from apps.auth.services.auth_service import AuthService


class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    @extend_schema(
        request=CustomTokenObtainPairSerializer,
        responses={
            200: inline_serializer(
                name='CookieTokenObtainResponse',
                fields={
                    'message': serializers.CharField(help_text='"Successful" on valid credentials.'),
                    'access_token': serializers.CharField(help_text='JWT access token. Also set as httpOnly cookie `access_token`.'),
                    'refresh_token': serializers.CharField(help_text='JWT refresh token. Also set as httpOnly cookie `refresh_token`.'),
                },
            ),
            401: OpenApiResponse(description='Invalid credentials, or the account is inactive/banned.'),
        },
        summary='Obtain JWT pair (login)',
        description=(
            'Authenticates by email + password and issues a JWT access/refresh pair. '
            'The pair is returned in the response body AND set as httpOnly cookies '
            '(`access_token`, `refresh_token`). Rate-limited by the `auth` scope '
            '(10/min).'
        ),
    )
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            payload = response.data if isinstance(response.data, dict) else {}
            access = payload.get("access")
            refresh = payload.get("refresh")

            if access and refresh:
                response.set_cookie("access_token", access, **AuthService.set_cookie_settings())
                response.set_cookie("refresh_token", refresh, **AuthService.set_cookie_settings())

                response.data = {
                    "message": "Successful",
                    "access_token": access,
                    "refresh_token": refresh,
                }

        return response
