'use server'

import {redirect} from 'next/navigation'
import {setPasswordSchema} from "@/features/user-set-password";
import {api, ITokenPair} from "@/shared/api";
import {urls} from "@/shared/config";
import {extractApiError} from "@/shared/libs";


export async function setPasswordAction(token: string, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries())
    const validatedFields = setPasswordSchema.safeParse(rawData)

    if (!validatedFields.success) {
        const errorMsg = validatedFields.error.issues[0].message
        redirect(`/set-password/${token}?error=${encodeURIComponent(errorMsg)}`)
    }

    const {password} = validatedFields.data

    const {ok, status, error} = await api.post<ITokenPair, {password: string}>(
        `${urls.admin.users}/set_password/${token}`,
        {password}
    )

    if (ok) {
        redirect('/auth')
    }

    const errorMsg = status === 500
        ? 'The server is not responding'
        : extractApiError(error, 'Failed to set password')
    redirect(`/set-password/${token}?error=${encodeURIComponent(errorMsg)}`)
}
