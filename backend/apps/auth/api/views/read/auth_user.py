from rest_framework.generics import RetrieveAPIView
from apps.auth.serializers.user_serializer import AuthUserSerializer


class AuthUserView(RetrieveAPIView):
    serializer_class = AuthUserSerializer

    def get_object(self):
        return self.request.user
