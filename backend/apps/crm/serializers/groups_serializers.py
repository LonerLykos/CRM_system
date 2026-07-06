from rest_framework import serializers

from apps.crm.models.group_model import GroupModel


class GroupsSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=100, validators=[])

    class Meta:
        model = GroupModel
        fields = ("id", "name",)
        read_only_fields = ("id",)
