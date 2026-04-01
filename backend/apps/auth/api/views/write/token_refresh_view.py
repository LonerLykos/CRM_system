from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenRefreshView
from apps.auth.services.auth_service import AuthService
import structlog

log = structlog.get_logger()


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        old_refresh = request.COOKIES.get('refresh_token')

        if not old_refresh:
            log.warning('Refresh token missing in cookies')
            return Response({'detail': 'You need to login'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={'refresh': old_refresh})

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            pass
        except Exception:
            log.error('Invalid refresh token')
            response = Response({'detail': 'You need to login'}, status=status.HTTP_401_UNAUTHORIZED)
            return AuthService.logout(response)

        new_access = serializer.validated_data.get('access')
        new_refresh = serializer.validated_data.get('refresh')
        print(new_refresh)

        response = Response()

        return AuthService.set_auth_cookies(response, new_access, new_refresh)
