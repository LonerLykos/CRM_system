from rest_framework_simplejwt.views import TokenObtainPairView
from apps.auth.serializers.token_serializer import CustomTokenObtainPairSerializer
from apps.auth.usecases.obtain_token import ObtainTokenUseCase
from apps.auth.services.cookie_service import CookieService


class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.usecase = ObtainTokenUseCase(cookie_service=CookieService())

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        data = response.data

        access_token = data.get("access")
        refresh_token = data.get("refresh")

        response = self.usecase.execute(
            response=response,
            access_token=access_token,
            refresh_token=refresh_token
        )

        return response
