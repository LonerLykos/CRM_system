from rest_framework import serializers
from apps.users.models import UserModel


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ("id", "email", "name", "surname", "is_active", "is_banned", "last_login", "avatar_hash")
        read_only_fields = ("id", "is_active", "is_staff", "is_superuser", "last_login", "avatar_hash")
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        user = UserModel(**validated_data)
        user.set_unusable_password()
        user.is_active = False
        user.save()
        return user
