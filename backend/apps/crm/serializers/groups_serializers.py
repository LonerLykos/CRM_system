from rest_framework import serializers
from apps.crm.models.group_model import GroupModel


class GroupsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupModel
        fields = ("name",)
        read_only_fields = ("id",)
