from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from apps.crm.models.group_model import GroupModel

DUPLICATE_GROUP_MESSAGE = 'Group with this name already exists'


class GroupsSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        max_length=100,
        validators=[
            UniqueValidator(
                queryset=GroupModel.objects.all(),
                message=DUPLICATE_GROUP_MESSAGE,
            ),
        ],
    )

    class Meta:
        model = GroupModel
        fields = ("id", "name",)
        read_only_fields = ("id",)
