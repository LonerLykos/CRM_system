'use server'

import {commentSchema} from "@/features/comment-create";
import {extractApiError} from "@/shared/libs";
import {commentService} from "@/entities/comment";
import {ISearchParams} from "@/shared/model";
import {revalidatePath} from "next/cache";

export type CommentActionState =
    | {ok: true; at: number}
    | {ok: false; error: string}
    | null;

export async function commentAction(
    prevState: CommentActionState,
    formData: FormData,
): Promise<CommentActionState> {
    const rawParams = formData.get('params')
    const params: ISearchParams = (typeof rawParams === 'string')
        ? JSON.parse(rawParams)
        : {}

    const validatedFields = commentSchema.safeParse({comment: formData.get('comment')})

    if (!validatedFields.success) {
        return {ok: false, error: validatedFields.error.issues[0].message}
    }

    if (!params.orderId) {
        return {ok: false, error: 'You need to choose order'}
    }

    const {ok, status, error} = await commentService.createComment(
        validatedFields.data,
        params.orderId
    )

    if (ok) {
        revalidatePath('/', 'layout')
        return {ok: true, at: Date.now()}
    }

    return {
        ok: false,
        error: status === 500
            ? 'The server is not responding'
            : extractApiError(error, 'Failed to add comment'),
    }
}
