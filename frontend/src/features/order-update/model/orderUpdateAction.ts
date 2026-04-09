'use server'

import {ISearchParams} from "@/shared/model";
import {orderUpdateSchema} from "@/features/order-update";
import {redirect} from "next/navigation";
import {rebuildParams} from "@/shared/libs";
import {orderService} from "@/entities/order";
import {ICommentResponse} from "@/entities/comment";


export async function orderUpdateAction(formData: FormData) {
    console.log(formData)
    const rawParams = formData.get('params')
    const params: ISearchParams = (typeof rawParams === 'string')
        ? JSON.parse(rawParams)
        : {}

    formData.delete('params')
    const rawData = Object.fromEntries(formData.entries())
    const validatedFields = orderUpdateSchema.safeParse(rawData)

    if (!validatedFields.success) {
        const errorMsg = validatedFields.error.issues[0].message
        redirect(`/crm?${rebuildParams(params, {error: errorMsg})}`)
    }

    // console.log(validatedFields.data)

    // if (Object.keys(params).length >= 1 && params.update_order) {
    //     const {ok, error} = await orderService.updateOrder<ICommentResponse>(
    //         validatedFields.data,
    //         params.update_order,
    //     )
    // }
}

