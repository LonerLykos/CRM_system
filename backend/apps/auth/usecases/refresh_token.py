import structlog
from django.db import transaction

from apps.auth.repositories.token_repository import TokenRepository
from apps.auth.services.cookie_service import CookieService

log = structlog.get_logger()

class RefreshTokenUseCase:
    def __init__(self, cookie_service: CookieService, token_repository: TokenRepository):
        self.cookie_service = cookie_service
        self.token_repository = token_repository

    def execute(self, access_token: str, refresh_token: str, response):

        self.cookie_service.set_auth_cookies(response, access_token, refresh_token)

        response.data = {
            "message": "Successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
        response.status_code = 200
        return response
