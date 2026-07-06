from rest_framework import serializers

from apps.users.models import UserModel


class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ("id", "name", "surname", "is_staff", "avatar_hash")
