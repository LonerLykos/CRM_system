from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from drf_spectacular.utils import OpenApiResponse, extend_schema
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
            400: OpenApiResponse(
                description='Validation error, e.g. a group with this name already exists.',
            ),
        },
        summary='Create a group',
        description=(
            'Creates a group with the given name (surrounding whitespace is trimmed, '
            'the case is kept as typed). Names are unique case-sensitively: "Group A" '
            'and "group a" are separate groups, while an exact duplicate returns 400.'
        ),
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = GroupsService()

        group = service.create_group(name=serializer.validated_data['name'])
        return Response(self.serializer_class(group).data, status=status.HTTP_201_CREATED)
