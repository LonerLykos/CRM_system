export interface ICommentRequest{
    comment: string,
}

export interface ICommentResponse extends ICommentRequest{
    id: number,
    name: string,
    surname: string
    created_at: string,
}
