from rest_framework_simplejwt.views import TokenObtainPairView
from apps.auth.services.auth_service import AuthService
from apps.auth.serializers.token_serializer import CustomTokenObtainPairSerializer


class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access = response.data.get("access")
            refresh = response.data.get("refresh")

            response.set_cookie("access_token", access, **AuthService.set_cookie_settings())
            response.set_cookie("refresh_token", refresh, **AuthService.set_cookie_settings())

            response.data = {
                "message": "Successful",
                "access_token": access,
                "refresh_token": refresh,
            }

        return response
