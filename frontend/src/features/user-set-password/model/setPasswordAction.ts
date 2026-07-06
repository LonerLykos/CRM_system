'use server'

import {redirect} from 'next/navigation'
import {setPasswordSchema} from "@/features/user-set-password";
import {api, ITokenPair} from "@/shared/api";
import {urls} from "@/shared/config";


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
        // Per TZ: after setting the password the manager logs in explicitly.
        // No auto-login here — redirect to the login page.
        redirect('/auth')
    }

    if (!ok) {
        if (status === 500) {
            redirect(`/set-password/${token}?error=${encodeURIComponent('The server is not responding')}`)
        } else if ('detail' in error) {
            redirect(`/set-password/${token}?error=${encodeURIComponent(error.detail as string)}`)
        } else if ('statusText' in error) {
            redirect(`/set-password/${token}?error=${encodeURIComponent(error.statusText as string)}`)
        }
    }
}
