from rest_framework import serializers
from apps.crm.models.orders_model import OrdersModel
from apps.crm.serializers.comments_serializers import CommentsSerializer


class OrdersSerializer(serializers.ModelSerializer):
    comments = CommentsSerializer(many=True, read_only=True)
    manager = serializers.CharField(source="manager.name", read_only=True, default=None)
    group = serializers.CharField(source="group.name", read_only=True, default=None)
    class Meta:
        model = OrdersModel
        fields = (
            "name",
            "surname",
            "email",
            "phone",
            "age",
            "course",
            "course_format",
            "course_type",
            "sum",
            "already_paid",
            "created_at",
            "utm",
            "msg",
            "status",
            "group",
            "manager",
            "comments"
        )
        read_only_fields = ("id", "created_at")