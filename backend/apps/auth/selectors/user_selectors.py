from django.contrib.auth import get_user_model
from core.selectors import BaseSelector


class UserSelector(BaseSelector):
    model = get_user_model()

    def get_user_by_id(self, user_id: int):
        return self.model.objects.get(pk=user_id)
