from rest_framework import serializers

from apps.users.models import UserModel


class OrderStatisticSerializer(serializers.Serializer):
    total = serializers.IntegerField(read_only=True)
    new = serializers.IntegerField(read_only=True)
    in_work = serializers.IntegerField(read_only=True)
    agree = serializers.IntegerField(read_only=True)
    disagree = serializers.IntegerField(read_only=True)
    dubbing = serializers.IntegerField(read_only=True)


class UserBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ("id", "email", "name", "surname")
        read_only_fields = ("id",)


class UserCreateSerializer(UserBaseSerializer):
    def create(self, validated_data):
        return UserModel.objects.create_user(**validated_data)


class UserResponseSerializer(UserBaseSerializer):
    class Meta:
        model = UserModel
        fields = UserBaseSerializer.Meta.fields + (
            "is_active",
            "is_banned",
            "is_staff",
            "last_login",
            "avatar_hash",
            "created_at",
            "updated_at",
        )

        read_only_fields = UserBaseSerializer.Meta.read_only_fields + (
            "is_active",
            "is_banned",
            "is_staff",
            "last_login",
            "avatar_hash",
            "created_at",
            "updated_at",
            "is_superuser",
        )


class UserListSerializer(UserResponseSerializer):
    statistic = serializers.SerializerMethodField()

    class Meta(UserResponseSerializer.Meta):
        fields = UserResponseSerializer.Meta.fields + ("statistic",)

    def get_statistic(self, obj) -> dict:
        return {
            "total": getattr(obj, "stat_total", 0) or 0,
            "new": getattr(obj, "stat_new", 0) or 0,
            "in_work": getattr(obj, "stat_in_work", 0) or 0,
            "agree": getattr(obj, "stat_agree", 0) or 0,
            "disagree": getattr(obj, "stat_disagree", 0) or 0,
            "dubbing": getattr(obj, "stat_dubbing", 0) or 0,
        }

