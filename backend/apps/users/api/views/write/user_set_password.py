from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.auth.services.auth_service import AuthService
from apps.users.services.user_service import UserService


class UserSetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, token, *args, **kwargs):
        user = UserService.user_set_password(request.data.get('password'), token)
        auth_data = AuthService.get_auth_data(user)

        response = Response({
                "message": "Successful",
                **auth_data,
            }, status=status.HTTP_200_OK)

        response.set_cookie(
            "access_token",
            auth_data['access_token'],
            **AuthService.set_cookie_settings()
        )

        response.set_cookie(
            "refresh_token",
            auth_data['refresh_token'],
            **AuthService.set_cookie_settings()
        )

        return response
