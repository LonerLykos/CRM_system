import structlog
from apps.auth.repositories.token_repository import TokenRepository

log = structlog.get_logger()


class LogoutUserUseCase:
    def __init__(self):
        self.token_repo = TokenRepository()

    def execute(self, refresh_token: str | None):
        if not refresh_token:
            log.error("Refresh token is missing")
            return

        try:
            self.token_repo.blacklist(refresh_token)
        except Exception:
            log.exception("Invalid refresh token")
