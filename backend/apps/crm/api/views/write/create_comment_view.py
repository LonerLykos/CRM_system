from core.permissions.is_active_user import IsActiveUser
from core.permissions.is_unbanned_user import IsUnbannedUser
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.crm.serializers.comments_serializers import CommentsSerializer
from apps.crm.services.comment_services import CommentService


class CreateCommentView(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser, IsUnbannedUser]
    serializer_class = CommentsSerializer

    @extend_schema(
        request=CommentsSerializer,
        responses={201: CommentsSerializer},
        summary='Add a comment to an order',
        description=(
            'Creates a comment authored by the current user on the order given by '
            'the path `pk`. Only the `comment` field is accepted in the request; '
            'author name/surname and timestamp are returned read-only.'
        ),
    )
    def post(self, request, pk):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = CommentService(user=request.user)

        comment = service.add_comment(
            order_id=pk,
            text=serializer.validated_data['comment']
        )

        return Response(self.serializer_class(comment).data, status=status.HTTP_201_CREATED)
