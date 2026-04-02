from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.crm.serializers.groups_serializers import GroupsSerializer
from apps.crm.services.group_service import GroupsService


class AddGroupView(APIView):
    serializer_class = GroupsSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = GroupsService()

        group, created = service.create_group(name=serializer.validated_data['name'])
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(self.serializer_class(group).data, status=status_code)
