from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.serializers.serializers import UserResponseSerializer
from apps.users.services.user_service import UserService


class UserActiveToggleView(APIView):
    permission_classes = [IsAdminUser, IsActiveUser, IsUnbannedUser]
    serializer_class = UserResponseSerializer

    @extend_schema(
        request=None,
        responses={200: UserResponseSerializer},
        summary='Toggle a user active/inactive (admin)',
        description=(
            'Flips the `is_active` flag of the user given by the path `pk`. Takes no '
            'request body. Returns the updated user. Admin-only.'
        ),
    )
    def patch(self, request, pk):
        user = UserService.user_active_toggle(pk, request.user.id)

        return Response(
            self.serializer_class(user).data, status=status.HTTP_200_OK)
