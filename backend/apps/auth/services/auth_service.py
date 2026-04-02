import structlog
from django.conf import settings
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, Token

log = structlog.get_logger()


class AuthService:
    @staticmethod
    def set_cookie_settings():
        return {
            "httponly": True,
            "secure": not settings.DEBUG,
            "samesite": "Lax",
            "path": "/",
        }

    @staticmethod
    def blacklist_token(refresh_token: str = None):
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                log.exception("Failed to blacklist")

    @staticmethod
    def get_auth_data(user):
        refresh = RefreshToken.for_user(user)

        return {
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        }
