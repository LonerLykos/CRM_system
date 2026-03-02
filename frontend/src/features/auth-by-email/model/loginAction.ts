'use server'

import {redirect} from 'next/navigation'
import {loginSchema} from './loginSchema'
import {authService} from '@/entities/auth'
import {revalidatePath} from "next/cache";
import {cookies} from "next/headers";

export async function loginAction(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries())
    const validatedFields = loginSchema.safeParse(rawData)

    if (!validatedFields.success) {
        const errorMsg = validatedFields.error.issues[0].message
        redirect(`/auth?error=${encodeURIComponent(errorMsg)}`)
    }

    const response = await authService.login(validatedFields.data)

    if (response && 'access_token' in response && 'refresh_token' in response) {
        const cookiesStore = await cookies()
        const cookiesOptions = {
            httponly: true,
            secure: false,
            samesite: 'Lax',
            path: '/',
        }

        cookiesStore.set('access_token', response.access_token, cookiesOptions)
        cookiesStore.set('refresh_token', response.refresh_token, cookiesOptions)
    }

    if (response && 'detail' in response) {
        redirect(`/auth?error=${encodeURIComponent(response.detail as string)}`)
    } else if (response && 'statusText' in response) {
        redirect(`/auth?error=${encodeURIComponent(response.statusText as string)}`)
    } else if (!response) {
        redirect(`/auth?error=${encodeURIComponent('Сервер не відповідає')}`)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}