from rest_framework import serializers
from apps.crm.models.comments_model import CommentsModel


class CommentsSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    class Meta:
        model = CommentsModel
        fields = (
            "comment",
            "user_name",
        )


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentsModel
        fields = ("comment",)

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)



