from rest_framework.generics import RetrieveAPIView
from apps.users.selectors.users_selectors import UsersSelector
from apps.users.serializers import UserSerializer
from core.exceptions.users_exceptions import UserNotFound


class UserDetailsView(RetrieveAPIView):
    serializer_class = UserSerializer
    selector = UsersSelector()

    def get_object(self):
        user = self.selector.get_by_id(self.kwargs['pk'])
        if not user:
            raise UserNotFound
        return user
