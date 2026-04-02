from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAdminUser
from apps.users.selectors.users_selectors import UsersSelector
from apps.users.serializers.serializers import UserResponseSerializer
from core.exceptions.users_exceptions import UserNotFound
from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser


class UserDetailsView(RetrieveAPIView):
    permission_classes = [IsAdminUser, IsActiveUser, IsUnbannedUser]
    serializer_class = UserResponseSerializer
    selector = UsersSelector()

    def get_object(self):
        user = self.selector.get_by_id(self.kwargs['pk'])
        if not user:
            raise UserNotFound
        return user
