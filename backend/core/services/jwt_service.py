from typing import Any, cast

from rest_framework_simplejwt.tokens import BlacklistMixin, Token

from core.enums.action_token_enum import ActionTokenEnum
from core.exceptions.jwt_exception import JWTException


class ActionToken(BlacklistMixin["ActionToken"], Token):
    pass


class PasswordToken(ActionToken):
    token_type = ActionTokenEnum.PASSWORD.token_type
    lifetime = ActionTokenEnum.PASSWORD.lifetime


class JWTService:
    @staticmethod
    def create_token(user, token_class: type[ActionToken]) -> str:
        return str(token_class.for_user(user))

    @staticmethod
    def verify_token(token: str, token_class: type[ActionToken]) -> str:
        try:
            token_res = token_class(cast(Any, token))
            token_res.check_blacklist()
        except Exception:
            raise JWTException

        token_res.blacklist()
        user_id = token_res.payload.get('user_id')
        if not user_id:
            raise JWTException

        return str(user_id)
