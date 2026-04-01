from rest_framework_simplejwt.views import TokenObtainPairView
from apps.auth.services.auth_service import AuthService
from apps.auth.serializers.token_serializer import CustomTokenObtainPairSerializer


class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:

            return AuthService.set_auth_cookies(
                response=response,
                access=response.data.get("access"),
                refresh=response.data.get("refresh")
            )

        return response