from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenRefreshView
from apps.auth.services.auth_service import AuthService
import structlog

log = structlog.get_logger()


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        old_refresh = request.COOKIES.get('refresh_token')

        if not old_refresh:
            log.warning('Refresh token missing in cookies')
            return Response({'detail': 'You need to login'}, status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer({'refresh': old_refresh})

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
