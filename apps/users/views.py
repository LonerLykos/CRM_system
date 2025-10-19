from rest_framework import status
from rest_framework.generics import ListCreateAPIView, UpdateAPIView, RetrieveAPIView
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from apps.users.serializers import UserSerializer

UserModel = get_user_model()


class UserListView(ListCreateAPIView):
    queryset = UserModel.objects.all()
    serializer_class = UserSerializer


class UserRetrieveView(RetrieveAPIView):
    queryset = UserModel.objects.all()
    serializer_class = UserSerializer


class UserActivateView(UpdateAPIView):
    queryset = UserModel.objects.all()
    serializer_class = UserSerializer

    def patch(self, request, *args, **kwargs):
        # user = self.get_object()
        # activation_token = generate_activation_token(user)
        # activation_url = f"{settings.front}set-password/{activation_token}"
        #
        # return Response({
        #     "detail": "User activated successfully",
        #     "activation_url": activation_url
        # }, status=status.HTTP_200_OK)
        pass


class SetPasswordView(UpdateAPIView):
    queryset = UserModel.objects.all()
    serializer_class = UserSerializer

    def patch(self, request, *args, **kwargs):
        # token = kwargs.get("token")
        # user = get_user_from_token(token)
        # new_password = request.data.get("password")
        #
        # user.set_password(new_password)
        # user.is_active = True
        # user.save()
        # return Response(status=status.HTTP_200_OK)
        pass


class ToggleBanUserView(UpdateAPIView):
    queryset = UserModel.objects.all()
    serializer_class = UserSerializer

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_banned = not user.is_banned
        user.save()
