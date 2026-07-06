import structlog
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenRefreshView

from apps.auth.services.auth_service import AuthService

log = structlog.get_logger()


class CookieTokenRefreshView(TokenRefreshView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='CookieTokenRefreshResponse',
                fields={
                    'message': serializers.CharField(help_text='"Successful" when the refresh succeeds.'),
                    'access_token': serializers.CharField(help_text='New JWT access token. Also set as httpOnly cookie `access_token`.'),
                    'refresh_token': serializers.CharField(help_text='New JWT refresh token. Also set as httpOnly cookie `refresh_token`.'),
                },
            ),
            401: OpenApiResponse(
                response=inline_serializer(
                    name='CookieTokenRefreshError',
                    fields={'detail': serializers.CharField()},
                ),
                description='Missing or invalid refresh cookie; both auth cookies are cleared and the token is blacklisted.',
            ),
        },
        summary='Refresh JWT pair from cookie',
        description=(
            'Reads the refresh token from the httpOnly `refresh_token` cookie (NOT '
            'the request body), rotates the JWT pair, and sets new `access_token` / '
            '`refresh_token` cookies. Rate-limited by the `auth` scope (10/min).'
        ),
    )
    def post(self, request, *args, **kwargs):
        old_refresh = request.COOKIES.get('refresh_token')

        if not old_refresh:
            log.warning('Refresh token missing in cookies')
            return Response({'detail': 'You need to login'}, status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={'refresh': old_refresh})

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            log.error(f'Invalid refresh token: {str(e)}')
            response = Response({'detail': 'You need to login'}, status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            AuthService.blacklist_token(old_refresh)
            return response

        new_access = serializer.validated_data.get('access')
        new_refresh = serializer.validated_data.get('refresh')

        data = {
            "message": "Successful",
            "access_token": new_access,
            "refresh_token": new_refresh,
        }

        response = Response(data, status.HTTP_200_OK)
        response.set_cookie("access_token", new_access, **AuthService.set_cookie_settings())
        response.set_cookie("refresh_token", new_refresh, **AuthService.set_cookie_settings())

        return response
