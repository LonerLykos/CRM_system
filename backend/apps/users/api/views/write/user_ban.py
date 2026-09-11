from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.serializers.serializers import UserResponseSerializer
from apps.users.services.user_service import UserService


class _UserBanStateView(APIView):
    permission_classes = [IsAdminUser, IsActiveUser, IsUnbannedUser]
    serializer_class = UserResponseSerializer
    is_banned: bool

    def patch(self, request, pk):
        user = UserService.set_banned(pk, self.is_banned, request.user.id)

        return Response(
            self.serializer_class(user).data, status=status.HTTP_200_OK)


@extend_schema_view(
    patch=extend_schema(
        request=None,
        responses={200: UserResponseSerializer},
        summary='Ban a user (admin)',
        description=(
            'Sets `is_banned=true` on the user given by the path `pk`. Idempotent: '
            'banning an already banned user changes nothing and still returns 200. '
            'Takes no request body. Returns the user. Admin-only; an admin cannot '
            'ban their own account (403).'
        ),
    )
)
class UserBanView(_UserBanStateView):
    is_banned = True


@extend_schema_view(
    patch=extend_schema(
        request=None,
        responses={200: UserResponseSerializer},
        summary='Unban a user (admin)',
        description=(
            'Sets `is_banned=false` on the user given by the path `pk`. Idempotent: '
            'unbanning a user who is not banned changes nothing and still returns 200. '
            'Takes no request body. Returns the user. Admin-only.'
        ),
    )
)
class UserUnbanView(_UserBanStateView):
    is_banned = False
