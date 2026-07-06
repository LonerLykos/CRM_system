from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser

from apps.users.selectors.users_selectors import UsersSelector
from apps.users.serializers.serializers import UserListSerializer


class UserListView(ListAPIView):
    permission_classes = [IsAdminUser, IsActiveUser, IsUnbannedUser]
    serializer_class = UserListSerializer
    selector = UsersSelector()

    def get_queryset(self):
        return self.selector.get_queryset_with_stats()
