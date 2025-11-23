from rest_framework_simplejwt.tokens import RefreshToken


class TokenRepository:
    def blacklist(self, token_str: str) -> None:
        token = RefreshToken(token_str)
        token.blacklist()
