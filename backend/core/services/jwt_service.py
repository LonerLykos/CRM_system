from typing import Type
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import BlacklistMixin, Token
from core.enums.action_token_enum import ActionTokenEnum
from core.exceptions.jwt_exception import JWTException

UserModel = get_user_model()
ActionTokenClassType = Type[BlacklistMixin|Token]


class ActionToken(BlacklistMixin, Token):
    pass


class PasswordToken(ActionToken):
    token_type = ActionTokenEnum.PASSWORD.token_type
    lifetime = ActionTokenEnum.PASSWORD.lifetime


class JWTService:
    @staticmethod
    def create_token(user, token_class:ActionTokenClassType) -> str:
        return token_class.for_user(user)

    @staticmethod
    def verify_token(token, token_class:ActionTokenClassType) -> bool | str:
        try:
            token_res = token_class(token)
            token_res.check_blacklist()
        except Exception:
            raise JWTException

        token_res.blacklist()
        user_id = str(token_res.payload.get('user_id'))
        if not user_id:
            raise JWTException

        return user_id
