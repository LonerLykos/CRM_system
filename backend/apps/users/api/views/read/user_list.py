from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser
from apps.users.selectors.users_selectors import UsersSelector
from apps.users.serializers.serializers import UserResponseSerializer
from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser


class UserListView(ListAPIView):
    permission_classes = [IsAdminUser, IsActiveUser, IsUnbannedUser]
    serializer_class = UserResponseSerializer
    selector = UsersSelector()

    def get_queryset(self):
        return self.selector.get_queryset()
