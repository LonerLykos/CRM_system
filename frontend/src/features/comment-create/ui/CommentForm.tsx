import {ISearchParams} from "@/shared/model";
import Form from "next/form";
import {commentAction} from "@/features/comment-create";
import {SubmitButton} from "@/shared/ui";
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
            <SubmitButton className={s.button} disabled={disabled} pendingLabel='Adding…'>
                Add comment
            </SubmitButton>
        </Form>
    )
}
