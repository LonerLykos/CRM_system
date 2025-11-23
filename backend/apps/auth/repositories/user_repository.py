from django.contrib.auth import get_user_model

User = get_user_model()

class UserRepository:
    def get_by_id(self, user_id: int):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
