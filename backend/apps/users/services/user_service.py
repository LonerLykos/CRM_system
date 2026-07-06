from core.exceptions.users_exceptions import SelfActionDenied, UserNotFound, UserPermissionDenied
from core.services.jwt_service import JWTService, PasswordToken
from django.db import transaction

from apps.users.selectors.users_selectors import UsersSelector


class UserService:
    user_selector = UsersSelector()

    @classmethod
    @transaction.atomic
    def create(cls, data: dict) :
        user = cls.user_selector.model.objects.create_user(**data)
        token = JWTService.create_token(user, PasswordToken)
        return token, user

    @classmethod
    @transaction.atomic
    def user_active_toggle(cls, user_id, requester_id=None):
        if requester_id is not None and str(user_id) == str(requester_id):
            raise SelfActionDenied()
        current_user = cls.user_selector.get_by_id(user_id)
        if not current_user:
            raise UserNotFound()
        current_user.is_active = not current_user.is_active
        current_user.save()
        return current_user

    @classmethod
    @transaction.atomic
    def user_ban_toggle(cls, user_id, requester_id=None):
        if requester_id is not None and str(user_id) == str(requester_id):
            raise SelfActionDenied()
        current_user = cls.user_selector.get_by_id(user_id)
        if not current_user:
            raise UserNotFound()
        current_user.is_banned = not current_user.is_banned
        current_user.save()
        return current_user

    @classmethod
    @transaction.atomic
    def user_set_password(cls, password: str, token: str | None = None):
        if not token:
            raise UserPermissionDenied
        user_id = JWTService.verify_token(token, PasswordToken)
        current_user = cls.user_selector.get_by_id(user_id)
        if not current_user:
            raise UserNotFound()
        current_user.set_password(password)
        current_user.is_active = True
        current_user.save()
        return current_user

    @classmethod
    def user_restore_password(cls, user_id):
        current_user = cls.user_selector.get_by_id(user_id)
        if not current_user:
            raise UserNotFound()
        current_user.set_unusable_password()
        current_user.save()
        token = JWTService.create_token(current_user, PasswordToken)
        return token, current_user
