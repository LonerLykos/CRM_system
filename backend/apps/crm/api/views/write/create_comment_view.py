from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.crm.serializers.comments_serializers import CommentsSerializer
from apps.crm.services.comment_services import CommentService


class CreateCommentView(APIView):
    def post(self, request, pk):
        serializer = CommentsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = CommentService(user=request.user)

        comment = service.add_comment(
            order_id=pk,
            text=serializer.validated_data['comment']
        )

        return Response(CommentsSerializer(comment).data, status=status.HTTP_201_CREATED)