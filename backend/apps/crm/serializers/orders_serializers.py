from rest_framework import serializers
from apps.crm.models.group_model import GroupModel
from apps.crm.models.orders_model import OrdersModel
from apps.crm.serializers.comments_serializers import CommentsSerializer


class OrderBaseSerializer(serializers.ModelSerializer):
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
            "created_at", "utm", "msg", "status", "group", "manager"
        )
        read_only_fields = ("id", "created_at", "manager")

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.group:
            representation['group'] = instance.group.name
        return representation


class OrderListSerializer(OrderBaseSerializer):
    class Meta(OrderBaseSerializer.Meta):
        fields = OrderBaseSerializer.Meta.fields


class OrderDetailSerializer(OrderBaseSerializer):
    comments = CommentsSerializer(many=True, read_only=True)
    class Meta(OrderBaseSerializer.Meta):
        fields = OrderBaseSerializer.Meta.fields + ("comments",)

