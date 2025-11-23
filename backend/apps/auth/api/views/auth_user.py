from rest_framework.views import APIView
from rest_framework.response import Response
from apps.auth.serializers.user_serializer import AuthUserSerializer
from apps.auth.usecases.get_current_user import GetCurrentUserUseCase
from apps.auth.repositories.user_repository import UserRepository

class AuthUserView(APIView):
    def get(self, request):
        usecase = GetCurrentUserUseCase(UserRepository())
        user = usecase.execute(request.user.id)
        return Response(AuthUserSerializer(user).data)
