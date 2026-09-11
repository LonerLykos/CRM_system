from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.serializers.serializers import UserResponseSerializer
from apps.users.services.user_service import UserService


class _UserActiveStateView(APIView):
    permission_classes = [IsAdminUser, IsActiveUser, IsUnbannedUser]
    serializer_class = UserResponseSerializer
    is_active: bool

    def patch(self, request, pk):
        user = UserService.set_active(pk, self.is_active, request.user.id)

        return Response(
            self.serializer_class(user).data, status=status.HTTP_200_OK)


@extend_schema_view(
    patch=extend_schema(
        request=None,
        responses={200: UserResponseSerializer},
        summary='Activate a user (admin)',
        description=(
            'Sets `is_active=true` on the user given by the path `pk`. Idempotent: '
            'activating an already active user changes nothing and still returns 200. '
            'Takes no request body. Returns the user. Admin-only.'
        ),
    )
)
class UserActivateView(_UserActiveStateView):
    is_active = True


@extend_schema_view(
    patch=extend_schema(
        request=None,
        responses={200: UserResponseSerializer},
        summary='Deactivate a user (admin)',
        description=(
            'Sets `is_active=false` on the user given by the path `pk`. Idempotent: '
            'deactivating an inactive user changes nothing and still returns 200. '
            'Takes no request body. Returns the user. Admin-only; an admin cannot '
            'deactivate their own account (403).'
        ),
    )
)
class UserDeactivateView(_UserActiveStateView):
    is_active = False
