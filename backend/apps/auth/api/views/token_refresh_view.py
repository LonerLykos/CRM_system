from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenRefreshView
import structlog
from apps.auth.services.cookie_service import CookieService
from apps.auth.usecases.refresh_token import RefreshTokenUseCase
from apps.auth.repositories.token_repository import TokenRepository

log = structlog.get_logger()


class CookieTokenRefreshView(TokenRefreshView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.usecase = RefreshTokenUseCase(
            cookie_service=CookieService(),
            token_repository=TokenRepository()
        )

    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get('refresh_token')
        if not refresh:
            log.error('Refresh token is missing')
            return Response({'detail': 'You need to login'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={'refresh': refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            log.error('Invalid refresh token')
            return Response({'detail': 'You need to login'}, status=status.HTTP_401_UNAUTHORIZED)

        data = serializer.validated_data
        access_token = data['access']
        refresh_token = data['refresh']

        response = Response()
        response = self.usecase.execute(access_token, refresh_token, response)

        return response
