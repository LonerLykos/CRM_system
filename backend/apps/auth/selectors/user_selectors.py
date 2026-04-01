from django.contrib.auth import get_user_model
from core.selectors import BaseSelector


class UserSelector(BaseSelector):
    model = get_user_model()
