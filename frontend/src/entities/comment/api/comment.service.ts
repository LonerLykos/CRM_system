import {ICommentRequest, ICommentResponse} from "@/entities/comment";
import {api} from "@/shared/api";
import {urls} from "@/shared/config";


export const commentService = {
    createComment: (data: ICommentRequest, id: string) => api.post<ICommentResponse, ICommentRequest>(
        `${urls.crm.createComment(id)}`,
        data
    )
}
