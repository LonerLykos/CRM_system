from rest_framework.generics import RetrieveAPIView
from apps.auth.selectors.user_selectors import UserSelector
from apps.auth.serializers.user_serializer import AuthUserSerializer


class AuthUserView(RetrieveAPIView):
    serializer_class = AuthUserSerializer
    selector = UserSelector()

    def get_object(self):
        return self.selector.get_user_by_id(self.kwargs['pk'])
