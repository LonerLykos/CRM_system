from rest_framework import serializers

from apps.crm.models.group_model import GroupModel
from apps.crm.models.orders_model import OrdersModel
from apps.crm.serializers.comments_serializers import CommentsSerializer


class OrderBaseSerializer(serializers.ModelSerializer):
    manager = serializers.CharField(source="manager.surname", read_only=True, default=None)
    manager_id = serializers.IntegerField(read_only=True)

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
            "created_at", "utm", "msg", "status", "group", "manager", "manager_id"
        )
        read_only_fields = ("id", "created_at", "manager", "manager_id")

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.group:
            representation['group'] = instance.group.name
        return representation

PHONE_REGEX = r'^\+[1-9]\d{7,14}$'


class OrderUpdateSerializer(OrderBaseSerializer):

    phone = serializers.RegexField(
        PHONE_REGEX,
        max_length=20,
        required=False,
        allow_null=True,
        error_messages={'invalid': 'Invalid phone format'},
    )
    age = serializers.IntegerField(min_value=1, max_value=100, required=False, allow_null=True)
    sum = serializers.FloatField(min_value=0, required=False, allow_null=True)
    already_paid = serializers.FloatField(min_value=0, required=False, allow_null=True)

    class Meta(OrderBaseSerializer.Meta):
        fields = OrderBaseSerializer.Meta.fields

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if 'sum' in attrs or 'already_paid' in attrs:
            total = attrs.get('sum', getattr(self.instance, 'sum', None))
            paid = attrs.get('already_paid', getattr(self.instance, 'already_paid', None))
            if paid is not None and total is None:
                raise serializers.ValidationError(
                    {'already_paid': 'Already paid cannot be set without a sum'}
                )
            if paid is not None and paid > total:
                raise serializers.ValidationError(
                    {'already_paid': 'Already paid cannot be greater than sum'}
                )
        return attrs


class OrderListSerializer(OrderBaseSerializer):
    class Meta(OrderBaseSerializer.Meta):
        fields = OrderBaseSerializer.Meta.fields


class OrderDetailSerializer(OrderBaseSerializer):
    comments = CommentsSerializer(many=True, read_only=True)
    class Meta(OrderBaseSerializer.Meta):
        fields = OrderBaseSerializer.Meta.fields + ("comments",)

