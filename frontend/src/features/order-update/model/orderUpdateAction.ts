'use server'

import {ISearchParams} from "@/shared/model";
import {orderUpdateSchema} from "@/features/order-update";
import {redirect} from "next/navigation";
import {rebuildParams} from "@/shared/libs";
import {orderService} from "@/entities/order";
import {revalidatePath} from "next/cache";


export async function orderUpdateAction(formData: FormData) {
    const rawParams = formData.get('params')
    const params: ISearchParams = (typeof rawParams === 'string')
        ? JSON.parse(rawParams)
        : {}

    formData.delete('params')

    const rawOriginal = formData.get('__original')
    formData.delete('__original')
    const original: Record<string, string> = (typeof rawOriginal === 'string')
        ? JSON.parse(rawOriginal)
        : {}

    const rawData = Object.fromEntries(formData.entries())

    // True PATCH: keep only the fields the manager actually changed. Untouched
    // fields — including possibly-malformed legacy data (e.g. an old phone) —
    // are neither validated nor sent, so they can't block the update.
    const changed: Record<string, FormDataEntryValue> = {}
    for (const [key, value] of Object.entries(rawData)) {
        if (String(value) !== String(original[key] ?? '')) {
            changed[key] = value
        }
    }

    // Keep sum & already_paid together so "already_paid <= sum" validates against
    // the real pair even when only one of the two was edited.
    if (('sum' in changed) !== ('already_paid' in changed)) {
        if ('sum' in changed && rawData.already_paid !== undefined) {
            changed.already_paid = rawData.already_paid
        } else if ('already_paid' in changed && rawData.sum !== undefined) {
            changed.sum = rawData.sum
        }
    }

    if (!params.update_order) {
        redirect(`/crm?${rebuildParams(params, {error: 'No order selected for update'})}`)
    }

    // Nothing changed — close the modal without a pointless request.
    if (Object.keys(changed).length === 0) {
        redirect(`/crm?${rebuildParams(params, {update_order: ''})}`)
    }

    const validatedFields = orderUpdateSchema.safeParse(changed)

    if (!validatedFields.success) {
        const errorMsg = validatedFields.error.issues[0].message
        redirect(`/crm?${rebuildParams(params, {error: errorMsg})}`)
    }

    const {ok, status, error} = await orderService.updateOrder(
        params.update_order!,
        validatedFields.data,
    )

    if (ok) {
        revalidatePath('/crm')
        redirect(`/crm?${rebuildParams(params, {update_order: ''})}`)
    }

    if (!ok) {
        if (status === 500) {
            redirect(`/crm?${rebuildParams(params, {error: 'The server is not responding'})}`)
        } else if (error && 'detail' in error) {
            redirect(`/crm?${rebuildParams(params, {error: error.detail as string})}`)
        } else if (error && 'statusText' in error) {
            redirect(`/crm?${rebuildParams(params, {error: error.statusText as string})}`)
        } else {
            redirect(`/crm?${rebuildParams(params, {error: 'Update failed'})}`)
        }
    }
}
