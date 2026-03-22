import {ICommentResponse} from "@/entities/comment";
import {formatDate} from "@/shared/libs";

interface CommentProp {
    comment: ICommentResponse
}

export const CommentDetail = async ({comment}: CommentProp) => {

    return (
        <div>
            <p>{comment.comment}</p>
            <p>{comment.name}</p>
            <p>{comment.surname}</p>
            <p>{formatDate(comment.created_at)}</p>
        </div>
    )
}