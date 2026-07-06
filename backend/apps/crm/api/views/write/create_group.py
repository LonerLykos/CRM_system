from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.crm.serializers.groups_serializers import GroupsSerializer
from apps.crm.services.group_service import GroupsService


class AddGroupView(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser, IsUnbannedUser]
    serializer_class = GroupsSerializer

    @extend_schema(
        request=GroupsSerializer,
        responses={
            201: GroupsSerializer,
            200: GroupsSerializer,
        },
        summary='Create a group (idempotent)',
        description=(
            'Creates a group with the given (normalized) name. Idempotent: if a '
            'group with that name already exists it is returned as-is with 200 '
            'instead of a validation error; a newly created group returns 201.'
        ),
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = GroupsService()

        group, created = service.create_group(name=serializer.validated_data['name'])
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(self.serializer_class(group).data, status=status_code)
