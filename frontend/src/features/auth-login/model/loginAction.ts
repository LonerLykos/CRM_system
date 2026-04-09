'use server'

import {redirect} from 'next/navigation'
import {revalidatePath} from "next/cache";
import {loginSchema} from "@/features/auth-login";
import {authService} from '@/entities/auth'
import {setCookies} from "@/shared/libs";


export async function loginAction(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries())
    const validatedFields = loginSchema.safeParse(rawData)

    if (!validatedFields.success) {
        const errorMsg = validatedFields.error.issues[0].message
        redirect(`/auth?error=${encodeURIComponent(errorMsg)}`)
    }

    const {ok, status, result, error} = await authService.login(validatedFields.data)

    if (ok) {
        await setCookies(result)
        revalidatePath('/', 'layout')
        redirect('/crm')
    }

    if (!ok) {
        if (status === 500) {
            redirect(`/auth?error=${encodeURIComponent('The server is not responding')}`)
        } else if ('detail' in error) {
            redirect(`/auth?error=${encodeURIComponent(error.detail as string)}`)
        } else if ('statusText' in error) {
            redirect(`/auth?error=${encodeURIComponent(error.statusText as string)}`)
        }
    }
}
