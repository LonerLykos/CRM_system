'use client'

import {useActionState, useEffect, useRef, useState} from "react";
import {ISearchParams} from "@/shared/model";
import {SubmitButton} from "@/shared/ui";
import {commentAction} from "../model/commentAction";
import s from './CommentForm.module.sass';

interface CommentFormProp {
    params: ISearchParams
    disabled?: boolean
}

export const CommentForm = ({params, disabled}: CommentFormProp) => {
    const [state, dispatch, isPending] = useActionState(commentAction, null)
    const [comment, setComment] = useState('')
    const [clearedAt, setClearedAt] = useState<number | null>(null)
    const inFlight = useRef(false)

    useEffect(() => {
        if (!isPending) inFlight.current = false
    }, [isPending])

    if (state?.ok && state.at !== clearedAt) {
        setClearedAt(state.at)
        setComment('')
    }

    const canSubmit = comment.trim().length > 0 && !disabled

    return (
        <form
            action={dispatch}
            className={s.form}
            onSubmit={(e) => {
                if (inFlight.current || !canSubmit) {
                    e.preventDefault()
                    return
                }
                inFlight.current = true
            }}
        >
            <input type='hidden' name='params' value={JSON.stringify(params)}/>
            <input
                type='text'
                name='comment'
                placeholder='Write a comment…'
                className={s.input}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={disabled || isPending}
            />
            <SubmitButton className={s.button} disabled={!canSubmit} pendingLabel='Adding…'>
                Add comment
            </SubmitButton>

            {state?.ok === false && (
                <p className={s.error} role='alert'>{state.error}</p>
            )}
        </form>
    )
}
