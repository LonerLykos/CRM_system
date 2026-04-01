from core.selectors import BaseSelector
from apps.users.models import UserModel


class UsersSelector(BaseSelector):
    model = UserModel
