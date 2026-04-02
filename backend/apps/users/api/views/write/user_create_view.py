from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.users.serializers.serializers import UserCreateSerializer
from apps.users.services.user_service import UserService
from config import settings
from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser



class UserCreateView(APIView):
    permission_classes = [IsAdminUser, IsActiveUser, IsUnbannedUser]
    serializer_class = UserCreateSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        token, user = UserService.create(serializer.validated_data)
        url = f'{settings.FRONTEND_URL}/set-password/{token}'
        response = Response({
            'details': f'User: {user.name}, ID: {user.id} created',
            'link': url,
            'verify_token': str(token),
        }, status.HTTP_201_CREATED)
        return response
