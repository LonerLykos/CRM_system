import {ICommentResponse} from "@/entities/comment";
import {formatDate} from "@/shared/libs";
import s from './CommentDetail.module.sass';

interface CommentProp {
    comment: ICommentResponse
}

export const CommentDetail = async ({comment}: CommentProp) => {

    return (
        <div className={s.commentCard}>
            <p>{comment.comment}</p>
            <p>{comment.name}</p>
            <p>{comment.surname}</p>
            <p>{formatDate(comment.created_at)}</p>
        </div>
    )
}