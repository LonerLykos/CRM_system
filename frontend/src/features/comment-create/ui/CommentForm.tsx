import {ISearchParams} from "@/shared/model";
import Form from "next/form";
import {commentAction} from "@/features/comment-create";
import s from './CommentForm.module.sass';

interface CommentFormProp {
    params: ISearchParams
    disabled?: boolean
}


export const CommentForm = async ({params, disabled}: CommentFormProp) => {
    return (
        <Form action={commentAction} className={s.form}>
            <input type='hidden' name='params' value={JSON.stringify(params)}/>
            <input
                type='text'
                name='comment'
                placeholder='Write a comment…'
                className={s.input}
                disabled={disabled}
            />
            <button type='submit' className={s.button} disabled={disabled}>Add comment</button>
        </Form>
    )
}
