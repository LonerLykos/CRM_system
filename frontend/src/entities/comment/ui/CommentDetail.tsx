import {ICommentResponse} from "@/entities/comment";
import {formatDate} from "@/shared/libs";
import s from './CommentDetail.module.sass';

interface CommentProp {
    comment: ICommentResponse
}

export const CommentDetail = async ({comment}: CommentProp) => {

    return (
        <div className={s.commentCard}>
            <div className={s.head}>
                <span className={s.author}>{comment.name} {comment.surname}</span>
                <span className={s.date}>{formatDate(comment.created_at)}</span>
            </div>
            <p className={s.text}>{comment.comment}</p>
        </div>
    )
}
