from rest_framework.generics import ListAPIView
from apps.users.selectors.users_selectors import UsersSelector
from apps.users.serializers import UserSerializer


class UserListView(ListAPIView):
    serializer_class = UserSerializer
    selector = UsersSelector()

    def get_queryset(self):
        return self.selector.get_queryset()
