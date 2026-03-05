'use server'

import {redirect} from 'next/navigation'
import {loginSchema} from './loginSchema'
import {authService} from '@/entities/auth'
import {revalidatePath} from "next/cache";
import {setCookies} from "@/shared/libs/cookies/set-cookies";


export async function loginAction(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries())
    const validatedFields = loginSchema.safeParse(rawData)

    if (!validatedFields.success) {
        const errorMsg = validatedFields.error.issues[0].message
        redirect(`/auth?error=${encodeURIComponent(errorMsg)}`)
    }

    const response = await authService.login(validatedFields.data)

    if (response && 'access_token' in response && 'refresh_token' in response) {
        await setCookies(response)
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