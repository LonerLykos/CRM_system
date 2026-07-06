from config import settings
from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.serializers.serializers import UserCreateSerializer
from apps.users.services.user_service import UserService


class UserCreateView(APIView):
    permission_classes = [IsAdminUser, IsActiveUser, IsUnbannedUser]
    serializer_class = UserCreateSerializer

    @extend_schema(
        request=UserCreateSerializer,
        responses={
            201: inline_serializer(
                name='UserCreateResponse',
                fields={
                    'details': serializers.CharField(help_text='Human-readable confirmation, e.g. "User: John, ID: 5 created"'),
                    'link': serializers.CharField(help_text='One-time set-password URL for the new user (frontend).'),
                    'verify_token': serializers.CharField(help_text='Raw one-time password token embedded in the link.'),
                },
            ),
        },
        summary='Create a user (admin)',
        description=(
            'Creates a new user and issues a one-time password-setup token. Returns '
            'the set-password link and the raw token so an admin can hand it off. '
            'Admin-only.'
        ),
    )
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
