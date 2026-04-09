'use server'

import {ISearchParams} from "@/shared/model";
import Form from "next/form";
import {commentAction} from "@/features/comment-create";

interface CommentFormProp {
    params: ISearchParams
}


export const CommentForm = async ({params}: CommentFormProp) => {
    return (
        <Form action={commentAction}>
            <input type='hidden' name='params' value={JSON.stringify(params)}/>
            <input type='text' name='comment' placeholder='Comment...'/>
            <button type='submit'>Add comment</button>
        </Form>
    )
}
