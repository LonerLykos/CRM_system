from rest_framework import serializers
from apps.users.models import UserModel


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

