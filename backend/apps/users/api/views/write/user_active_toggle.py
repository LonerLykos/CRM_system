from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.users.serializers.serializers import UserResponseSerializer
from apps.users.services.user_service import UserService
from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser


class UserActiveToggleView(APIView):
    permission_classes = [IsAdminUser, IsActiveUser, IsUnbannedUser]
    serializer_class = UserResponseSerializer

    def patch(self, request, pk):
        user = UserService.user_active_toggle(pk)

        return Response(
            self.serializer_class(user).data, status=status.HTTP_200_OK)
