from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from config import settings
from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from services.user_service import UserService


class UserRestorePasswordView(APIView):
    permission_classes = [IsAdminUser, IsActiveUser, IsUnbannedUser]

    def post(self, request, *args, **kwargs):
        user_id = self.kwargs['pk']
        token = UserService.user_restore_password(user_id)
        url = f'{settings.FRONTEND_URL}/set-password/{token}'
        response = Response({'details': url}, status.HTTP_200_OK)
        return response
