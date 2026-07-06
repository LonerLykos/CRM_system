from config import settings
from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.services.user_service import UserService


class UserRestorePasswordView(APIView):
    permission_classes = [IsAdminUser, IsActiveUser, IsUnbannedUser]

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='RestorePasswordResponse',
                fields={
                    'details': serializers.CharField(
                        help_text='Human-readable confirmation, e.g. "User: John, ID: 5 created"'
                    ),
                    'link': serializers.CharField(
                        help_text='Full URL for the user to set a new password (FRONTEND_URL/set-password/<token>)'
                    ),
                    'verify_token': serializers.CharField(
                        help_text='One-time PasswordToken string (also embedded in `link`)'
                    ),
                },
            ),
        },
        summary='Restore (reset) a user password',
        description=(
            'Generates a new one-time PasswordToken for the given user, '
            'invalidates any previously set password, and returns the token '
            'together with a ready-to-use password-set link. '
            'Admin-only endpoint.'
        ),
    )
    def patch(self, request, *args, **kwargs):
        user_id = self.kwargs['pk']
        token, user = UserService.user_restore_password(user_id)
        url = f'{settings.FRONTEND_URL}/set-password/{token}'
        response = Response({
            'details': f'User: {user.name}, ID: {user.id} created',
            'link': url,
            'verify_token': str(token),
        }, status.HTTP_200_OK)
        return response
