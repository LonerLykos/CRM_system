from rest_framework import serializers

from apps.crm.models.group_model import GroupModel
from apps.crm.models.orders_model import OrdersModel
from apps.crm.serializers.comments_serializers import CommentsSerializer


class OrdersSerializer(serializers.ModelSerializer):
    comments = CommentsSerializer(many=True, read_only=True)
    manager = serializers.CharField(source="manager.surname", read_only=True, default=None)

    group = serializers.PrimaryKeyRelatedField(
        queryset=GroupModel.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = OrdersModel
        fields = (
            "id", "name", "surname", "email", "phone", "age", "course",
            "course_format", "course_type", "sum", "already_paid",
            "created_at", "utm", "msg", "status", "group", "manager", "comments"
        )
        read_only_fields = ("id", "created_at")

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.group:
            representation['group'] = instance.group.name
        return representation