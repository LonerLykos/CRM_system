import structlog
from django.conf import settings
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, Token

log = structlog.get_logger()


class AuthService:
    @staticmethod
    def set_auth_cookies(response: Response, access: str, refresh: str) -> Response:
        cookie_settings = {
            "httponly": True,
            "secure": not settings.DEBUG,
            "samesite": "Lax",
            "path": "/",
        }
        response.set_cookie(key="access_token", value=access, **cookie_settings)
        response.set_cookie(key="refresh_token", value=refresh, **cookie_settings)

        response.data = {
            "message": "Successful",
            "access_token": access,
            "refresh_token": refresh,
        }
        return response

    @staticmethod
    def logout(response: Response, refresh_token: str = None) -> Response:
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                log.exception("Failed to blacklist")
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response


