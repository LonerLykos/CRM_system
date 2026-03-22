from rest_framework import serializers
from apps.crm.models.comments_model import CommentsModel


class CommentsSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.name", read_only=True)
    surname = serializers.CharField(source="user.surname", read_only=True)
    class Meta:
        model = CommentsModel
        fields = (
            "id",
            "comment",
            "name",
            "surname",
            "created_at",
        )
        read_only_fields = (
            "id",
            "name",
            "surname",
            "created_at",
        )


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentsModel
        fields = ("comment",)

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)



