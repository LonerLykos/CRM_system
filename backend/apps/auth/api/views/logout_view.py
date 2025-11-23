from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.auth.usecases.logout_user import LogoutUserUseCase
from apps.auth.services.cookie_service import CookieService


class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        LogoutUserUseCase().execute(refresh_token)

        response = Response({"message": "Logged out"}, status=status.HTTP_200_OK)
        CookieService.delete_auth_cookies(response)

        return response
