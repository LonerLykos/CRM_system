from rest_framework.generics import ListAPIView
from apps.crm.selectors.groups_selector import GroupsSelector
from apps.crm.serializers.groups_serializers import GroupsSerializer


class GroupsListView(ListAPIView):
    serializer_class = GroupsSerializer
    pagination_class = None

    def get_queryset(self):
        return GroupsSelector().list()
