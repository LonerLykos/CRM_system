from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.auth.services.auth_service import AuthService


class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        response = Response({"message": "Logged out"}, status=status.HTTP_200_OK)

        return AuthService.logout(response, refresh_token)
