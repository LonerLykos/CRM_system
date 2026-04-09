'use server'

import {commentSchema} from "@/features/comment-create";
import {redirect} from "next/navigation";
import {rebuildParams} from "@/shared/libs";
import {commentService} from "@/entities/comment";
import {ISearchParams} from "@/shared/model";
import {revalidatePath} from "next/cache";


export async function commentAction(formData: FormData) {
    const comment = formData.get('comment')
    const validatedFields = commentSchema.safeParse({comment: comment})

    const rawParams = formData.get('params')
    const params: ISearchParams = (typeof rawParams === 'string')
        ? JSON.parse(rawParams)
        : {}

    if (!validatedFields.success) {
        const errorMsg = validatedFields.error.issues[0].message
        redirect(`/crm?${rebuildParams(params, {error: errorMsg})}`)
    }

    if (Object.keys(params).length >= 1 && params.orderId) {
        const {ok, status, error} = await commentService.createComment(
            validatedFields.data,
            params.orderId
        )

        if (ok) {
            revalidatePath('/', 'layout')
            redirect(`/crm?${rebuildParams(params, {error: ''})}`)
        }

        if (!ok) {
            if (status === 500) {
                redirect(`/crm?${rebuildParams(
                    params,
                    {error: 'The server is not responding'}
                )}`)
            } else if ('detail' in error) {
                redirect(`/crm?${rebuildParams(
                    params,
                    {error: error.detail as string}
                )}`)
            } else if ('statusText' in error) {
                redirect(`/crm?${rebuildParams(
                    params,
                    {error: error.statusText as string}
                )}`)
            }
        }
    } else {
        redirect(`/crm?${rebuildParams(
            params,
            {error: 'You need to choose order'}
        )}`)
    }
}
